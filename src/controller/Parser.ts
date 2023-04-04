import Component from "../Component";
import { ErrorTypes, ListObject, Payload, PayloadArray, Property } from "../types";
import ErrorHandler from "./ErrorHandler";
import Util from "./Util";

export default class Parser {
	static parseExcelData(sheetData: PayloadArray, typeLabelList: ListObject, component: Component, errorHandler: ErrorHandler, util: Util) {
		const payloadArray = [];
		// loop over data from excel file
		for (const [index, row] of sheetData.entries()) {
			let payload: Payload = {};
			// check each specified column if availalble in excel data
			for (const [columnKey, metadataColumn] of Object.entries(typeLabelList)) {
				// depending on parse type
				const value = Util.getValueFromRow(row, metadataColumn.label, columnKey, component.getFieldMatchType());
				// depending on data type
				if (value) {
					if (metadataColumn.type === "Edm.Boolean") {
						payload[columnKey] = `${value || ""}`;
					} else if (metadataColumn.type === "Edm.Date") {
						let excelDate = new Date(Math.round((value - 25569) * 86400 * 1000));
						payload[columnKey] = `${excelDate.getFullYear()}-${("0" + (excelDate.getMonth() + 1)).slice(-2)}-${("0" + excelDate.getDate()).slice(-2)}`;
					} else if (metadataColumn.type === "Edm.DateTimeOffset" || metadataColumn.type === "Edm.DateTime") {
						payload[columnKey] = new Date(Math.round((value - 25569) * 86400 * 1000));
					} else if (metadataColumn.type === "Edm.TimeOfDay" || metadataColumn.type === "Edm.Time") {
						//convert to hh:mm:ss
						const secondsInADay = 24 * 60 * 60;
						const timeInSeconds = value * secondsInADay;
						payload[columnKey] = new Date(timeInSeconds * 1000).toISOString().substring(11, 16);
					} else if (metadataColumn.type === "Edm.Int32") {
						try {
							const valueInteger = this.checkInteger(value, metadataColumn, util, errorHandler, index);
							payload[columnKey] = valueInteger;
						} catch (error) {
							break;
						}
					} else if (metadataColumn.type === "Edm.Double") {
						try {
							const valueDouble = this.checkDouble(value, metadataColumn, util, errorHandler, index);
							payload[columnKey] = valueDouble;
						} catch (error) {
							break;
						}
					} else {
						payload[columnKey] = `${value || ""}`;
					}
				}
			}

			payloadArray.push(payload);
		}
		return payloadArray;
	}

	static checkDouble(value: any, metadataColumn: Property, util: Util, errorHandler: ErrorHandler, index: number) {
		let valueDouble = value;
		if (typeof value === "string") {
			const valueString = value;
			// check if value is a number a does contain anything other than numbers and decimal seperator
			if (/[^0-9.,]/.test(valueDouble)) {
				// Error: Value does contain anything other than numbers and decimal seperator
				this.addParsingError("parsingErrorNotNumber", util, errorHandler, index, [metadataColumn.label]);
				throw new Error("Parsing Error");
			}

			const valueStringDecimal = valueString.replace(",", ".");
			valueDouble = parseFloat(valueStringDecimal);

			if (parseFloat(valueStringDecimal).toString() !== valueStringDecimal) {
				// Error: the parsed float value is not the same as the original string value
				this.addParsingError("parsingErrorNotSameNumber", util, errorHandler, index, [metadataColumn.label]);
				throw new Error("Parsing Error");
			}
		}
		return valueDouble;
	}

	static checkInteger(value: any, metadataColumn: Property, util: Util, errorHandler: ErrorHandler, index: number) {
		let valueInteger = value;
		if (!Number.isInteger(valueInteger)) {
			const valueString = value;
			if (typeof value === "string") {
				// check if value is a number a does contain anything other than numbers
				if (/[^0-9]/.test(valueInteger)) {
					// Error: Value does contain anything other than numbers
					this.addParsingError("parsingErrorNotFullNumber", util, errorHandler, index, [metadataColumn.label]);
					throw new Error("Parsing Error");
				}
			}
			valueInteger = parseInt(valueString);

			if (parseInt(valueString).toString() !== valueString.toString()) {
				// Error: the parsed float value is not the same as the original string value
				this.addParsingError("parsingErrorNotSameNumber", util, errorHandler, index, [metadataColumn.label]);
				throw new Error("Parsing Error");
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
