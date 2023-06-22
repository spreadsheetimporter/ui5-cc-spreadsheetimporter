import Log from "sap/base/Log";
import { Columns, Property, ListObject, PropertyArray } from "../../types";
import MetadataHandler from "./MetadataHandler";
/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class MetadataHandlerV4 extends MetadataHandler {

	constructor(excelUploadController: any) {
		super(excelUploadController);
	}

	public getLabelList(colums: Columns, odataType: string): ListObject {
		let listObject: ListObject = {};
		let entityTypeLabel;

		// get the property list of the entity for which we need to download the template
		var annotations = this.excelUploadController.context.getModel().getMetaModel().getData()["$Annotations"];
		const properties = this.excelUploadController.context.getModel().getMetaModel().getData()[odataType];
		Log.debug("ExcelUpload: Annotations", undefined, "ExcelUpload: MetadataHandler", () => this.excelUploadController.component.logger.returnObject(this.excelUploadController.context.getModel().getMetaModel().getData()));
		// try get facet label
		try {
			entityTypeLabel = annotations[odataType]["@com.sap.vocabularies.UI.v1.Facets"][0].Label;
		} catch (error) {
			Log.debug(`ExcelUpload: Facet Label not found`,undefined,"ExcelUpload: MetadataHandler");
		}

		// check if file name is not set
		if (!this.excelUploadController.component.getExcelFileName() && entityTypeLabel) {
			this.excelUploadController.component.setExcelFileName(`${entityTypeLabel}.xlsx`);
		} else if (!this.excelUploadController.component.getExcelFileName() && !entityTypeLabel) {
			this.excelUploadController.component.setExcelFileName(`Template.xlsx`);
		}

		if (colums.length > 0) {
			for (const propertyName of colums) {
				const property = properties[propertyName];
				if (property) {
					const propertyLabel = annotations[`${odataType}/${propertyName}`];
					listObject[propertyName] = {} as Property;
					listObject[propertyName].label = this.getLabel(annotations, properties, propertyName, propertyLabel, odataType);
					if (!listObject[propertyName].label) {
						listObject[propertyName].label = propertyName;
					}
					listObject[propertyName].type = property.$Type;
				} else {
					Log.warning(`ExcelUpload: Property ${propertyName} not found`,undefined,"ExcelUpload: MetadataHandler");
				}
			}
		} else {
			const propertiesFiltered = Object.entries(properties).filter(([propertyName, propertyValue]) => (propertyValue as any)["$kind"] === "Property");
			for (const [propertyName, propertyValue] of propertiesFiltered) {
				const propertyLabel = annotations[`${odataType}/${propertyName}`];
				if (!propertyLabel["@com.sap.vocabularies.UI.v1.Hidden"] && !propertyName.startsWith("SAP__")) {
					listObject[propertyName] = {} as Property;
					listObject[propertyName].label = this.getLabel(annotations, properties, propertyName, propertyLabel, odataType);
					if (!listObject[propertyName].label) {
						listObject[propertyName].label = propertyName;
					}
					listObject[propertyName].type = (propertyValue as any).$Type;
				}
			}
		}

		return listObject;
	}

	private getLabel(annotations: { [x: string]: { [x: string]: any } }, properties: any, propertyName: string, propertyLabel: { [x: string]: any }, odataType: string) {
		if (propertyLabel && propertyLabel["@com.sap.vocabularies.Common.v1.Label"]) {
			return propertyLabel["@com.sap.vocabularies.Common.v1.Label"];
		}
		try {
			const lineItemsAnnotations = annotations[odataType]["@com.sap.vocabularies.UI.v1.LineItem"];
			return lineItemsAnnotations.find((dataField: { Value: { $Path: any } }) => dataField.Value.$Path === propertyName).Label;
		} catch (error) {
			Log.debug(`ExcelUpload: ${propertyName} not found as a LineItem Label`,undefined,"ExcelUpload: MetadataHandler");
		}
		return propertyName;
	}

	/**
	 * Creates a list of properties that are defined mandatory in the OData metadata V4
	 * @param odataType
	 **/
	getKeyList(odataType: string): string[] {
		let keys: string[] = [];
		if(this.excelUploadController.component.getSkipMandatoryFieldCheck()){
			return keys;
		}

		var annotations = this.excelUploadController.context.getModel().getMetaModel().getData()["$Annotations"];
		const properties = this.excelUploadController.context.getModel().getMetaModel().getData()[odataType];
		const messagesPath = annotations[odataType]["@com.sap.vocabularies.Common.v1.Messages"];

		const propertiesFiltered = Object.entries(properties).filter(([propertyName, propertyValue]) => (propertyValue as any)["$kind"] === "Property");
		for (const [propertyName, propertyValue] of propertiesFiltered) {
			const propertyLabel = annotations[`${odataType}/${propertyName}`];
			if (!propertyLabel) {
				continue;
			}
			// skip messages property
			if(propertyName === messagesPath?.$Path || propertyName.startsWith("SAP__") ) {
				continue;
			}
			// if property is mandatory, field should be in excel file
			if (
				!this.excelUploadController.component.getSkipMandatoryFieldCheck() && 
				propertyLabel["@com.sap.vocabularies.Common.v1.FieldControl"] &&
				propertyLabel["@com.sap.vocabularies.Common.v1.FieldControl"]["$EnumMember"] &&
				propertyLabel["@com.sap.vocabularies.Common.v1.FieldControl"]["$EnumMember"] === "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory"
			) {
				keys.push(propertyName);
			}
		}
		return keys;
	}

}
