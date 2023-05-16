import { MessageType } from "sap/ui/core/library";
import Component from "../Component";
import { ArrayData, ErrorTypes, FieldMatchType, ListObject, Payload, PayloadArray, Property, RowData, ValueData } from "../types";
import ErrorHandler from "./MessageHandler";
import Util from "./Util";

export default class Parser {
	static parseExcelData(sheetData: ArrayData, typeLabelList: ListObject, component: Component, errorHandler: ErrorHandler, util: Util) {
		const payloadArray:PayloadArray = [];
		// loop over data from excel file
		for (const [index, row] of sheetData.entries()) {
			let payload: Payload = {};
			// check each specified column if availalble in excel data
			for (const [columnKey, metadataColumn] of Object.entries(typeLabelList)) {
				// depending on parse type
				const value = Util.getValueFromRow(row, metadataColumn.label, columnKey, component.getFieldMatchType() as FieldMatchType);
				// depending on data type
				if (value) {
					const rawValue = value.rawValue;
					if (metadataColumn.type === "Edm.Boolean") {
						if (typeof rawValue === "boolean" || rawValue === "true" || rawValue === "false") {
							payload[columnKey] = `${rawValue || ""}`;
						} else {
							this.addParsingError("valueNotABoolean", util, errorHandler, index, [metadataColumn.label]);
						}
					} else if (metadataColumn.type === "Edm.Date") {
						let date = rawValue
						if(value.sheetDataType !== 'd'){
							const parsedDate = new Date(rawValue);
							if (isNaN(parsedDate.getTime())) {
								this.addParsingError("valueNotADate", util, errorHandler, index, [metadataColumn.label], rawValue);
								continue;
							} 
							date = parsedDate;
						}
						try {
							this.checkDate(date, metadataColumn, util, errorHandler, index);
							const dateString = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
							payload[columnKey] = dateString;
						} catch (error) {
							this.addParsingError("errorWhileParsing", util, errorHandler, index, [metadataColumn.label]);
						}
					} else if (metadataColumn.type === "Edm.DateTimeOffset" || metadataColumn.type === "Edm.DateTime") {
						let date = rawValue
						if(value.sheetDataType !== 'd'){
							const parsedDate = new Date(rawValue);
							if (isNaN(parsedDate.getTime())) {
								this.addParsingError("valueNotADate", util, errorHandler, index, [metadataColumn.label], rawValue);
								continue;
							} 
							date = parsedDate;
						}
						try {
							this.checkDate(date, metadataColumn, util, errorHandler, index);
							payload[columnKey] = date;
						} catch (error) {
							this.addParsingError("errorWhileParsing", util, errorHandler, index, [metadataColumn.label]);
						}
					} else if (metadataColumn.type === "Edm.TimeOfDay" || metadataColumn.type === "Edm.Time") {
						let date = rawValue
						if(value.sheetDataType !== 'd'){
							const parsedDate = new Date(rawValue);
							if (isNaN(parsedDate.getTime())) {
								this.addParsingError("valueNotADate", util, errorHandler, index, [metadataColumn.label], rawValue);
								continue;
							} 
							date = parsedDate;
						}
						try {
							this.checkDate(date, metadataColumn, util, errorHandler, index);
							const excelDate = date.toISOString().substring(11, 16);
							payload[columnKey] = excelDate;
						} catch (error) {
							this.addParsingError("errorWhileParsing", util, errorHandler, index, [metadataColumn.label]);
						}
					} else if (metadataColumn.type === "Edm.Int32") {
						try {
							const valueInteger = this.checkInteger(value, metadataColumn, util, errorHandler, index, component);
							payload[columnKey] = valueInteger;
						} catch (error) {
							this.addParsingError("errorWhileParsing", util, errorHandler, index, [metadataColumn.label]);
						}
					} else if (metadataColumn.type === "Edm.Double") {
						try {
							const valueDouble = this.checkDouble(value, metadataColumn, util, errorHandler, index, component);
							payload[columnKey] = valueDouble;
						} catch (error) {
							this.addParsingError("errorWhileParsing", util, errorHandler, index, [metadataColumn.label]);
						}
					} else {
						payload[columnKey] = `${rawValue || ""}`;
					}
				}
			}

			payloadArray.push(payload);
		}
		return payloadArray;
	}

	static checkDate(value: any, metadataColumn: Property, util: Util, errorHandler: ErrorHandler, index: number) {
		if (isNaN(value.getTime())) {
			this.addParsingError("invalidDate", util, errorHandler, index, [metadataColumn.label]);
			return false;
		}
		return true;
	}

	static checkDouble(value: ValueData, metadataColumn: Property, util: Util, errorHandler: ErrorHandler, index: number, component: Component) {
		const rawValue = value.rawValue;
		let valueDouble = rawValue;
		if (typeof rawValue === "string") {
			const normalizedString = Util.normalizeNumberString(rawValue, component);
			valueDouble = parseFloat(normalizedString);
			// check if value is a number a does contain anything other than numbers and decimal seperator
			if (/[^0-9.,]/.test(valueDouble) || parseFloat(normalizedString).toString() !== normalizedString) {
				// Error: Value does contain anything other than numbers and decimal seperator
				this.addParsingError("parsingErrorNotNumber", util, errorHandler, index, [metadataColumn.label], rawValue);
			}
		}
		return valueDouble;
	}

	static checkInteger(value: ValueData, metadataColumn: Property, util: Util, errorHandler: ErrorHandler, index: number, component: Component) {
		const rawValue = value.rawValue;
		let valueInteger = rawValue;
		if (!Number.isInteger(valueInteger)) {
			if (typeof rawValue === "string") {
				const normalizedString = Util.normalizeNumberString(rawValue, component);
				valueInteger = parseInt(normalizedString);
				// check if value is a number a does contain anything other than numbers
				if (/[^0-9]/.test(valueInteger) || parseInt(normalizedString).toString() !== normalizedString.toString()) {
					// Error: Value does contain anything other than numbers
					this.addParsingError("parsingErrorNotWholeNumber", util, errorHandler, index, [metadataColumn.label], rawValue);
				}
			}
		}
		return valueInteger;
	}

	static addParsingError(text: string, util: Util, errorHandler: ErrorHandler, index: number, array?: any, rawValue?: any, formattedValue?: any) {
		errorHandler.addParsingError({
			title: util.geti18nText(text, array),
			row: index + 2,
			type: ErrorTypes.ParsingError,
			counter: 1,
			rawValue: rawValue,
			formattedValue: formattedValue,
			ui5type: MessageType.Error,
		});
	}
}
