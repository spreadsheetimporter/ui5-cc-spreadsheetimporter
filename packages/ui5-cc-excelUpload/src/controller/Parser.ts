import { MessageType } from "sap/ui/core/library";
import Component from "../Component";
import { ArrayData, MessageTypes, FieldMatchType, ListObject, Payload, PayloadArray, Property, RowData, ValueData } from "../types";
import MessageHandler from "./MessageHandler";
import Util from "./Util";

export default class Parser {
	static parseExcelData(sheetData: ArrayData, typeLabelList: ListObject, component: Component, messageHandler: MessageHandler, util: Util) {
		const payloadArray:PayloadArray = [];
		// loop over data from excel file
		for (const [index, row] of sheetData.entries()) {
			let payload: Payload = {};
			// check each specified column if availalble in excel data
			for (const [columnKey, metadataColumn] of Object.entries(typeLabelList)) {
				// depending on parse type
				const value = Util.getValueFromRow(row, metadataColumn.label, columnKey, component.getFieldMatchType() as FieldMatchType);
				// depending on data type
				if (value && value.rawValue !== undefined && value.rawValue !== null && value.rawValue !== "") {
					const rawValue = value.rawValue;
					if (metadataColumn.type === "Edm.Boolean") {
						if (typeof rawValue === "boolean" || rawValue === "true" || rawValue === "false") {
							payload[columnKey] = Boolean(rawValue);
						} else {
							this.addMessageToMessages("valueNotABoolean", util, messageHandler, index, [metadataColumn.label], rawValue);
						}
					} else if (metadataColumn.type === "Edm.Date") {
						let date = rawValue
						if(value.sheetDataType !== 'd'){
							const parsedDate = new Date(rawValue);
							if (isNaN(parsedDate.getTime())) {
								this.addMessageToMessages("valueNotADate", util, messageHandler, index, [metadataColumn.label], rawValue);
								continue;
							} 
							date = parsedDate;
						}
						try {
							this.checkDate(date, metadataColumn, util, messageHandler, index);
							const dateString = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
							payload[columnKey] = dateString;
						} catch (error) {
							this.addMessageToMessages("errorWhileParsing", util, messageHandler, index, [metadataColumn.label], rawValue);
						}
					} else if (metadataColumn.type === "Edm.DateTimeOffset" || metadataColumn.type === "Edm.DateTime") {
						let date = rawValue
						if(value.sheetDataType !== 'd'){
							const parsedDate = new Date(rawValue);
							if (isNaN(parsedDate.getTime())) {
								this.addMessageToMessages("valueNotADate", util, messageHandler, index, [metadataColumn.label], rawValue);
								continue;
							} 
							date = parsedDate;
						}
						try {
							this.checkDate(date, metadataColumn, util, messageHandler, index);
							payload[columnKey] = date;
						} catch (error) {
							this.addMessageToMessages("errorWhileParsing", util, messageHandler, index, [metadataColumn.label],rawValue);
						}
					} else if (metadataColumn.type === "Edm.TimeOfDay" || metadataColumn.type === "Edm.Time") {
						let date = rawValue
						if(value.sheetDataType !== 'd'){
							const parsedDate = new Date(rawValue);
							if (isNaN(parsedDate.getTime())) {
								this.addMessageToMessages("valueNotADate", util, messageHandler, index, [metadataColumn.label], rawValue);
								continue;
							} 
							date = parsedDate;
						}
						try {
							this.checkDate(date, metadataColumn, util, messageHandler, index);
							const excelDate = date.toISOString().substring(11, 16);
							payload[columnKey] = excelDate;
						} catch (error) {
							this.addMessageToMessages("errorWhileParsing", util, messageHandler, index, [metadataColumn.label],rawValue);
						}
					} else if (metadataColumn.type === "Edm.UInt8" || metadataColumn.type === "Edm.Int16" || metadataColumn.type === "Edm.Int32" || metadataColumn.type === "Edm.Integer" || metadataColumn.type === "Edm.Int64" || metadataColumn.type === "Edm.Integer64") {
						try {
							const valueInteger = this.checkInteger(value, metadataColumn, util, messageHandler, index, component);
							payload[columnKey] = valueInteger;
						} catch (error) {
							this.addMessageToMessages("errorWhileParsing", util, messageHandler, index, [metadataColumn.label],rawValue);
						}
					} else if (metadataColumn.type === "Edm.Double" || metadataColumn.type === "Edm.Decimal") {
						try {
							const valueDouble = this.checkDouble(value, metadataColumn, util, messageHandler, index, component);
							payload[columnKey] = valueDouble;
						} catch (error) {
							this.addMessageToMessages("errorWhileParsing", util, messageHandler, index, [metadataColumn.label],rawValue);
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

	static checkDate(value: any, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number) {
		if (isNaN(value.getTime())) {
			this.addMessageToMessages("invalidDate", util, messageHandler, index, [metadataColumn.label],value.rawValue);
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
				this.addMessageToMessages("parsingErrorNotNumber", util, messageHandler, index, [metadataColumn.label], rawValue);
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
					this.addMessageToMessages("parsingErrorNotWholeNumber", util, messageHandler, index, [metadataColumn.label], rawValue);
				}
			}
		}
		return valueInteger;
	}

	static addMessageToMessages(text: string, util: Util, messageHandler: MessageHandler, index: number, array?: any, rawValue?: any, formattedValue?: any) {
		messageHandler.addMessageToMessages({
			title: util.geti18nText(text, array),
			row: index + 2,
			type: MessageTypes.ParsingError,
			counter: 1,
			rawValue: rawValue,
			formattedValue: formattedValue,
			ui5type: MessageType.Error,
		});
	}
}
