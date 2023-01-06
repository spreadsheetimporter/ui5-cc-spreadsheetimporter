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

	public createLabelListV2(colums: Columns): ListObject {
		let listObject: ListObject = {};

		// get the property list of the entity for which we need to download the template
		// binding.getModel().getMetaModel().getObject("/Orders")
		const oDataEntityType = this.excelUploadController._oDataEntityType;
		const properties: PropertyArray = oDataEntityType.property;
		const entityTypeLabel: string = oDataEntityType["sap:label"];

		// check if file name is not set
		if (!this.excelUploadController._component.getExcelFileName() && entityTypeLabel) {
			this.excelUploadController._component.setExcelFileName(`${entityTypeLabel}.xlsx`);
		} else if (!this.excelUploadController._component.getExcelFileName() && !entityTypeLabel) {
			this.excelUploadController._component.setExcelFileName(`Template.xlsx`);
		}

		if (colums) {
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

	_createLabelListV4(colums: Columns): ListObject {
		let listObject: ListObject = {};
		let entityTypeLabel;

		// get the property list of the entity for which we need to download the template
		var annotations = this.excelUploadController._context.getModel().getMetaModel().getData()["$Annotations"];
		const properties = this.excelUploadController._context.getModel().getMetaModel().getData()[this.excelUploadController._component.getOdataType()];
		// try get facet label
		try {
			entityTypeLabel = annotations[this.excelUploadController._component.getOdataType()]["@com.sap.vocabularies.UI.v1.Facets"][0].Label;
		} catch (error) {
			console.debug("Facet Label not found");
		}

		// check if file name is not set
		if (!this.excelUploadController._component.getExcelFileName() && entityTypeLabel) {
			this.excelUploadController._component.setExcelFileName(`${entityTypeLabel}.xlsx`);
		} else if (!this.excelUploadController._component.getExcelFileName() && !entityTypeLabel) {
			this.excelUploadController._component.setExcelFileName(`Template.xlsx`);
		}

		if (colums) {
			for (const propertyName of colums) {
				const property = properties[propertyName];
				if (property) {
					const propertyLabel = annotations[`${this.excelUploadController._component.getOdataType()}/${propertyName}`];
					listObject[propertyName] = {} as Property;
					listObject[propertyName].label = this._getLabelV4(annotations, properties, propertyName, propertyLabel, this._options);
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
				const propertyLabel = annotations[`${this.excelUploadController._component.getOdataType()}/${propertyName}`];
				if (!propertyLabel["@com.sap.vocabularies.UI.v1.Hidden"]) {
					listObject[propertyName] = {} as Property;
					listObject[propertyName].label = this._getLabelV4(annotations, properties, propertyName, propertyLabel, this._options);
					if (!listObject[propertyName].label) {
						listObject[propertyName].label = propertyName;
					}
					listObject[propertyName].type = propertyValue.$Type;
				}
			}
		}

		return listObject;
	}

	_getLabelV4(annotations: { [x: string]: { [x: string]: any } }, properties: any, propertyName: string, propertyLabel: { [x: string]: any }, options: any) {
		if (propertyLabel["@com.sap.vocabularies.Common.v1.Label"]) {
			return propertyLabel["@com.sap.vocabularies.Common.v1.Label"];
		}
		try {
			const lineItemsAnnotations = annotations[this.excelUploadController._component.getOdataType()]["@com.sap.vocabularies.UI.v1.LineItem"];
			return lineItemsAnnotations.find((dataField: { Value: { $Path: any } }) => dataField.Value.$Path === propertyName).Label;
		} catch (error) {
			console.debug(`${propertyName} not found as a LineItem Label`);
		}
		return propertyName;
	}
}
