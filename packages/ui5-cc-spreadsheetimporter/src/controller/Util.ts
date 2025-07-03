import ManagedObject from 'sap/ui/base/ManagedObject';
import Log from 'sap/base/Log';
import type ResourceBundle from 'sap/base/i18n/ResourceBundle';
import MessageBox from 'sap/m/MessageBox';
import type { DeepDownloadConfig, FireEventReturnType, RowData, UpdateConfig, ValueData } from '../types';
import type Component from '../Component';
import type { FieldMatchType } from '../enums';
import ObjectPool from 'sap/ui/base/ObjectPool';
import Event from 'sap/ui/base/Event';
import ts from 'sap/ui/model/odata/v4/ts';
import * as XLSX from 'xlsx';
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class Util extends ManagedObject {
  private resourceBundle: ResourceBundle;

  constructor(resourceBundle: ResourceBundle) {
    super();
    this.resourceBundle = resourceBundle;
  }

  static getValueFromRow(row: RowData, label: string, type: string, fieldMatchType: FieldMatchType): ValueData {
    let value: ValueData | undefined;
    if (fieldMatchType === 'label') {
      value = row[label];
    }
    if (fieldMatchType === 'labelTypeBrackets') {
      try {
        value = Object.entries(row).find(([key]) => key.includes(`[${type}]`))[1] as ValueData;
      } catch (error) {
        Log.debug(`Not found ${type}`, undefined, 'SpreadsheetUpload: Util');
      }
    }
    return value;
  }

  geti18nText(text: string, array?: any): string {
    return this.resourceBundle.getText(text, array);
  }

  static changeDecimalSeperator(value: string): number {
    // Replace thousands separator with empty string
    value = value.replace(/[.]/g, '');
    // Replace decimal separator with a dot
    value = value.replace(/[,]/g, '.');
    // Convert string to number
    return parseFloat(value);
  }

  static showError(error: any, className: string, methodName: string) {
    let detailsContent: any = '';
    let errorMessage = '';
    try {
      // code error
      if (error.stack) {
        errorMessage = error.message;
        // convert urls to links and to remove lines of the url
        const regex = /(http[s]?:\/\/[^\s]+):(\d+):(\d+)/g;
        let errorStack = error.stack
          .replace(regex, '<a href="$1" target="_blank" class="sapMLnk">$1</a>:<span class="line-no">$2:$3</span>')
          .replace(/\n/g, '<br/>');
        detailsContent = errorStack;
      } else {
        // OData error
        const errorObject = JSON.parse(error.responseText);
        errorMessage = errorObject.error.message.value;
        detailsContent = errorObject;
      }
    } catch (error) {
      errorMessage = 'Generic Error';
      detailsContent = error;
    }
    Log.error(errorMessage, error, `${className}.${methodName}`);
    MessageBox.error(errorMessage, {
      details: detailsContent,
      initialFocus: MessageBox.Action.CLOSE,
      actions: [MessageBox.Action.OK]
    });
  }

  static showErrorMessage(errorMessage: string, className: string, methodName: string) {
    Log.error(errorMessage, `${className}.${methodName}`);
    MessageBox.error(errorMessage, {
      initialFocus: MessageBox.Action.CLOSE,
      actions: [MessageBox.Action.CANCEL]
    });
  }

  static getBrowserDecimalAndThousandSeparators(componentDecimalSeparator: string) {
    let decimalSeparator = '';
    let thousandSeparator = '';
    if (componentDecimalSeparator === ',') {
      thousandSeparator = '.';
      decimalSeparator = ',';
      return { thousandSeparator, decimalSeparator };
    }
    if (componentDecimalSeparator === '.') {
      thousandSeparator = ',';
      decimalSeparator = '.';
      return { decimalSeparator, thousandSeparator };
    }
    const sampleNumber = 12345.6789;
    const formatted = new Intl.NumberFormat(navigator.language).format(sampleNumber);

    const withoutDigits = formatted.replace(/\d/g, '');
    decimalSeparator = withoutDigits.charAt(withoutDigits.length - 1);
    thousandSeparator = withoutDigits.charAt(0);

    return { decimalSeparator, thousandSeparator };
  }

  static normalizeNumberString(numberString: string, component: Component) {
    const { decimalSeparator, thousandSeparator } = this.getBrowserDecimalAndThousandSeparators(component.getDecimalSeparator());

    // Remove thousand separators
    const stringWithoutThousandSeparators = numberString.replace(new RegExp(`\\${thousandSeparator}`, 'g'), '');

    // Replace the default decimal separator with the standard one
    const standardNumberString = stringWithoutThousandSeparators.replace(decimalSeparator, '.');

    return standardNumberString;
  }

  static getRandomString(length: number): string {
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString: string = '';

    for (let i: number = 0; i < length; i++) {
      const randomIndex: number = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }

    return randomString;
  }

  static stringify(obj: any): string {
    const seen = new WeakSet();

    return JSON.stringify(obj, (key, value) => {
      // Check if value is an object and not null
      if (typeof value === 'object' && value !== null) {
        // Handle circular references
        if (seen.has(value)) {
          return;
        }
        seen.add(value);

        // Handle first-level objects
        const keys = Object.keys(value);
        if (keys.every(k => typeof value[k] !== 'object' || value[k] === null)) {
          let simpleObject: { [key: string]: any } = {};
          for (let k in value) {
            if (typeof value[k] !== 'object' || value[k] === null) {
              simpleObject[k] = value[k];
            }
          }
          return simpleObject;
        }
      }
      return value;
    });
  }

  static extractObjects(objects: any[]): Record<string, any>[] {
    return objects.map(obj => obj.getObject());
  }

  static downloadSpreadsheetFile(arrayBuffer: ArrayBuffer, fileName: string): void {
    const blob: Blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url: string = URL.createObjectURL(blob);

    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  static async getLanguage(): Promise<string> {
    try {
      // getCore is not available in UI5 version 2.0 and above, prefer this over sap.ui.getCore().getConfiguration().getLanguage()
      const Localization = await Util.loadUI5RessourceAsync('sap/base/i18n/Localization');
      return Localization.getLanguage();
    } catch (error) {
      Log.debug('sap/base/i18n/Localization not found', undefined, 'SpreadsheetUpload: checkForODataErrors');
    }
    // ui5lint-disable-next-line -- fallback for UI5 versions below 2.0
    return sap.ui.getCore().getConfiguration().getLanguage();
  }

  static async loadUI5RessourceAsync(moduleName: string): Promise<any> {
    const alreadyLoadedModule = sap.ui.require(moduleName);
    if (alreadyLoadedModule) {
      return Promise.resolve(alreadyLoadedModule);
    }

    return new Promise(function (resolve, reject) {
      sap.ui.require(
        [moduleName],
        function (Module: unknown) {
          resolve(Module);
        },
        function (err: any) {
          reject(err);
        }
      );
    });
  }

  /**
   * Asynchronously fires an event with the given name and parameters on the specified component.
   * With this method, async methods can be attached and also sync methods
   * instead of the standard generated fireEvent methods, we call the methods directly
   * using promises to wait for the event handlers to complete
   *
   * @param eventName - The name of the event to be fired.
   * @param eventParameters - The parameters to be passed to the event handlers.
   * @param component - The component on which the event is fired.
   * @returns A promise that resolves when all event handlers have completed.
   */
  static async fireEventAsync(eventName: string, eventParameters: object, component: Component): Promise<FireEventReturnType> {
    let aEventListeners,
      event,
      promises = [];

    // @ts-ignore
    const eventPool = new ObjectPool(Event);

    aEventListeners = (component as any).mEventRegistry[eventName];

    if (Array.isArray(aEventListeners)) {
      // Avoid issues with 'concurrent modification' (e.g. if an event listener unregisters itself).
      aEventListeners = aEventListeners.slice();
      event = eventPool.borrowObject(eventName, component, eventParameters); // borrow event lazily

      for (let oInfo of aEventListeners) {
        try {
          // Assuming each handler returns a promise
          promises.push(oInfo.fFunction.call(null, event));
        } catch (error) {
          Log.error('Error in event handler:', error as Error);
        }
      }
    }

    // Wait for all promises (i.e., async handlers) to resolve
    await Promise.all(promises);

    return {
      bPreventDefault: (event as any)?.bPreventDefault,
      mParameters: (event as any)?.mParameters,
      returnValue: promises[0]
    };
  }

  static mergeDeepDownloadConfig(defaultConfig: DeepDownloadConfig, providedConfig?: DeepDownloadConfig): DeepDownloadConfig {
    if (!providedConfig) return defaultConfig;

    // Deep merge for spreadsheetExportConfig
    const mergedDeepDownloadConfig: DeepDownloadConfig = {
      ...defaultConfig,
      ...providedConfig
    };

    return mergedDeepDownloadConfig;
  }

  static mergeUpdateConfig(defaultConfig: UpdateConfig, providedConfig?: UpdateConfig): UpdateConfig {
    if (!providedConfig) return defaultConfig;

    const mergedUpdateConfig: UpdateConfig = {
      ...defaultConfig,
      ...providedConfig
    };

    return mergedUpdateConfig;
  }

  /**
   * Converts coordinates from object format {s: {r: number, c: number}, e: {r: number, c: number}}
   * to A1 notation string (e.g., "A1")
   *
   * @param coordinates Object with start (s) and end (e) coordinates
   * @param includeEndCoordinate Whether to include the end coordinate in the result (e.g., "A1:C10")
   * @returns A1 notation string or null if conversion fails
   */
  static convertCoordinatesToA1Notation(coordinates: any, includeEndCoordinate: boolean = false): string | null {
    try {
      if (!coordinates || !coordinates.s || typeof coordinates.s.r !== 'number' || typeof coordinates.s.c !== 'number') {
        return null;
      }

      // Create a new cell reference in A1 notation for the starting point
      const startColLetter = XLSX.utils.encode_col(coordinates.s.c);
      const startRowNumber = coordinates.s.r + 1; // XLSX is 0-based for rows
      let a1Notation = `${startColLetter}${startRowNumber}`;

      // Add end coordinates if requested and valid
      if (includeEndCoordinate && coordinates.e && typeof coordinates.e.r === 'number' && typeof coordinates.e.c === 'number') {
        const endColLetter = XLSX.utils.encode_col(coordinates.e.c);
        const endRowNumber = coordinates.e.r + 1; // XLSX is 0-based for rows
        a1Notation += `:${endColLetter}${endRowNumber}`;
      }

      return a1Notation;
    } catch (error) {
      Log.error('Error converting coordinates to A1 notation', error as Error, 'SpreadsheetUpload: Util');
      return null;
    }
  }

  /**
   * Converts A1 notation string (e.g., "A1" or "A1:C10") to coordinates object
   *
   * @param a1Notation A1 notation string
   * @returns Coordinates object or null if conversion fails
   */
  static convertA1NotationToCoordinates(a1Notation: string): any | null {
    try {
      if (!a1Notation || typeof a1Notation !== 'string') {
        return null;
      }

      // Handle range notation (e.g., "A1:C10")
      if (a1Notation.includes(':')) {
        return XLSX.utils.decode_range(a1Notation);
      }
      // Handle single cell notation (e.g., "A1")
      else {
        const cellCoords = XLSX.utils.decode_cell(a1Notation);
        return {
          s: { r: cellCoords.r, c: cellCoords.c },
          e: { r: cellCoords.r, c: cellCoords.c }
        };
      }
    } catch (error) {
      Log.error('Error converting A1 notation to coordinates', error as Error, 'SpreadsheetUpload: Util');
      return null;
    }
  }

  /**
   * Validates the component configuration for potential issues or incompatibilities.
   * Logs configuration issues to the console.
   *
   * @param componentData The configuration data provided by the developer
   * @returns True if the configuration is valid, false if critical issues were found
   */
  static validateConfiguration(componentData: any): boolean {
    if (!componentData) {
      return true; // No config to validate
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for unknown configuration options
    const knownProperties = [
      'spreadsheetFileName',
      'action',
      'context',
      'columns',
      'excludeColumns',
      'tableId',
      'odataType',
      'mandatoryFields',
      'fieldMatchType',
      'activateDraft',
      'batchSize',
      'standalone',
      'strict',
      'decimalSeparator',
      'hidePreview',
      'previewColumns',
      'skipMandatoryFieldCheck',
      'skipColumnsCheck',
      'skipMaxLengthCheck',
      'showBackendErrorMessages',
      'showOptions',
      'availableOptions',
      'hideSampleData',
      'sampleData',
      'spreadsheetTemplateFile',
      'useTableSelector',
      'readAllSheets',
      'readSheet',
      'spreadsheetRowPropertyName',
      'continueOnError',
      'createActiveEntity',
      'i18nModel',
      'debug',
      'componentContainerData',
      'bindingCustom',
      'showDownloadButton',
      'deepDownloadConfig',
      'updateConfig'
    ];

    // Find unknown properties in componentData
    const unknownProperties = Object.keys(componentData).filter(prop => !knownProperties.includes(prop));
    if (unknownProperties.length > 0) {
      warnings.push(`Unknown configuration options found: ${unknownProperties.join(', ')}. These will be ignored.`);
    }

    // Check for standalone mode configuration issues
    if (componentData.standalone === true) {
      if (!componentData.columns || !Array.isArray(componentData.columns) || componentData.columns.length === 0) {
        errors.push("When 'standalone' is true, 'columns' must be specified.");
      }
    }

    // Check for incompatible config combinations
    if (componentData.activateDraft === true && componentData.createActiveEntity === true) {
      errors.push("'activateDraft' and 'createActiveEntity' cannot both be true - they are mutually exclusive.");
    }

    // Check for read sheet configuration
    if (componentData.readAllSheets === true && componentData.readSheet !== 0) {
      warnings.push("'readAllSheets' is true, but 'readSheet' is also specified. 'readSheet' will be ignored.");
    }

    // Validate column configuration
    if (componentData.columns && componentData.excludeColumns) {
      const columnsSet = new Set(componentData.columns);
      const excludedInColumns = componentData.excludeColumns.filter((col: string) => columnsSet.has(col));

      if (excludedInColumns.length > 0) {
        warnings.push(`Columns found in both 'columns' and 'excludeColumns': ${excludedInColumns.join(', ')}. These will be excluded.`);
      }
    }

    // Check batch size for updates
    if (componentData.action === 'UPDATE' && componentData.batchSize > 100) {
      warnings.push('For UPDATE operations, batch size is limited to 100. Your configured value will be capped.');
    }

    // Validate spreadsheetTemplateFile with related config options
    if (componentData.spreadsheetTemplateFile && !componentData.skipColumnsCheck) {
      warnings.push("When using 'spreadsheetTemplateFile', it's recommended to set 'skipColumnsCheck' to true to avoid errors with custom columns.");
    }

    // Validate field match type
    if (componentData.fieldMatchType && componentData.fieldMatchType !== 'label' && componentData.fieldMatchType !== 'labelTypeBrackets') {
      errors.push(`Invalid 'fieldMatchType' value: '${componentData.fieldMatchType}'. Valid options are 'label' or 'labelTypeBrackets'.`);
    }

    // Validate decimal separator
    if (componentData.decimalSeparator && componentData.decimalSeparator !== '.' && componentData.decimalSeparator !== ',') {
      errors.push(`Invalid 'decimalSeparator' value: '${componentData.decimalSeparator}'. Valid options are '.' or ','.`);
    }

    // Handle configuration issues
    if (errors.length > 0) {
      const errorMessage = 'Spreadsheet Importer Configuration Errors:\n' + errors.join('\n');

      if (warnings.length > 0) {
        const warningText = '\nWarnings:\n' + warnings.join('\n');
        Log.error(errorMessage + warningText, undefined, 'SpreadsheetUpload: Configuration');
      } else {
        Log.error(errorMessage, undefined, 'SpreadsheetUpload: Configuration');
      }

      return false;
    } else if (warnings.length > 0) {
      const warningMessage = 'Spreadsheet Importer Configuration Warnings:\n' + warnings.join('\n');
      Log.warning(warningMessage, undefined, 'SpreadsheetUpload: Configuration');
      return true;
    }

    return true;
  }

  /**
   * Creates a deep copy of an XLSX workbook. This prevents accidental mutation of the original
   * workbook object when downstream code (e.g. import wizard) renames attributes or changes cell values.
   */
  static deepCopyWorkbook(workbook: XLSX.WorkBook): XLSX.WorkBook {
    // Fast path: if workbook has no sheets return shallow clone
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      return XLSX.utils.book_new();
    }

    // Create a binary string of the workbook and read it back – simplest reliable deep-clone
    const binary = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    return XLSX.read(binary, { type: 'binary' });
  }
}
