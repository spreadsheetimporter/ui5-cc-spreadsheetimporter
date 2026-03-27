import Filter from 'sap/ui/model/Filter';
import FilterOperator from 'sap/ui/model/FilterOperator';
import ODataModel from 'sap/ui/model/odata/v2/ODataModel';
import { CustomMessageTypes, MessageType } from '../../enums';
import MetadataHandlerV2 from './MetadataHandlerV2';
import MessageHandler from '../MessageHandler';
import Util from '../Util';
import Log from 'sap/base/Log';

export interface V2MatchedEntity {
  object: any;
  entitySetName: string;
  keys: Record<string, any>;
  payload: any;
}

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export class ODataV2RequestObjects {
  private metadataHandler: MetadataHandlerV2;
  private messageHandler: MessageHandler;
  private util: Util;
  private matchedEntities: V2MatchedEntity[] = [];

  constructor(metadataHandler: MetadataHandlerV2, messageHandler: MessageHandler, util: Util) {
    this.metadataHandler = metadataHandler;
    this.messageHandler = messageHandler;
    this.util = util;
  }

  public getMatchedEntities(): V2MatchedEntity[] {
    return this.matchedEntities;
  }

  async getObjects(model: ODataModel, binding: any, spreadsheetData: any[], entitySetName: string): Promise<any[]> {
    const path = '/' + entitySetName;

    Log.debug('V2 RequestObjects: Fetching active entities', undefined, 'SpreadsheetUpload: ODataV2RequestObjects');
    const activeEntities = await this._readWithFilter(model, path, spreadsheetData, binding, true);
    Log.debug(`V2 RequestObjects: Found ${activeEntities.length} active entities`, undefined, 'SpreadsheetUpload: ODataV2RequestObjects');

    Log.debug('V2 RequestObjects: Fetching draft entities', undefined, 'SpreadsheetUpload: ODataV2RequestObjects');
    const draftEntities = await this._readWithFilter(model, path, spreadsheetData, binding, false);
    Log.debug(`V2 RequestObjects: Found ${draftEntities.length} draft entities`, undefined, 'SpreadsheetUpload: ODataV2RequestObjects');

    let matchedEntities = this.findEntitiesFromSpreadsheet(spreadsheetData, activeEntities, draftEntities, binding, entitySetName);

    // Validate and remove not-found entities
    const { errorFound, filteredSpreadsheetData } = this.validateObjectsAndRemoveNotFound(spreadsheetData, matchedEntities, binding);

    // Update spreadsheetData in-place with filtered data
    spreadsheetData.length = 0;
    spreadsheetData.push(...filteredSpreadsheetData);

    // Re-match with filtered data
    matchedEntities = this.findEntitiesFromSpreadsheet(spreadsheetData, activeEntities, draftEntities, binding, entitySetName);
    this.matchedEntities = matchedEntities;

    if (errorFound && this.messageHandler.areMessagesPresent()) {
      try {
        await this.messageHandler.displayMessages();

        // After user confirms, re-match with corrected draft status
        this.matchedEntities = spreadsheetData.map((spreadsheetEntry: any) => {
          const keys = this.metadataHandler.getKeys(binding, spreadsheetEntry, undefined, true);

          const matchActive = activeEntities.find(entity => entity && Object.entries(keys).every(([key, value]) => entity[key] === value));
          const matchDraft = draftEntities.find(entity => entity && Object.entries(keys).every(([key, value]) => entity[key] === value));

          const matchedObject = matchActive || matchDraft;

          if (matchedObject) {
            // Update spreadsheet entry to match actual status
            spreadsheetEntry.IsActiveEntity = matchedObject.IsActiveEntity;
          }

          return {
            object: matchedObject || spreadsheetEntry,
            entitySetName,
            keys,
            payload: spreadsheetEntry
          };
        });

        return this.matchedEntities.map(m => m.object);
      } catch (error) {
        Log.debug('V2 RequestObjects: Operation cancelled by user', undefined, 'SpreadsheetUpload: ODataV2RequestObjects');
      }
    }

    return matchedEntities.map(m => m.object);
  }

  private async _readWithFilter(model: ODataModel, path: string, spreadsheetData: any[], binding: any, isActive: boolean): Promise<any[]> {
    const batchFilters = spreadsheetData.map(spreadsheetEntry => {
      const keys = this.metadataHandler.getKeys(binding, spreadsheetEntry, undefined, true);
      const keyFilters = Object.entries(keys).map(([property, value]) => new Filter(property, FilterOperator.EQ, value));
      // Add IsActiveEntity filter
      keyFilters.push(new Filter('IsActiveEntity', FilterOperator.EQ, isActive));

      return new Filter({
        filters: keyFilters,
        and: true
      });
    });

    const combinedFilter = new Filter({
      filters: batchFilters,
      and: false
    });

    return new Promise((resolve, reject) => {
      model.read(path, {
        filters: [combinedFilter],
        success: (data: any) => {
          resolve(data.results || []);
        },
        error: (error: any) => {
          Log.error('V2 RequestObjects: Error reading entities', error, 'SpreadsheetUpload: ODataV2RequestObjects');
          // Return empty instead of failing — entities will be marked as not found
          resolve([]);
        }
      } as any);
    });
  }

  private findEntitiesFromSpreadsheet(
    batch: any[],
    activeEntities: any[],
    draftEntities: any[],
    binding: any,
    entitySetName: string
  ): V2MatchedEntity[] {
    return batch.map(payload => {
      const keys = this.metadataHandler.getKeys(binding, payload, undefined, true);

      const matchActive = activeEntities.find(obj => obj && Object.entries(keys).every(([key, value]) => obj[key] === value));
      const matchDraft = draftEntities.find(obj => obj && Object.entries(keys).every(([key, value]) => obj[key] === value));

      // Prefer the version matching the requested status, fall back to other
      let matchedObject = payload.IsActiveEntity === false ? matchDraft : matchActive;
      if (!matchedObject) {
        matchedObject = payload.IsActiveEntity === false ? matchActive : matchDraft;
      }

      return {
        object: matchedObject,
        entitySetName,
        keys,
        payload
      };
    });
  }

  private validateObjectsAndRemoveNotFound(
    spreadsheetData: any[],
    matchedEntities: V2MatchedEntity[],
    binding: any
  ): { errorFound: boolean; filteredSpreadsheetData: any[] } {
    let errorFound = false;
    const filteredSpreadsheetData: any[] = [];

    spreadsheetData.forEach((spreadsheetEntry, index) => {
      const matched = matchedEntities[index];

      if (!matched || !matched.object) {
        errorFound = true;
        const keys = this.metadataHandler.getKeys(binding, spreadsheetEntry, undefined, true);
        this.messageHandler.addMessageToMessages({
          title: this.util.geti18nText('spreadsheetimporter.objectNotFound'),
          row: index + 1,
          type: CustomMessageTypes.ObjectNotFound,
          counter: 1,
          formattedValue: Object.entries(keys)
            .map(([key, value]) => `${key}=${value}`)
            .join(', '),
          ui5type: MessageType.Error
        });
        return;
      }

      // Check for draft state mismatches
      if (spreadsheetEntry.IsActiveEntity !== undefined) {
        const backendEntity = matched.object;
        if (backendEntity.IsActiveEntity && !backendEntity.HasDraftEntity && !spreadsheetEntry.IsActiveEntity) {
          this.addDraftMismatchError(index, matched.keys, 'Draft', 'Active');
          errorFound = true;
        } else if (backendEntity.IsActiveEntity && backendEntity.HasDraftEntity && spreadsheetEntry.IsActiveEntity) {
          this.addDraftMismatchError(index, matched.keys, 'Active', 'Draft');
          errorFound = true;
        } else if (!backendEntity.IsActiveEntity && spreadsheetEntry.IsActiveEntity) {
          this.addDraftMismatchError(index, matched.keys, 'Active', 'Draft');
          errorFound = true;
        }
      }

      filteredSpreadsheetData.push(spreadsheetEntry);
    });

    return { errorFound, filteredSpreadsheetData };
  }

  private addDraftMismatchError(index: number, keys: Record<string, any>, uploadedState: string, expectedState: string): void {
    this.messageHandler.addMessageToMessages({
      title: this.util.geti18nText('spreadsheetimporter.draftEntityMismatch'),
      row: index + 1,
      type: CustomMessageTypes.DraftEntityMismatch,
      counter: 1,
      ui5type: MessageType.Error,
      formattedValue: [
        Object.entries(keys)
          .map(([key, value]) => `${key}=${value}`)
          .join(', '),
        uploadedState,
        expectedState
      ]
    });
  }
}
