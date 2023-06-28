import ManagedObject from "sap/ui/base/ManagedObject";
import { Columns, ListObject, Property } from "../../types";
import SpreadsheetUpload from "../SpreadsheetUpload";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default abstract class MetadataHandler extends ManagedObject{
	public spreadsheetUploadController: SpreadsheetUpload;

	constructor(spreadsheetUploadController: any) {
		super();
		this.spreadsheetUploadController = spreadsheetUploadController;
	}

	abstract getLabelList(colums: Columns, odataType: string, oDataEntityType: any): ListObject 
	abstract getKeyList(oDataEntityType: any): string[]
}
