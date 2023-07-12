import ManagedObject from "sap/ui/base/ManagedObject";
import { Columns, ListObject, Property } from "../../types";
import SpreadsheetUpload from "../SpreadsheetUpload";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default abstract class MetadataHandler extends ManagedObject {
	public spreadsheetUploadController: SpreadsheetUpload;

	constructor(spreadsheetUploadController: any) {
		super();
		this.spreadsheetUploadController = spreadsheetUploadController;
	}

	parseI18nText(i18nMetadataText: string, view: any): string {
		let translatedText = "";

		// remove the symbols from the start and end of the string
		const trimmedStr = i18nMetadataText.slice(1, -1);
		// split the string by the ">" symbol
		const splitStr = trimmedStr.split(">");
		// check if there are exactly 2 parts before and after the ">" symbol
		if (splitStr.length === 2) {
			const resourceBundleName = splitStr[0];
			const i18nPropertyName = splitStr[1];
			const resourceBundle = view.getModel(resourceBundleName).getResourceBundle();
			translatedText = resourceBundle.getText(i18nPropertyName, undefined, true);
		}
		if (!translatedText || translatedText === "") {
			return "";
		} else {
			return translatedText;
		}
	}

	abstract getLabelList(colums: Columns, odataType: string, oDataEntityType: any): ListObject;
	abstract getKeyList(oDataEntityType: any): string[];
}
