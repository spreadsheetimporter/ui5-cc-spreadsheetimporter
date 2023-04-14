import Log from "sap/base/Log";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import MessageBox, { Action } from "sap/m/MessageBox";

export default class Util {
	private resourceBundle: ResourceBundle;

	constructor(resourceBundle: ResourceBundle) {
		this.resourceBundle = resourceBundle;
	}

	static getValueFromRow(row, label, type, fieldMatchType) {
		let value;
		if (fieldMatchType === "label") {
			value = row[label];
		}
		if (fieldMatchType === "labelTypeBrackets") {
			try {
				value = Object.entries(row).find(([key]) => key.includes(`[${type}]`))[1];
			} catch (error) {
				console.debug(`Not found ${type}`);
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
		Log.error(error.message, error, `${className}.${methodName}`);
		// convert urls to links and to remove lines of the url
		const regex = /(http[s]?:\/\/[^\s]+):(\d+):(\d+)/g;
		let errorStack = error.stack.replace(regex, '<a href="$1" target="_blank" class="sapMLnk">$1</a>:<span class="line-no">$2:$3</span>').replace(/\n/g, "<br/>");
		MessageBox.error(error.message, {
			details: errorStack,
			initialFocus: Action.CLOSE,
			actions: [Action.CANCEL],
		});
	}
}
