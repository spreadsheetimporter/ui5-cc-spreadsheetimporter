import Log from 'sap/base/Log';
import { Columns, ListObject } from '../../types';
import SpreadsheetUpload from '../SpreadsheetUpload';
import OData from './OData';
import MetadataHandlerV2 from './MetadataHandlerV2';
import { ODataV2RequestObjects, V2MatchedEntity } from './ODataV2RequestObjects';
import ODataListBinding from 'sap/ui/model/odata/v2/ODataListBinding';
import ODataModel from 'sap/ui/model/odata/v2/ODataModel';
import MessageHandler from '../MessageHandler';
import Util from '../Util';

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class ODataV2 extends OData {
  customBinding: ODataListBinding;
  submitChangesResponse: any;
  private metadataHandler: MetadataHandlerV2;
  private requestObjects: ODataV2RequestObjects;

  constructor(spreadsheetUploadController: SpreadsheetUpload, messageHandler: MessageHandler, util: Util) {
    super(spreadsheetUploadController, messageHandler, util);
    this.metadataHandler = new MetadataHandlerV2(spreadsheetUploadController);
    this.requestObjects = new ODataV2RequestObjects(this.metadataHandler, messageHandler, util);
  }
  create(model: any, binding: any, payload: any) {
    const submitChangesPromise = (binding: ODataListBinding, payload: any) => {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        let context = (this.customBinding.getModel() as ODataModel).createEntry(this.customBinding.sDeepPath, {
          properties: payload,
          success: () => {
            resolve(context);
          },
          error: (error: Error) => {
            reject(error);
          }
        });
      });
    };
    return submitChangesPromise(this.customBinding, payload);
  }

  createAsync(model: any, binding: any, payload: any) {
    const returnObject = this.create(model, this.customBinding, payload);
    this.createPromises.push(returnObject);
  }

  updateAsync(model: any, binding: any, payload: any) {
    const oDataModel = binding.getModel() as ODataModel;

    // 1) Resolve entity set and key path
    const keysFromPayload = this.metadataHandler.getKeys(binding, payload, undefined, true);
    const entitySetName = this._getEntitySetNameFromBinding(binding);
    if (!entitySetName) throw new Error('Could not resolve entity set name for update operation');

    // 2) Check draft status from prefetched data
    const matchedEntities = this.requestObjects.getMatchedEntities();
    const matchedEntry = matchedEntities.find((m: V2MatchedEntity) => Object.entries(m.keys).every(([key, value]) => payload[key] === value));

    // Determine if we need to target the draft version
    const keysForPath: Record<string, any> = { ...keysFromPayload };
    if (matchedEntry && matchedEntry.object) {
      const backendEntity = matchedEntry.object;
      const isDraft = backendEntity.HasDraftEntity || !backendEntity.IsActiveEntity;
      if (isDraft) {
        keysForPath.IsActiveEntity = false;
        payload.IsActiveEntity = false;
      } else {
        keysForPath.IsActiveEntity = true;
      }
    }

    const entityPath = '/' + oDataModel.createKey(entitySetName, keysForPath);

    // 3) Respect update config
    const updateConfig = this.spreadsheetUploadController.component.getUpdateConfig() as any;
    const fullUpdate = Boolean(updateConfig && updateConfig.fullUpdate);
    const configuredColumns = updateConfig && Array.isArray(updateConfig.columns) ? updateConfig.columns : [];

    // 4) Build payload
    const payloadToSend: Record<string, any> = {};
    for (const [property, value] of Object.entries(payload)) {
      if (property in keysForPath) continue; // never send keys in body
      if (property === 'IsActiveEntity' || property === 'HasActiveEntity' || property === 'HasDraftEntity') continue;
      const isConfigured = configuredColumns.length === 0 || configuredColumns.includes(property);
      if (!isConfigured && !fullUpdate) continue;

      // Normalize Date to yyyy-mm-dd similar to V4 path
      let normalized = value;
      if (value && typeof value === 'object' && (value as any).toISOString) {
        const d = value as any as Date;
        normalized = `${d.getUTCFullYear()}-${('0' + (d.getUTCMonth() + 1)).slice(-2)}-${('0' + d.getUTCDate()).slice(-2)}`;
      }
      payloadToSend[property] = normalized;
    }

    // 5) Execute update (merge for partial update)
    const updatePromise = new Promise((resolve, reject) => {
      // @ts-ignore merge supported in V2 update params
      oDataModel.update(entityPath, payloadToSend, {
        merge: !fullUpdate,
        success: () => resolve(true),
        error: (err: any) => reject(err)
      } as any);
    });

    this.createPromises.push(updatePromise);
  }

  async checkForErrors(model: any, binding: any, showBackendErrorMessages: Boolean): Promise<boolean> {
    // check if this.submitChangesResponse and this.submitChangesResponse.__batchResponses exist
    if (this.submitChangesResponse && this.submitChangesResponse.__batchResponses) {
      const firstResponse = this.submitChangesResponse.__batchResponses[0];
      // check if firstResponse and firstResponse.response exist and that statusCode is >= 400
      if (firstResponse && firstResponse.response && firstResponse.response.statusCode >= 400) {
        // show messages from the Messages Manager Model
        if (showBackendErrorMessages) {
          // messages data is read directly from message manager by handler
          this.odataMessageHandler.displayMessages([]);
        }
        return true;
      }
    }
    return false;
  }

  async createCustomBinding(binding: any) {
    if (this.spreadsheetUploadController.component.getOdataType()) {
      const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel() as any;
      await metaModel.loaded();
      const odataEntityType = (metaModel as any).getODataEntityType(this.spreadsheetUploadController.component.getOdataType());
      const odataEntitySet = (metaModel as any)
        .getODataEntityContainer()
        .entitySet.find((item: { entityType: string }) => item.entityType === `${odataEntityType.namespace}.${odataEntityType.name}`);
      this.customBinding = new ODataListBinding(this.spreadsheetUploadController.view.getModel() as ODataModel, `/${odataEntitySet.name}`);
    } else {
      this.customBinding = binding;
    }
  }

  async submitChanges(model: ODataModel) {
    const submitChangesPromise = (model: ODataModel) => {
      return new Promise((resolve, reject) => {
        model.submitChanges({
          success: (data: any) => {
            resolve(data);
          },
          error: (error: Error) => {
            reject(error);
          }
        });
      });
    };

    try {
      this.submitChangesResponse = await submitChangesPromise(model);
    } catch (error: any) {
      Log.error(error);
    }
  }

  async waitForCreation() {
    this.createContexts = await Promise.all(this.createPromises);
  }

  async waitForDraft(): Promise<any[]> {
    const activateActionsPromises = [];
    for (let index = 0; index < this.createContexts.length; index++) {
      const element = this.createContexts[index];
      if (this.draftController.getDraftContext().hasDraft(element)) {
        // this will fail i.e. in a Object Page Table, maybe better way to check, hasDraft is still true
        try {
          const checkImport = this.draftController.getDraftContext().getODataDraftFunctionImportName(element, 'ActivationAction');
          if (checkImport !== null) {
            const activationPromise = this.draftController.activateDraftEntity(element, true, undefined);
            activateActionsPromises.push(activationPromise);
          }
        } catch (error) {
          Log.error('Activate Draft failed', error as Error, 'SpreadsheetUpload: OdataV2');
        }
      }
    }
    return Promise.all(activateActionsPromises);
  }

  async getOdataType(binding: any, odataType: any) {
    if (!odataType) {
      return binding._getEntityType().entityType;
    } else {
      const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel() as any;
      await metaModel.loaded();
      const odataEntityType = (metaModel as any).getODataEntityType(odataType);
      if (!odataEntityType) {
        // filter out $kind
        const availableEntities = (metaModel as any)
          .getODataEntityContainer()
          .entitySet.map((item: { name: string }) => item.name)
          .join();
        Log.error(`Error while getting specified OData Type. ${availableEntities}`, undefined, 'SpreadsheetUpload: ODataV4');
        throw new Error(`Error while getting specified OData Type. Available Entities: ${availableEntities}`);
      }
      return odataType;
    }
  }

  async getObjects(model: any, binding: any, batch: any): Promise<any> {
    const entitySetName = this._getEntitySetNameFromBinding(binding);
    if (!entitySetName) {
      Log.warning('Could not resolve entity set name, skipping prefetch', undefined, 'SpreadsheetUpload: ODataV2');
      return [];
    }
    return this.requestObjects.getObjects(model as ODataModel, binding, batch, entitySetName);
  }

  async getLabelList(columns: Columns, odataType: string, excludeColumns: Columns, binding?: any) {
    let metaModel: any;
    if (binding) {
      metaModel = binding.getModel().getMetaModel();
      // Cache the MetaModel for later calls without binding (e.g. deep export recursive sheets)
      this.metadataHandler.setMetaModel(metaModel);
    } else {
      metaModel = this.metadataHandler.getMetaModel();
    }
    await metaModel.loaded();
    const odataEntityType = metaModel.getODataEntityType(odataType);
    return this.getMetadataHandler().getLabelList(columns, odataType, odataEntityType, excludeColumns);
  }

  async getKeyList(odataType: string, binding: any) {
    const metaModel = binding.getModel().getMetaModel();
    await metaModel.loaded();
    const odataEntityType = metaModel.getODataEntityType(odataType);
    return this.getMetadataHandler().getKeyList(odataEntityType);
  }

  resetContexts(model?: any) {
    this.createContexts = [];
    this.createPromises = [];

    // Reset pending changes in the model to prevent "key already exists" errors on re-upload
    // This follows SAP best practice for error handling - see issue #786
    if (model && typeof model.resetChanges === 'function') {
      Log.debug('Resetting pending changes in OData V2 model', undefined, 'SpreadsheetUpload: ODataV2');
      model.resetChanges();
    }
  }

  getMetadataHandler(): MetadataHandlerV2 {
    return this.metadataHandler;
  }

  getODataEntitiesRecursive(entityName: string, deepLevel: number): any {
    return this.metadataHandler.getODataEntitiesRecursive(entityName, deepLevel);
  }

  getBindingFromBinding(binding: ODataListBinding, expand?: any): ODataListBinding {
    const path = binding.getPath();
    const model = binding.getModel() as ODataModel;

    // Create binding parameters for V2
    const bindingParameters: any = {};

    // Add expand parameters if provided - V2 expects comma-separated string
    if (expand && Object.keys(expand).length > 0) {
      bindingParameters.expand = this._convertExpandToV2Format(expand);
    }

    // Create new binding with expand parameters
    return model.bindList(path, null, [], [], bindingParameters) as ODataListBinding;
  }

  /**
   * Converts V4-style nested expand object to V2-style comma-separated string
   */
  private _convertExpandToV2Format(expand: any): string {
    const parts: string[] = [];

    const walk = (node: any, prefix: string[] = []) => {
      Object.keys(node).forEach(key => {
        if (key === '$expand') {
          walk(node[key], prefix);
          return;
        }
        const path = [...prefix, key];
        parts.push(path.join('/'));
        const child = node[key];
        if (child && typeof child === 'object') {
          walk(child, path);
        }
      });
    };

    walk(expand, []);
    const unique = Array.from(new Set(parts));
    const result = unique.join(',');
    Log.debug(`V2 expand string: ${result}`, undefined, 'SpreadsheetUpload: ODataV2');
    return result;
  }

  fetchBatch(customBinding: ODataListBinding, batchSize: number): Promise<any> {
    const model = customBinding.getModel() as ODataModel;
    const path = MetadataHandlerV2.getResolvedPath(this.spreadsheetUploadController.binding);

    return new Promise((resolve, reject) => {
      // Prepare base parameters and attempt a first read to detect count
      const baseUrlParameters: any = { $inlinecount: 'allpages' };

      // Try to get expand parameter from the binding if available
      try {
        const bindingInfo = (customBinding as any).mParameters;
        if (bindingInfo && bindingInfo.expand) {
          baseUrlParameters.$expand = bindingInfo.expand;
        }
      } catch (e) {
        Log.debug('Could not get binding parameters, proceeding without expand', undefined, 'SpreadsheetUpload: ODataV2');
      }

      // Initial read to check for count and decide pagination
      model.read(path, {
        urlParameters: baseUrlParameters,
        success: (data: any) => {
          const results = data.results || [data];
          const totalCount = Number((data && (data.__count || data['__count'])) || results.length);

          if (Number.isFinite(totalCount) && totalCount > results.length) {
            // Use paginated reads
            this._fetchAllDataV2(model, path, baseUrlParameters, totalCount, batchSize, resolve, reject);
            return;
          }

          // Single-shot result OK
          const contextLikeObjects = results.map((dataItem: any) => ({
            getObject: () => dataItem,
            getPath: () => path,
            data: dataItem
          }));

          Log.debug(`V2 fetchBatch completed: ${results.length} items fetched`, undefined, 'SpreadsheetUpload: ODataV2');
          resolve(contextLikeObjects);
        },
        error: (error: any) => {
          Log.error('Error in V2 fetchBatch', error, 'SpreadsheetUpload: ODataV2');
          reject(error);
        }
      });
    });
  }

  /**
   * Fetches all data using OData V2 model.read() method with proper pagination
   */
  private _fetchAllDataV2(
    model: ODataModel,
    path: string,
    baseUrlParameters: any,
    totalCount: number,
    batchSize: number,
    resolve: (value: any) => void,
    reject: (reason?: any) => void
  ): void {
    let allResults: any[] = [];
    let fetchedCount = 0;

    const fetchNextBatch = () => {
      if (fetchedCount >= totalCount) {
        // Create contexts-like objects that Util.extractObjects expects
        const contextLikeObjects = allResults.map(dataItem => ({
          getObject: () => dataItem,
          getPath: () => path,
          data: dataItem
        }));

        Log.debug(`V2 fetchBatch completed: ${allResults.length} items fetched`, undefined, 'SpreadsheetUpload: ODataV2');
        resolve(contextLikeObjects);
        return;
      }

      const remainingCount = totalCount - fetchedCount;
      const currentBatchSize = Math.min(batchSize, remainingCount);

      const urlParameters = {
        ...baseUrlParameters,
        $skip: fetchedCount,
        $top: currentBatchSize
      };

      model.read(path, {
        urlParameters: urlParameters,
        success: (data: any) => {
          const results = data.results || [data];
          allResults.push(...results);
          fetchedCount += results.length;

          Log.debug(`V2 batch fetched: ${results.length} items (${fetchedCount}/${totalCount})`, undefined, 'SpreadsheetUpload: ODataV2');

          // Continue with next batch
          setTimeout(fetchNextBatch, 0);
        },
        error: (error: any) => {
          Log.error('Error in V2 batch fetch', error, 'SpreadsheetUpload: ODataV2');
          reject(error);
        }
      });
    };

    // Start fetching
    fetchNextBatch();
  }

  /**
   * Resolves the entity set name for the current binding/type
   */
  private _getEntitySetNameFromBinding(binding: any): string | undefined {
    const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel() as any;
    const odataType = this.spreadsheetUploadController.getOdataType();
    const odataEntityType = (metaModel as any).getODataEntityType(odataType);
    const container = (metaModel as any).getODataEntityContainer();
    const entitySet = container.entitySet.find((item: any) => item.entityType === `${odataEntityType.namespace}.${odataEntityType.name}`);
    return entitySet?.name;
  }

  addKeys(labelList: ListObject, entityName: string, parentEntity?: any, partner?: string) {
    // Get metadata to find key properties
    const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel() as any;
    const entityType = (metaModel as any).getODataEntityType(entityName);

    if (entityType && entityType.key && entityType.key.propertyRef) {
      entityType.key.propertyRef.forEach((keyRef: any) => {
        const keyName = keyRef.name;

        // Check if key is already in labelList
        if (!labelList.has(keyName)) {
          // Find the property definition
          const property = entityType.property.find((prop: any) => prop.name === keyName);
          if (property) {
            labelList.set(keyName, {
              label: property['sap:label'] || keyName,
              type: property.type,
              maxLength: property.maxLength,
              $XYZKey: true // Mark as key property
            });
          }
        } else {
          // Mark existing property as key
          const existingProperty = labelList.get(keyName);
          if (existingProperty) {
            existingProperty.$XYZKey = true;
          }
        }
      });
    }
  }
}
