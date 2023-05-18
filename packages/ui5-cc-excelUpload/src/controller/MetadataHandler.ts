import { Columns, Property, ListObject, PropertyArray } from "../types";
import ExcelUpload from "./ExcelUpload";
/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class MetadataHandler {
	private excelUploadController: ExcelUpload;

	constructor(excelUploadController: any) {
		this.excelUploadController = excelUploadController;
	}

	public createLabelListV2(colums: Columns, odataType: string, oDataEntityType: any): ListObject {
		let listObject: ListObject = {};

		// get the property list of the entity for which we need to download the template
		const properties: PropertyArray = oDataEntityType.property;
		const entityTypeLabel: string = oDataEntityType["sap:label"];

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
					listObject[propertyName].label = this._getLabelV2(oDataEntityType, properties, property, propertyName, this._options);
					if (!listObject[propertyName].label) {
						listObject[propertyName].label = propertyName;
					}
					listObject[propertyName].type = property["type"];
				} else {
					console.error(`ExcelUpload: Property ${propertyName} not found`);
				}
			}
		} else {
			for (const property of properties) {
				let hiddenProperty = false;
				try {
					hiddenProperty = property["com.sap.vocabularies.UI.v1.Hidden"].Bool === "true";
				} catch (error) {
					console.debug(`No hidden property on ${property.name}`);
				}
				if (!hiddenProperty) {
					const propertyName = property.name;
					listObject[propertyName] = {} as Property;
					listObject[propertyName].label = this._getLabelV2(oDataEntityType, properties, property, propertyName, this._options);
					listObject[propertyName].type = property["type"];
				}
			}
		}

		return listObject;
	}

	_getLabelV2(oDataEntityType: { [x: string]: any }, properties: any, property: { [x: string]: any }, propertyName: string, options: any) {
		if (property["sap:label"]) {
			return property["sap:label"];
		}
		try {
			const lineItemsAnnotations = oDataEntityType["com.sap.vocabularies.UI.v1.LineItem"];
			return lineItemsAnnotations.find((dataField: { Value: { Path: any } }) => dataField.Value.Path === propertyName).Label.String;
		} catch (error) {
			console.debug(`${propertyName} not found as a LineItem Label`);
		}
		return propertyName;
	}

	public createLabelListV4(colums: Columns, odataType: string): ListObject {
		let listObject: ListObject = {};
		let entityTypeLabel;

		// get the property list of the entity for which we need to download the template
		var annotations = this.excelUploadController.context.getModel().getMetaModel().getData()["$Annotations"];
		const properties = this.excelUploadController.context.getModel().getMetaModel().getData()[odataType];
		// try get facet label
		try {
			entityTypeLabel = annotations[odataType]["@com.sap.vocabularies.UI.v1.Facets"][0].Label;
		} catch (error) {
			console.debug("Facet Label not found");
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
					listObject[propertyName].label = this._getLabelV4(annotations, properties, propertyName, propertyLabel, this._options, odataType);
					if (!listObject[propertyName].label) {
						listObject[propertyName].label = propertyName;
					}
					listObject[propertyName].type = property.$Type;
				} else {
					console.error(`ExcelUpload: Property ${propertyName} not found`);
				}
			}
		} else {
			const propertiesFiltered = Object.entries(properties).filter(([propertyName, propertyValue]) => propertyValue["$kind"] === "Property");
			for (const [propertyName, propertyValue] of propertiesFiltered) {
				const propertyLabel = annotations[`${odataType}/${propertyName}`];
				if (!propertyLabel["@com.sap.vocabularies.UI.v1.Hidden"]) {
					listObject[propertyName] = {} as Property;
					listObject[propertyName].label = this._getLabelV4(annotations, properties, propertyName, propertyLabel, this._options, odataType);
					if (!listObject[propertyName].label) {
						listObject[propertyName].label = propertyName;
					}
					listObject[propertyName].type = propertyValue.$Type;
				}
			}
		}

		return listObject;
	}

	_getLabelV4(annotations: { [x: string]: { [x: string]: any } }, properties: any, propertyName: string, propertyLabel: { [x: string]: any }, options: any, odataType: string) {
		if (propertyLabel && propertyLabel["@com.sap.vocabularies.Common.v1.Label"]) {
			return propertyLabel["@com.sap.vocabularies.Common.v1.Label"];
		}
		try {
			const lineItemsAnnotations = annotations[odataType]["@com.sap.vocabularies.UI.v1.LineItem"];
			return lineItemsAnnotations.find((dataField: { Value: { $Path: any } }) => dataField.Value.$Path === propertyName).Label;
		} catch (error) {
			console.debug(`${propertyName} not found as a LineItem Label`);
		}
		return propertyName;
	}

	/**
	 * Creates a list of properties that are defined mandatory in the OData metadata V4
	 * @param odataType
	 **/
	getKeyListV4(odataType: string): string[] {
		let keys: string[] = [];

		var annotations = this.excelUploadController.context.getModel().getMetaModel().getData()["$Annotations"];
		const properties = this.excelUploadController.context.getModel().getMetaModel().getData()[odataType];

		const propertiesFiltered = Object.entries(properties).filter(([propertyName, propertyValue]) => propertyValue["$kind"] === "Property");
		for (const [propertyName, propertyValue] of propertiesFiltered) {
			const propertyLabel = annotations[`${odataType}/${propertyName}`];
			if (!propertyLabel) {
				continue;
			}
			// if property is mandatory, field should be in excel file
			if (
				propertyLabel["@com.sap.vocabularies.Common.v1.FieldControl"] &&
				propertyLabel["@com.sap.vocabularies.Common.v1.FieldControl"]["$EnumMember"] &&
				propertyLabel["@com.sap.vocabularies.Common.v1.FieldControl"]["$EnumMember"] === "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory"
			) {
				keys.push(propertyName);
			}
			// if property nullable is false and hidden is false, field should be in excel file
			if (!this.excelUploadController.component.getSkipNullCheck() && 
				!propertyLabel.type?.startsWith("Collection") && 
				!propertyLabel["@com.sap.vocabularies.UI.v1.Hidden"] && 
				propertyValue["$Nullable"] === false
				) {
				keys.push(propertyName);
			}
		}
		return keys;
	}

	/**
	 * Creates a list of properties that are defined mandatory in the OData metadata V2
	 * @param odataType
	 **/
	getKeyListV2(oDataEntityType: any): string[] {
		let keys: string[] = [];

		for (const property of oDataEntityType.property) {
			// if property is mandatory, field should be in excel file
			const propertyName = property.name;
			if (
				property["com.sap.vocabularies.Common.v1.FieldControl"] &&
				property["com.sap.vocabularies.Common.v1.FieldControl"]["EnumMember"] &&
				property["com.sap.vocabularies.Common.v1.FieldControl"]["EnumMember"] === "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory"
			) {
				keys.push(propertyName);
			}
			// if property nullable is false and hidden is false, field should be in excel file
			if (!this.excelUploadController.component.getSkipNullCheck() && 
				!property.type?.startsWith("Collection") && 
				property["com.sap.vocabularies.UI.v1.Hidden"] && 
				property["com.sap.vocabularies.UI.v1.Hidden"]["Bool"] === "false" && 
				property.nullable === "false") {
				keys.push(propertyName);
			}
		}
		return keys;
	}
}
