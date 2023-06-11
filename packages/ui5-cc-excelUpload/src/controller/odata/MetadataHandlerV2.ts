import Log from "sap/base/Log";
import { Columns, Property, ListObject, PropertyArray } from "../../types";
import ExcelUpload from "../ExcelUpload";
/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class MetadataHandler {
	private excelUploadController: ExcelUpload;

	constructor(excelUploadController: any) {
		this.excelUploadController = excelUploadController;
	}

	public getLabelList(colums: Columns, odataType: string, oDataEntityType: any): ListObject {
		let listObject: ListObject = {};

		// get the property list of the entity for which we need to download the template
		const properties: PropertyArray = oDataEntityType.property;
		const entityTypeLabel: string = oDataEntityType["sap:label"];
		Log.debug("ExcelUpload: Annotations", undefined, "ExcelUpload: MetadataHandler", () => this.excelUploadController.component.logger.returnObject(oDataEntityType));

		// check if file name is not set
		if (!this.excelUploadController.component.getExcelFileName() && entityTypeLabel) {
			this.excelUploadController.component.setExcelFileName(`${entityTypeLabel}.xlsx`);
		} else if (!this.excelUploadController.component.getExcelFileName() && !entityTypeLabel) {
			this.excelUploadController.component.setExcelFileName(`Template.xlsx`);
		}

		if (colums.length > 0) {
			for (const propertyName of colums) {
				const property = properties.find((property: any) => property.name === propertyName);
				if (property) {
					listObject[propertyName] = {} as Property;
					listObject[propertyName].label = this.getLabel(oDataEntityType, properties, property, propertyName);
					if (!listObject[propertyName].label) {
						listObject[propertyName].label = propertyName;
					}
					listObject[propertyName].type = property["type"];
				} else {
					Log.warning(`ExcelUpload: Property ${propertyName} not found`);
				}
			}
		} else {
			for (const property of properties) {
				let hiddenProperty = false;
				const propertyName = property.name;
				try {
					hiddenProperty = property["com.sap.vocabularies.UI.v1.Hidden"].Bool === "true";
				} catch (error) {
					Log.debug(`No hidden property on ${property.name}`,undefined,"ExcelUpload: MetadataHandler");
				}
				if (!hiddenProperty && !propertyName.startsWith("SAP__")) {
					listObject[propertyName] = {} as Property;
					listObject[propertyName].label = this.getLabel(oDataEntityType, properties, property, propertyName);
					listObject[propertyName].type = property["type"];
				}
			}
		}

		return listObject;
	}

	private getLabel(oDataEntityType: { [x: string]: any }, properties: any, property: { [x: string]: any }, propertyName: string) {
		if (property["sap:label"]) {
			return property["sap:label"];
		}
		try {
			const lineItemsAnnotations = oDataEntityType["com.sap.vocabularies.UI.v1.LineItem"];
			return lineItemsAnnotations.find((dataField: { Value: { Path: any } }) => dataField.Value.Path === propertyName).Label.String;
		} catch (error) {
			Log.debug(`ExcelUpload: ${propertyName} not found as a LineItem Label`,undefined,"ExcelUpload: MetadataHandler");
		}
		return propertyName;
	}

	/**
	 * Creates a list of properties that are defined mandatory in the OData metadata V2
	 * @param odataType
	 **/
	getKeyList(oDataEntityType: any): string[] {
		let keys: string[] = [];
		if(this.excelUploadController.component.getSkipMandatoryFieldCheck()){
			return keys;
		}

		for (const property of oDataEntityType.property) {
			// if property is mandatory, field should be in excel file
			const propertyName = property.name;
			// skip sap property
			if(propertyName.startsWith("SAP__") ) {
				continue;
			}
			if (
				!this.excelUploadController.component.getSkipMandatoryFieldCheck() && 
				property["com.sap.vocabularies.Common.v1.FieldControl"] &&
				property["com.sap.vocabularies.Common.v1.FieldControl"]["EnumMember"] &&
				property["com.sap.vocabularies.Common.v1.FieldControl"]["EnumMember"] === "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory"
			) {
				keys.push(propertyName);
			}
		}
		return keys;
	}
}
