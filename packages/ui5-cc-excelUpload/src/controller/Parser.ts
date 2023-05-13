import Component from "../Component";
import { ArrayData, ErrorTypes, FieldMatchType, ListObject, Payload, PayloadArray, Property, RowData, ValueData } from "../types";
import ErrorHandler from "./ErrorHandler";
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
						try {
							this.checkDate(rawValue, metadataColumn, util, errorHandler, index);
							const dateString = `${rawValue.getFullYear()}-${("0" + (rawValue.getMonth() + 1)).slice(-2)}-${("0" + rawValue.getDate()).slice(-2)}`;
							payload[columnKey] = dateString;
						} catch (error) {
							this.addParsingError("errorWhileParsing", util, errorHandler, index, [metadataColumn.label]);
						}
					} else if (metadataColumn.type === "Edm.DateTimeOffset" || metadataColumn.type === "Edm.DateTime") {
						try {
							this.checkDate(rawValue, metadataColumn, util, errorHandler, index);
							payload[columnKey] = rawValue;
						} catch (error) {
							this.addParsingError("errorWhileParsing", util, errorHandler, index, [metadataColumn.label]);
						}
					} else if (metadataColumn.type === "Edm.TimeOfDay" || metadataColumn.type === "Edm.Time") {
						try {
							this.checkDate(rawValue, metadataColumn, util, errorHandler, index);
							const excelDate = rawValue.toISOString().substring(11, 16);
							payload[columnKey] = excelDate;
						} catch (error) {
							this.addParsingError("errorWhileParsing", util, errorHandler, index, [metadataColumn.label]);
						}
					} else if (metadataColumn.type === "Edm.Int32") {
						try {
							const valueInteger = this.checkInteger(value, metadataColumn, util, errorHandler, index);
							payload[columnKey] = valueInteger;
						} catch (error) {
							this.addParsingError("errorWhileParsing", util, errorHandler, index, [metadataColumn.label]);
						}
					} else if (metadataColumn.type === "Edm.Double") {
						try {
							const valueDouble = this.checkDouble(value, metadataColumn, util, errorHandler, index);
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
		}
	}

	static checkDouble(value: ValueData, metadataColumn: Property, util: Util, errorHandler: ErrorHandler, index: number) {
		const rawValue = value.rawValue;
		let valueDouble = rawValue;
		if (typeof rawValue === "string") {
			const valueString = rawValue;
			// check if value is a number a does contain anything other than numbers and decimal seperator
			if (/[^0-9.,]/.test(valueDouble)) {
				// Error: Value does contain anything other than numbers and decimal seperator
				this.addParsingError("parsingErrorNotNumber", util, errorHandler, index, [metadataColumn.label]);
			}

			const valueStringDecimal = valueString.replace(",", ".");
			valueDouble = parseFloat(valueStringDecimal);

			if (parseFloat(valueStringDecimal).toString() !== valueStringDecimal) {
				// Error: the parsed float value is not the same as the original string value
				this.addParsingError("parsingErrorNotSameNumber", util, errorHandler, index, [metadataColumn.label]);
			}
		}
		return valueDouble;
	}

	static checkInteger(value: ValueData, metadataColumn: Property, util: Util, errorHandler: ErrorHandler, index: number) {
		const rawValue = value.rawValue;
		let valueInteger = rawValue;
		if (!Number.isInteger(valueInteger)) {
			const valueString = rawValue;
			if (typeof rawValue === "string") {
				// check if value is a number a does contain anything other than numbers
				if (/[^0-9]/.test(valueInteger)) {
					// Error: Value does contain anything other than numbers
					this.addParsingError("parsingErrorNotFullNumber", util, errorHandler, index, [metadataColumn.label]);
				}
			}
			valueInteger = parseInt(valueString);

			if (parseInt(valueString).toString() !== valueString.toString()) {
				// Error: the parsed float value is not the same as the original string value
				this.addParsingError("parsingErrorNotSameNumber", util, errorHandler, index, [metadataColumn.label]);
			}
		}
		return valueInteger;
	}

	static addParsingError(text: string, util: Util, errorHandler: ErrorHandler, index: number, array?: any) {
		errorHandler.addParsingError({
			title: util.geti18nText(text, array),
			row: index + 2,
			type: ErrorTypes.ParsingError,
			counter: 1,
		});
	}
}
