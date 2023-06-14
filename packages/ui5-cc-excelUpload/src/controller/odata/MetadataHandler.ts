import ManagedObject from "sap/ui/base/ManagedObject";
import { Columns, ListObject } from "../../types";
import ExcelUpload from "../ExcelUpload";

/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default abstract class MetadataHandler extends ManagedObject{
	public excelUploadController: ExcelUpload;

	constructor(excelUploadController: any) {
		super();
		this.excelUploadController = excelUploadController;
	}

	abstract getLabelList(colums: Columns, odataType: string, oDataEntityType: any): ListObject 
	abstract getKeyList(oDataEntityType: any): string[]
}
