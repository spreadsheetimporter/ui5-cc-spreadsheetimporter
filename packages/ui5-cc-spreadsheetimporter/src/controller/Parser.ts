import ManagedObject from "sap/ui/base/ManagedObject";
import Component from "../Component";
import { ArrayData, ListObject, Payload, PayloadArray, Property, ValueData } from "../types";
import MessageHandler from "./MessageHandler";
import Util from "./Util";
import { CustomMessageTypes, FieldMatchType, MessageType } from "../enums";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class Parser extends ManagedObject {
	static parseSpreadsheetData(sheetData: ArrayData, typeLabelList: ListObject, component: Component, messageHandler: MessageHandler, util: Util, isODataV4: Boolean) {
		const payloadArray: PayloadArray = [];
		// loop over data from spreadsheet file
		for (const [index, row] of sheetData.entries()) {
			let payload: Payload = {};
			// check each specified column if availalble in spreadsheet data
			for (const [columnKey, metadataColumn] of typeLabelList.entries()) {
				// depending on parse type
				const value = Util.getValueFromRow(row, metadataColumn.label, columnKey, component.getFieldMatchType() as FieldMatchType);
				// depending on data type
				if (value && value.rawValue !== undefined && value.rawValue !== null && value.rawValue !== "") {
					const rawValue = value.rawValue;
					if (metadataColumn.type === "Edm.Boolean") {
						if (typeof rawValue === "boolean" || rawValue === "true" || rawValue === "false") {
							payload[columnKey] = Boolean(rawValue);
						} else {
							this.addMessageToMessages("spreadsheetimporter.valueNotABoolean", util, messageHandler, index, [metadataColumn.label], rawValue);
						}
					} else if (metadataColumn.type === "Edm.Date") {
						let date = rawValue;
						if (value.sheetDataType !== "d") {
							const parsedDate = new Date(rawValue);
							if (isNaN(parsedDate.getTime())) {
								this.addMessageToMessages("spreadsheetimporter.invalidDate", util, messageHandler, index, [metadataColumn.label], rawValue);
								continue;
							}
							date = parsedDate;
						}
						try {
							this.checkDate(date, metadataColumn, util, messageHandler, index);
							const dateString = `${date.getUTCFullYear()}-${("0" + (date.getUTCMonth() + 1)).slice(-2)}-${("0" + date.getUTCDate()).slice(-2)}`;
							payload[columnKey] = dateString;
						} catch (error) {
							this.addMessageToMessages("spreadsheetimporter.errorWhileParsing", util, messageHandler, index, [metadataColumn.label], rawValue);
						}
					} else if (metadataColumn.type === "Edm.DateTimeOffset" || metadataColumn.type === "Edm.DateTime") {
						let date = rawValue;
						if (value.sheetDataType !== "d") {
							const parsedDate = new Date(rawValue);
							if (isNaN(parsedDate.getTime())) {
								this.addMessageToMessages("spreadsheetimporter.invalidDate", util, messageHandler, index, [metadataColumn.label], rawValue);
								continue;
							}
							date = parsedDate;
						}
						try {
							this.checkDate(date, metadataColumn, util, messageHandler, index);
							if(!metadataColumn.precision){
								// If precision is not defined, remove milliseconds from date (from '2023-11-25T00:00:00Z' to '2023-11-25T00:00:00.000Z')
								// see https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/issues/600
								payload[columnKey] = date.toISOString().replace(/\.\d{3}/, '')
							} else {
								payload[columnKey] = date;
							}
						} catch (error) {
							this.addMessageToMessages("spreadsheetimporter.errorWhileParsing", util, messageHandler, index, [metadataColumn.label], rawValue);
						}
					} else if (metadataColumn.type === "Edm.TimeOfDay" || metadataColumn.type === "Edm.Time") {
						let date = rawValue;

						// Only try to parse as Date if it's not marked as a date in sheet data
						if (value.sheetDataType !== "d") {
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
						metadataColumn.type === "Edm.UInt8" ||
						metadataColumn.type === "Edm.Int16" ||
						metadataColumn.type === "Edm.Int32" ||
						metadataColumn.type === "Edm.Integer" ||
						metadataColumn.type === "Edm.Int64" ||
						metadataColumn.type === "Edm.Integer64" ||
						metadataColumn.type === "Edm.Byte" ||
						metadataColumn.type === "Edm.SByte"
					) {
						try {
							const valueInteger = this.checkInteger(value, metadataColumn, util, messageHandler, index, component);
							// according to odata v2 spec, integer values are strings, v4 are numbers
							if (isODataV4) {
								// int64 are always strings
								if (metadataColumn.type === "Edm.Int64" || metadataColumn.type === "Edm.Integer64") {
									payload[columnKey] = valueInteger.toString();
								} else {
									payload[columnKey] = valueInteger;
								}
							} else {
								// for OData V2
								if (metadataColumn.type === "Edm.Int16" || metadataColumn.type === "Edm.Int32" || metadataColumn.type === "Edm.Byte" || metadataColumn.type === "Edm.SByte") {
									payload[columnKey] = valueInteger;
								} else {
									payload[columnKey] = valueInteger.toString();
								}
							}
						} catch (error) {
							this.addMessageToMessages("spreadsheetimporter.errorWhileParsing", util, messageHandler, index, [metadataColumn.label], rawValue);
						}
					} else if (metadataColumn.type === "Edm.Double" || metadataColumn.type === "Edm.Decimal") {
						try {
							const valueDouble = this.checkDouble(value, metadataColumn, util, messageHandler, index, component);
							// according to odata v2 spec, integer values are strings, v4 are numbers
							if (isODataV4) {
								if (metadataColumn.type === "Edm.Double") {
									payload[columnKey] = valueDouble;
								}
								if (metadataColumn.type === "Edm.Decimal") {
									payload[columnKey] = valueDouble.toString();
								}
							} else {
								// for OData V2
								payload[columnKey] = valueDouble.toString();
							}
						} catch (error) {
							this.addMessageToMessages("spreadsheetimporter.errorWhileParsing", util, messageHandler, index, [metadataColumn.label], rawValue);
						}
					} else {
						// assign "" only if rawValue is undefined or null
						payload[columnKey] = `${rawValue ?? ""}`;
					}
				}
			}
			if (component.getSpreadsheetRowPropertyName()) {
				// @ts-ignore
				payload[component.getSpreadsheetRowPropertyName()] = row["__rowNum__"] + 1;
			}
			payloadArray.push(payload);
		}
		return payloadArray;
	}

	static checkDate(value: any, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number) {
		if (isNaN(value.getTime())) {
			this.addMessageToMessages("spreadsheetimporter.invalidDate", util, messageHandler, index, [metadataColumn.label], value.rawValue);
			return false;
		}
		return true;
	}

	static checkDouble(value: ValueData, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number, component: Component) {
		const rawValue = value.rawValue;
		let valueDouble = rawValue;
		if (typeof rawValue === "string") {
			const normalizedString = Util.normalizeNumberString(rawValue, component);
			valueDouble = parseFloat(normalizedString);
			// check if value is a number a does contain anything other than numbers and decimal seperator
			if (/[^0-9.,]/.test(valueDouble) || parseFloat(normalizedString).toString() !== normalizedString) {
				// Error: Value does contain anything other than numbers and decimal seperator
				this.addMessageToMessages("spreadsheetimporter.parsingErrorNotNumber", util, messageHandler, index, [metadataColumn.label], rawValue);
			}
		}
		return valueDouble;
	}

	static checkInteger(value: ValueData, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number, component: Component) {
		const rawValue = value.rawValue;
		let valueInteger = rawValue;
		if (!Number.isInteger(valueInteger)) {
			if (typeof rawValue === "string") {
				const normalizedString = Util.normalizeNumberString(rawValue, component);
				valueInteger = parseInt(normalizedString);
				// check if value is a number a does contain anything other than numbers
				if (/[^0-9]/.test(valueInteger) || parseInt(normalizedString).toString() !== normalizedString.toString()) {
					// Error: Value does contain anything other than numbers
					this.addMessageToMessages("spreadsheetimporter.parsingErrorNotWholeNumber", util, messageHandler, index, [metadataColumn.label], rawValue);
				}
			}
		}
		return valueInteger;
	}

	static addMessageToMessages(text: string, util: Util, messageHandler: MessageHandler, index: number, array?: any, rawValue?: any, formattedValue?: any) {
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
				const timeFormatted = `${today.getHours().toString().padStart(2, "0")}:${today.getMinutes().toString().padStart(2, "0")}:${today.getSeconds().toString().padStart(2, "0")}`;
				return timeFormatted;
			} else {
				this.addMessageToMessages("spreadsheetimporter.invalidTime", util, messageHandler, index, [metadataColumn.label], rawValue);
			}
		} else {
			this.addMessageToMessages("spreadsheetimporter.invalidTimeFormat", util, messageHandler, index, [metadataColumn.label], rawValue);
		}
		return null;
	}
}
