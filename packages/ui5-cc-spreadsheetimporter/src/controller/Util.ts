import ManagedObject from "sap/ui/base/ManagedObject";
import Log from "sap/base/Log";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageBox from "sap/m/MessageBox";
import { RowData, ValueData } from "../types";
import Component from "../Component";
import { FieldMatchType } from "../enums";
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
		if (fieldMatchType === "label") {
			value = row[label];
		}
		if (fieldMatchType === "labelTypeBrackets") {
			try {
				value = Object.entries(row).find(([key]) => key.includes(`[${type}]`))[1] as ValueData;
			} catch (error) {
				Log.debug(`Not found ${type}`, undefined, "SpreadsheetUpload: Util");
			}
		}
		return value;
	}

	geti18nText(text: string, array?: any): string {
		return this.resourceBundle.getText(text, array);
	}

	static changeDecimalSeperator(value: string): number {
		// Replace thousands separator with empty string
		value = value.replace(/[.]/g, "");
		// Replace decimal separator with a dot
		value = value.replace(/[,]/g, ".");
		// Convert string to number
		return parseFloat(value);
	}

	static sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	static showError(error: any, className: string, methodName: string) {
		let detailsContent: any = "";
		let errorMessage = "";
		try {
			// code error
			if (error.stack) {
				errorMessage = error.message;
				// convert urls to links and to remove lines of the url
				const regex = /(http[s]?:\/\/[^\s]+):(\d+):(\d+)/g;
				let errorStack = error.stack.replace(regex, '<a href="$1" target="_blank" class="sapMLnk">$1</a>:<span class="line-no">$2:$3</span>').replace(/\n/g, "<br/>");
				detailsContent = errorStack;
			} else {
				// OData error
				const errorObject = JSON.parse(error.responseText);
				errorMessage = errorObject.error.message.value;
				detailsContent = errorObject;
			}
		} catch (error) {
			errorMessage = "Generic Error";
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
		let decimalSeparator = "";
		let thousandSeparator = "";
		if (componentDecimalSeparator === ",") {
			thousandSeparator = ".";
			decimalSeparator = ",";
			return { thousandSeparator, decimalSeparator };
		}
		if (componentDecimalSeparator === ".") {
			thousandSeparator = ",";
			decimalSeparator = ".";
			return { decimalSeparator, thousandSeparator };
		}
		const sampleNumber = 12345.6789;
		const formatted = new Intl.NumberFormat(navigator.language).format(sampleNumber);

		const withoutDigits = formatted.replace(/\d/g, "");
		decimalSeparator = withoutDigits.charAt(withoutDigits.length - 1);
		thousandSeparator = withoutDigits.charAt(0);

		return { decimalSeparator, thousandSeparator };
	}

	static normalizeNumberString(numberString: string, component: Component) {
		const { decimalSeparator, thousandSeparator } = this.getBrowserDecimalAndThousandSeparators(component.getDecimalSeparator());

		// Remove thousand separators
		const stringWithoutThousandSeparators = numberString.replace(new RegExp(`\\${thousandSeparator}`, "g"), "");

		// Replace the default decimal separator with the standard one
		const standardNumberString = stringWithoutThousandSeparators.replace(decimalSeparator, ".");

		return standardNumberString;
	}

	static getRandomString(length: number): string {
		const characters: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		let randomString: string = "";

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
			if (typeof value === "object" && value !== null) {
				// Handle circular references
				if (seen.has(value)) {
					return;
				}
				seen.add(value);

				// Handle first-level objects
				const keys = Object.keys(value);
				if (keys.every((k) => typeof value[k] !== "object" || value[k] === null)) {
					let simpleObject: { [key: string]: any } = {};
					for (let k in value) {
						if (typeof value[k] !== "object" || value[k] === null) {
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
		return objects.map((obj) => obj.getObject());
	}
}
