import ResourceBundle from "sap/base/i18n/ResourceBundle";

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
}
