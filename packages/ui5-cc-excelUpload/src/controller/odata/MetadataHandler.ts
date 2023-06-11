import Log from "sap/base/Log";
import { Columns, Property, ListObject, PropertyArray } from "../../types";
import ExcelUpload from "../ExcelUpload";
import List from "sap/m/List";
/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default abstract class MetadataHandler {
	private excelUploadController: ExcelUpload;

	constructor(excelUploadController: any) {
		this.excelUploadController = excelUploadController;
	}

	abstract getLabelList(colums: Columns, odataType: string, oDataEntityType: any): ListObject 
	abstract getKeyList(oDataEntityType: any): string[]
}
