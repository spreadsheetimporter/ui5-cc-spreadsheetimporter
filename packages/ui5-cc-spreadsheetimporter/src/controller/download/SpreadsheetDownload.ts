import ManagedObject from 'sap/ui/base/ManagedObject';
import { EntityDefinition, EntityObject, PropertyWithOrder, DeepDownloadConfig } from '../../types';
import SpreadsheetUpload from '../SpreadsheetUpload';
import Component from '../../Component';
import OData from '../odata/OData';
import Util from '../Util';
import SpreadsheetGenerator from './SpreadsheetGenerator';
import DataAssigner from './DataAssigner';
import Log from 'sap/base/Log';
/**
 * @namespace cc.spreadsheetimporter.download.XXXnamespaceXXX
 */
export default class SpreadsheetDownload extends ManagedObject {
  spreadsheetUploadController: SpreadsheetUpload;
  component: Component;
  odataHandler: OData;
  private spreadsheetGenerator: SpreadsheetGenerator;
  private dataAssigner: DataAssigner;

  constructor(spreadsheetUploadController: SpreadsheetUpload, component: Component, odataHandler: OData) {
    super();
    this.spreadsheetUploadController = spreadsheetUploadController;
    this.component = component;
    this.odataHandler = odataHandler;
    this.spreadsheetGenerator = new SpreadsheetGenerator(spreadsheetUploadController, component, odataHandler);
    this.dataAssigner = new DataAssigner();
  }

  // Function to extract the properties from input config and metadata
  async _extractProperties(proConfigColumns: any, entityMetadata: any, entityType: string): Promise<PropertyWithOrder[]> {
    const labelList = await this.odataHandler.getLabelList([], entityType, this.component.getExcludeColumns());
    let properties: PropertyWithOrder[] = [];

    for (let prop in proConfigColumns) {
      if (proConfigColumns[prop].order !== undefined && proConfigColumns[prop].data !== undefined && entityMetadata[prop]) {
        const label = labelList.get(prop);
        let headerName: string;
        if (label) {
          headerName = `${label.label} [${entityType.split('.').pop()}][${prop}]`;
        } else {
          headerName = `${prop} [${entityType.split('.').pop()}][${prop}]`;
        }
        properties.push({ name: headerName, order: proConfigColumns[prop].order });
      } else if (typeof proConfigColumns[prop] === 'object') {
        properties = properties.concat(
          await this._extractProperties(proConfigColumns[prop], entityMetadata[prop].$XYZEntity, entityMetadata[prop].$Type)
        );
      }
    }

    return properties;
  }

  _findAttributeByType(obj: Record<string, EntityObject>, typeToSearch: string): string | undefined {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const entity = obj[key];
        if (entity.$Type === typeToSearch) {
          return key;
        }
      }
    }
    return undefined; // if not found
  }

  public async fetchData(deepDownloadConfig: DeepDownloadConfig) {
    const { mainEntity, expands } = this.odataHandler.getODataEntitiesRecursive(
      this.spreadsheetUploadController.getOdataType(),
      deepDownloadConfig.deepLevel
    );
    // Log the mainEntity and expands
    Log.debug('MainEntity:', mainEntity, 'SpreadsheetDownload: fetchData');
    Log.debug('Expands:', expands, 'SpreadsheetDownload: fetchData');
    const batchSize = 1000;
    const customBinding = this.odataHandler.getBindingFromBinding(this.spreadsheetUploadController.binding, expands);

    // Start fetching the batches
    const totalResults = await this.odataHandler.fetchBatch(customBinding, batchSize);
    const data = Util.extractObjects(totalResults);

    if (
      (this.component.getDeepDownloadConfig() as DeepDownloadConfig).setDraftStatus &&
      (this.component.getDeepDownloadConfig() as DeepDownloadConfig).addKeysToExport
    ) {
      for (const row in data) {
        // check if the row has a draft entity and IsActiveEntity is in the data row
        if (data[row].HasDraftEntity && typeof data[row].IsActiveEntity !== 'undefined') {
          data[row].IsActiveEntity = false;
        }
      }
    }

    // Use the DataAssigner for all data assignments
    this.dataAssigner.assignData(data, mainEntity);
    this.dataAssigner.assignDataRoot(deepDownloadConfig.columns, mainEntity, deepDownloadConfig.deepLevel);
    this.dataAssigner.assignColumnsRoot(deepDownloadConfig.columns, mainEntity, deepDownloadConfig.deepLevel);
    this.dataAssigner.assignColumns(deepDownloadConfig.columns, mainEntity, deepDownloadConfig.deepLevel);

    mainEntity.$XYZData = data;
    return mainEntity;
  }
}
