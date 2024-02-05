import ManagedObject from "sap/ui/base/ManagedObject";
import Log from "sap/base/Log";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageBox from "sap/m/MessageBox";
import { RowData, ValueData } from "../types";
import Component from "../Component";
import { FieldMatchType } from "../enums";
import ObjectPool from "sap/ui/base/ObjectPool";
import Event from "sap/ui/base/Event";
import ts from "sap/ui/model/odata/v4/ts";
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

	static downloadSpreadsheetFile(arrayBuffer: ArrayBuffer, fileName: string): void {
		const blob: Blob = new Blob([arrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
		const url: string = URL.createObjectURL(blob);

		const a: HTMLAnchorElement = document.createElement("a");
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url);
	}

	static async loadUI5RessourceAsync(libraryName: string): Promise<any> {
		return new Promise(function (resolve, reject) {
			sap.ui.require(
				[libraryName],
				function (Library: unknown) {
					resolve(Library);
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
	static async fireEventAsync(eventName: string, eventParameters: object, component: Component): Promise<boolean> {
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
				// Assuming each handler returns a promise
				promises.push(oInfo.fFunction.call(null, event));
			}
		}

		// Wait for all promises (i.e., async handlers) to resolve
		await Promise.all(promises);

		return (event as any).bPreventDefault;
	}
}
