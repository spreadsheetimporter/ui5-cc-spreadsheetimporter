import Log from 'sap/base/Log';
import { Columns, ListObject } from '../../types';
import SpreadsheetUpload from '../SpreadsheetUpload';
import OData from './OData';
import MetadataHandlerV2 from './MetadataHandlerV2';
import ODataListBinding from 'sap/ui/model/odata/v2/ODataListBinding';
import ODataModel from 'sap/ui/model/odata/v2/ODataModel';
import ODataMetaModel from 'sap/ui/model/odata/ODataMetaModel';
import MessageHandler from '../MessageHandler';
import Util from '../Util';

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class ODataV2 extends OData {
  customBinding: ODataListBinding;
  submitChangesResponse: any;
  private metadataHandler: MetadataHandlerV2;

  constructor(spreadsheetUploadController: SpreadsheetUpload, messageHandler: MessageHandler, util: Util) {
    super(spreadsheetUploadController, messageHandler, util);
    this.metadataHandler = new MetadataHandlerV2(spreadsheetUploadController);
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
    throw new Error('Method not implemented.');
  }

  async checkForErrors(model: any, binding: any, showBackendErrorMessages: Boolean): Promise<boolean> {
    // check if this.submitChangesResponse and this.submitChangesResponse.__batchResponses exist
    if (this.submitChangesResponse && this.submitChangesResponse.__batchResponses) {
      const firstResponse = this.submitChangesResponse.__batchResponses[0];
      // check if firstResponse and firstResponse.response exist and that statusCode is >= 400
      if (firstResponse && firstResponse.response && firstResponse.response.statusCode >= 400) {
        // show messages from the Messages Manager Model
        if (showBackendErrorMessages) {
          this.odataMessageHandler.displayMessages();
        }
        return true;
      }
    }
    return false;
  }

  async createCustomBinding(binding: any) {
    if (this.spreadsheetUploadController.component.getOdataType()) {
      const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel();
      await metaModel.loaded();
      const odataEntityType = metaModel.getODataEntityType(this.spreadsheetUploadController.component.getOdataType());
      const odataEntitySet = metaModel
        .getODataEntityContainer()
        .entitySet.find(item => item.entityType === `${odataEntityType.namespace}.${odataEntityType.name}`);
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
      const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel() as ODataMetaModel;
      await metaModel.loaded();
      const odataEntityType = metaModel.getODataEntityType(odataType);
      if (!odataEntityType) {
        // filter out $kind
        const availableEntities = metaModel
          .getODataEntityContainer()
          .entitySet.map(item => item.name)
          .join();
        Log.error(`Error while getting specified OData Type. ${availableEntities}`, undefined, 'SpreadsheetUpload: ODataV4');
        throw new Error(`Error while getting specified OData Type. Available Entities: ${availableEntities}`);
      }
      return odataType;
    }
  }

  getObjects(model: any, binding: any, batch: any): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async getLabelList(columns: Columns, odataType: string, excludeColumns: Columns, binding?: any) {
    const metaModel = binding.getModel().getMetaModel();
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

  resetContexts() {
    this.createContexts = [];
    this.createPromises = [];
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
    const expandParts: string[] = [];

    // Simple conversion - just take the top level navigation properties
    Object.keys(expand).forEach(navProp => {
      expandParts.push(navProp);

      // For deep expands, create paths like "Orders/Items"
      if (expand[navProp] && typeof expand[navProp] === 'object') {
        Object.keys(expand[navProp]).forEach(subNavProp => {
          if (subNavProp !== '$expand') {
            expandParts.push(`${navProp}/${subNavProp}`);
          }
        });
      }
    });

    const result = expandParts.join(',');
    console.log('V2 expand string:', result);
    return result;
  }

  fetchBatch(customBinding: ODataListBinding, batchSize: number): Promise<any> {
    const model = customBinding.getModel() as ODataModel;
    const path = MetadataHandlerV2.getResolvedPath(this.spreadsheetUploadController.binding);

    return new Promise((resolve, reject) => {
      // Use a simple approach - get all data with a single read for now
      // This will be enhanced later with proper pagination
      const urlParameters: any = {
        $inlinecount: 'allpages'
      };

      // Try to get expand parameter from the binding if available
      // For V2, we'll implement a simple approach first
      try {
        // Check if binding has expand information
        const bindingInfo = (customBinding as any).mParameters;
        if (bindingInfo && bindingInfo.expand) {
          urlParameters.$expand = bindingInfo.expand;
        }
      } catch (e) {
        // Ignore if we can't get binding parameters
        console.log('Could not get binding parameters, proceeding without expand');
      }

      // For now, fetch all data in one request to get it working
      // Later we can add proper pagination
      model.read(path, {
        urlParameters: urlParameters,
        success: (data: any) => {
          const results = data.results || [data];

          // Create contexts-like objects that Util.extractObjects expects
          const contextLikeObjects = results.map((dataItem: any) => ({
            getObject: () => dataItem,
            getPath: () => `${path}(${this._extractKey(dataItem)})`,
            data: dataItem
          }));

          console.log(`V2 fetchBatch completed: ${results.length} items fetched`);
          resolve(contextLikeObjects);
        },
        error: (error: any) => {
          console.error('Error in V2 fetchBatch:', error);
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
          getPath: () => `${path}(${this._extractKey(dataItem)})`,
          data: dataItem
        }));

        console.log(`V2 fetchBatch completed: ${allResults.length} items fetched`);
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

          console.log(`V2 batch fetched: ${results.length} items (${fetchedCount}/${totalCount})`);

          // Continue with next batch
          setTimeout(fetchNextBatch, 0);
        },
        error: (error: any) => {
          console.error('Error in V2 batch fetch:', error);
          reject(error);
        }
      });
    };

    // Start fetching
    fetchNextBatch();
  }

  /**
   * Extracts key from data item for context path creation
   */
  private _extractKey(dataItem: any): string {
    // Simple key extraction - this could be enhanced based on metadata
    if (dataItem.ID) return `'${dataItem.ID}'`;
    if (dataItem.Id) return `'${dataItem.Id}'`;
    if (dataItem.ObjectID) return `'${dataItem.ObjectID}'`;

    // Fallback to first string property that looks like a key
    for (const [key, value] of Object.entries(dataItem)) {
      if (typeof value === 'string' && (key.toLowerCase().includes('id') || key.toLowerCase().includes('key'))) {
        return `'${value}'`;
      }
    }

    return `'${JSON.stringify(dataItem)}'`;
  }

  addKeys(labelList: ListObject, entityName: string, parentEntity?: any, partner?: string) {
    // Get metadata to find key properties
    const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel();
    const entityType = metaModel.getODataEntityType(entityName);

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
