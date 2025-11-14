import ManagedObject from 'sap/ui/base/ManagedObject';
import Component from '../Component';
import { ArrayData, ListObject, Payload, PayloadArray, Property, ValueData } from '../types';
import MessageHandler from './MessageHandler';
import Util from './Util';
import { CustomMessageTypes, FieldMatchType, MessageType } from '../enums';

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class Parser extends ManagedObject {
  /**
   * Detects semantic state from cell value and configured markers
   * Supports both CREATE and UPDATE operations
   * @param rawValue The raw value from the Excel cell
   * @param nullMarker The configured null marker (e.g., '__NULL__')
   * @param emptyStringMarker The configured empty string marker (e.g., '__EMPTY__')
   * @returns State and processed value
   */
  static detectMarkerState(
    rawValue: any,
    nullMarker: string,
    emptyStringMarker: string
  ): { state: 'omit' | 'null' | 'emptyString' | 'value'; value: any } {
    // Empty cell → omit property (no backend change for UPDATE, uses default for CREATE)
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return { state: 'omit', value: undefined };
    }

    // Convert to string for marker comparison (trimmed)
    const rawValueStr = String(rawValue).trim();

    // Null marker (case-sensitive exact match)
    if (nullMarker && rawValueStr === nullMarker) {
      return { state: 'null', value: null };
    }

    // Empty string marker (case-sensitive exact match)
    if (emptyStringMarker && rawValueStr === emptyStringMarker) {
      return { state: 'emptyString', value: '' };
    }

    // Normal value - proceed with type-specific parsing
    return { state: 'value', value: rawValue };
  }

  static parseSpreadsheetData(
    sheetData: ArrayData,
    typeLabelList: ListObject,
    component: Component,
    messageHandler: MessageHandler,
    util: Util,
    isODataV4: Boolean
  ) {
    const payloadArray: PayloadArray = [];
    // loop over data from spreadsheet file
    for (const [index, row] of sheetData.entries()) {
      let payload: Payload = {};
      // check each specified column if availalble in spreadsheet data
      for (const [columnKey, metadataColumn] of typeLabelList.entries()) {
        // Get cell value from row using configured field matching strategy
        const value = Util.getValueFromRow(row, metadataColumn.label, columnKey, component.getFieldMatchType() as FieldMatchType);

        // === Marker Detection Phase (Four-State Model) ===
        // Process markers BEFORE type-specific parsing to support: omit | null | emptyString | value
        const nullMarker = component.getNullMarker();
        const emptyMarker = component.getEmptyStringMarker();

        if (nullMarker || emptyMarker) {
          const markerState = this.detectMarkerState(value?.rawValue, nullMarker, emptyMarker);

          // State 1: NULL marker - Explicitly set field to NULL
          if (markerState.state === 'null') {
            if (metadataColumn.nullable === false) {
              // Reject: Field is non-nullable (e.g., keys, mandatory fields)
              this.addMessageToMessages(
                'spreadsheetimporter.nullValueNotAllowed',
                util,
                messageHandler,
                index,
                [metadataColumn.label],
                value?.rawValue
              );
              continue; // Skip this field
            }
            // Accept: Set to JSON null and skip type parsing
            payload[columnKey] = null;
            continue;
          }

          // State 2: EMPTY STRING marker - Explicitly set to empty string (strings only)
          if (markerState.state === 'emptyString') {
            if (metadataColumn.type !== 'Edm.String') {
              // Reject: Only valid for string fields
              this.addMessageToMessages(
                'spreadsheetimporter.emptyStringMarkerInvalidType',
                util,
                messageHandler,
                index,
                [metadataColumn.label],
                value?.rawValue
              );
              continue; // Skip this field
            }
            // Accept: Set to empty string and skip type parsing
            payload[columnKey] = '';
            continue;
          }

          // State 3: OMIT - Empty cell means "no change"
          if (markerState.state === 'omit') {
            continue; // Property omitted from payload → backend keeps existing value
          }

          // State 4: VALUE - Normal value, fall through to type-specific parsing below
        }

        // === Type-Specific Parsing Phase ===
        // Process non-empty values according to their OData type
        if (value && value.rawValue !== undefined && value.rawValue !== null && value.rawValue !== '') {
          const rawValue = value.rawValue;
          if (metadataColumn.type === 'Edm.Boolean') {
            if (typeof rawValue === 'boolean' || rawValue === 'true' || rawValue === 'false') {
              payload[columnKey] = Boolean(rawValue);
            } else {
              this.addMessageToMessages('spreadsheetimporter.valueNotABoolean', util, messageHandler, index, [metadataColumn.label], rawValue);
            }
          } else if (metadataColumn.type === 'Edm.Date') {
            let date = rawValue;
            if (value.sheetDataType !== 'd') {
              const parsedDate = new Date(rawValue);
              if (isNaN(parsedDate.getTime())) {
                this.addMessageToMessages('spreadsheetimporter.invalidDate', util, messageHandler, index, [metadataColumn.label], rawValue);
                continue;
              }
              date = parsedDate;
            }
            try {
              this.checkDate(date, metadataColumn, util, messageHandler, index);
              const dateString = `${date.getUTCFullYear()}-${('0' + (date.getUTCMonth() + 1)).slice(-2)}-${('0' + date.getUTCDate()).slice(-2)}`;
              payload[columnKey] = dateString;
            } catch (error) {
              this.addMessageToMessages('spreadsheetimporter.errorWhileParsing', util, messageHandler, index, [metadataColumn.label], rawValue);
            }
          } else if (metadataColumn.type === 'Edm.DateTimeOffset' || metadataColumn.type === 'Edm.DateTime') {
            let date = rawValue;
            if (value.sheetDataType !== 'd') {
              const parsedDate = new Date(rawValue);
              if (isNaN(parsedDate.getTime())) {
                this.addMessageToMessages('spreadsheetimporter.invalidDate', util, messageHandler, index, [metadataColumn.label], rawValue);
                continue;
              }
              date = parsedDate;
            }
            try {
              this.checkDate(date, metadataColumn, util, messageHandler, index);
              if (!metadataColumn.precision) {
                // If precision is not defined, remove milliseconds from date (from '2023-11-25T00:00:00Z' to '2023-11-25T00:00:00.000Z')
                // see https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/600
                payload[columnKey] = date.toISOString().replace(/\.\d{3}/, '');
              } else {
                payload[columnKey] = date;
              }
            } catch (error) {
              this.addMessageToMessages('spreadsheetimporter.errorWhileParsing', util, messageHandler, index, [metadataColumn.label], rawValue);
            }
          } else if (metadataColumn.type === 'Edm.TimeOfDay' || metadataColumn.type === 'Edm.Time') {
            let date = rawValue;

            // Only try to parse as Date if it's not marked as a date in sheet data
            if (value.sheetDataType !== 'd') {
              date = new Date(rawValue);
            }

            if (date && !isNaN(date.getTime())) {
              // Successfully parsed to Date, format to only time part
              const timeFormatted = date.toISOString().substring(11, 19);
              payload[columnKey] = timeFormatted;
            } else {
              // Call the new method to parse time pattern if excel data is text not date
              const parsedTime = this.parseTimePattern(rawValue, util, messageHandler, index, metadataColumn);
              if (parsedTime) {
                payload[columnKey] = parsedTime;
              }
            }
          } else if (
            metadataColumn.type === 'Edm.UInt8' ||
            metadataColumn.type === 'Edm.Int16' ||
            metadataColumn.type === 'Edm.Int32' ||
            metadataColumn.type === 'Edm.Integer' ||
            metadataColumn.type === 'Edm.Int64' ||
            metadataColumn.type === 'Edm.Integer64' ||
            metadataColumn.type === 'Edm.Byte' ||
            metadataColumn.type === 'Edm.SByte'
          ) {
            try {
              const valueInteger = this.checkInteger(value, metadataColumn, util, messageHandler, index, component);
              // according to odata v2 spec, integer values are strings, v4 are numbers
              if (isODataV4) {
                // int64 are always strings
                if (metadataColumn.type === 'Edm.Int64' || metadataColumn.type === 'Edm.Integer64') {
                  payload[columnKey] = valueInteger.toString();
                } else {
                  payload[columnKey] = valueInteger;
                }
              } else {
                // for OData V2
                if (
                  metadataColumn.type === 'Edm.Int16' ||
                  metadataColumn.type === 'Edm.Int32' ||
                  metadataColumn.type === 'Edm.Byte' ||
                  metadataColumn.type === 'Edm.SByte'
                ) {
                  payload[columnKey] = valueInteger;
                } else {
                  payload[columnKey] = valueInteger.toString();
                }
              }
            } catch (error) {
              this.addMessageToMessages('spreadsheetimporter.errorWhileParsing', util, messageHandler, index, [metadataColumn.label], rawValue);
            }
          } else if (metadataColumn.type === 'Edm.Double' || metadataColumn.type === 'Edm.Decimal') {
            try {
              const valueDouble = this.checkDouble(value, metadataColumn, util, messageHandler, index, component);
              // according to odata v2 spec, integer values are strings, v4 are numbers
              if (isODataV4) {
                if (metadataColumn.type === 'Edm.Double') {
                  payload[columnKey] = valueDouble;
                }
                if (metadataColumn.type === 'Edm.Decimal') {
                  payload[columnKey] = valueDouble.toString();
                }
              } else {
                // for OData V2
                payload[columnKey] = valueDouble.toString();
              }
            } catch (error) {
              this.addMessageToMessages('spreadsheetimporter.errorWhileParsing', util, messageHandler, index, [metadataColumn.label], rawValue);
            }
          } else if (metadataColumn.type === 'Edm.Guid') {
            try {
              // Check if the value matches GUID format
              const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
              if (typeof rawValue === 'string' && guidPattern.test(rawValue)) {
                payload[columnKey] = rawValue;
              } else {
                this.addMessageToMessages('spreadsheetimporter.invalidGuid', util, messageHandler, index, [metadataColumn.label], rawValue);
              }
            } catch (error) {
              this.addMessageToMessages('spreadsheetimporter.errorWhileParsing', util, messageHandler, index, [metadataColumn.label], rawValue);
            }
          } else {
            // For unmatched types, only add to payload if rawValue is not null/undefined
            // This ensures empty cells result in omitted properties (no backend update)
            if (rawValue !== null && rawValue !== undefined) {
              payload[columnKey] = String(rawValue);
            }
          }
        }
      }
      if (component.getSpreadsheetRowPropertyName()) {
        // @ts-ignore
        payload[component.getSpreadsheetRowPropertyName()] = row['__rowNum__'] + 1;
      }
      payloadArray.push(payload);
    }
    return payloadArray;
  }

  static checkDate(value: any, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number) {
    if (isNaN(value.getTime())) {
      this.addMessageToMessages('spreadsheetimporter.invalidDate', util, messageHandler, index, [metadataColumn.label], value.rawValue);
      return false;
    }
    return true;
  }

  static checkDouble(value: ValueData, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number, component: Component) {
    const rawValue = value.rawValue;
    let valueDouble = rawValue;

    // Apply floating-point precision correction for numeric values
    if (typeof rawValue === 'number') {
      // Use Scale (Decimal) or Precision (Double) from metadata, with smart fallback
      valueDouble = Util.fixFloatingPointPrecision(rawValue, metadataColumn.scale, metadataColumn.precision);
    } else if (typeof rawValue === 'string') {
      const normalizedString = Util.normalizeNumberString(rawValue, component);
      valueDouble = parseFloat(normalizedString);
      // check if the string contains anything other than numbers and decimal separator or if parsing failed
      if (/[^0-9.,]/.test(normalizedString) || isNaN(valueDouble)) {
        // Error: Value contains something other than numbers and decimal separator
        this.addMessageToMessages('spreadsheetimporter.parsingErrorNotNumber', util, messageHandler, index, [metadataColumn.label], rawValue);
      } else {
        // Apply precision correction after parsing string to number
        valueDouble = Util.fixFloatingPointPrecision(valueDouble, metadataColumn.scale, metadataColumn.precision);
      }
    }
    return valueDouble;
  }

  static checkInteger(value: ValueData, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number, component: Component) {
    const rawValue = value.rawValue;
    let valueInteger = rawValue;
    if (!Number.isInteger(valueInteger)) {
      if (typeof rawValue === 'string') {
        const normalizedString = Util.normalizeNumberString(rawValue, component);
        valueInteger = parseInt(normalizedString);
        // check if value is a number a does contain anything other than numbers
        if (/[^0-9]/.test(valueInteger) || parseInt(normalizedString).toString() !== normalizedString.toString()) {
          // Error: Value does contain anything other than numbers
          this.addMessageToMessages('spreadsheetimporter.parsingErrorNotWholeNumber', util, messageHandler, index, [metadataColumn.label], rawValue);
        }
      }
    }
    return valueInteger;
  }

  static addMessageToMessages(
    text: string,
    util: Util,
    messageHandler: MessageHandler,
    index: number,
    array?: any,
    rawValue?: any,
    formattedValue?: any
  ) {
    messageHandler.addMessageToMessages({
      title: util.geti18nText(text, array),
      row: index + 2,
      type: CustomMessageTypes.ParsingError,
      counter: 1,
      rawValue: rawValue,
      formattedValue: formattedValue,
      ui5type: MessageType.Error
    });
  }

  /**
   * Parses a time string according to specific patterns and returns the local time as a string.
   * This method handles raw time strings and validates them against the expected format.
   * The method supports time strings in the format "HH:mm:ss" and "HH:mm:ss.sss", where:
   * - HH represents hours (00 to 23),
   * - mm represents minutes (00 to 59),
   * - ss represents seconds (00 to 59),
   * - sss represents milliseconds (000 to 999).
   *
   * If the time string is valid and the components are within their respective ranges,
   * it constructs a Date object and formats the time to respect the local timezone.
   * If the time string does not match the expected pattern or components are out of range,
   * it logs an appropriate error message.
   *
   * @param {string} rawValue - The raw time string to be parsed.
   * @param {Util} util - Utility class instance for accessing helper functions like i18n.
   * @param {MessageHandler} messageHandler - MessageHandler class instance for logging errors.
   * @param {number} index - The row index of the data being parsed, used for error reporting.
   * @param {Property} metadataColumn - The metadata for the column, including the type label.
   * @returns {string|null} - Returns a formatted time string if successful, otherwise null.
   */
  static parseTimePattern(rawValue: any, util: Util, messageHandler: MessageHandler, index: number, metadataColumn: Property) {
    const timePattern = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?$/;
    const match = rawValue.match(timePattern);

    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = match[3] ? parseInt(match[3], 10) : 0;
      const milliseconds = match[4] ? parseInt(match[4], 10) : 0;

      // Validate time components
      if (hours < 24 && minutes < 60 && seconds < 60) {
        // Construct a Date object from time components
        let today = new Date();
        today.setHours(hours, minutes, seconds, milliseconds);
        // Format the time considering the local timezone
        const timeFormatted = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;
        return timeFormatted;
      } else {
        this.addMessageToMessages('spreadsheetimporter.invalidTime', util, messageHandler, index, [metadataColumn.label], rawValue);
      }
    } else {
      this.addMessageToMessages('spreadsheetimporter.invalidTimeFormat', util, messageHandler, index, [metadataColumn.label], rawValue);
    }
    return null;
  }
}
