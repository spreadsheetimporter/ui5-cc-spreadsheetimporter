import Log from "sap/base/Log";
import { Columns, Property, ListObject, PropertyArray } from "../../types";
import MetadataHandler from "./MetadataHandler";
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class MetadataHandlerV2 extends MetadataHandler {
	constructor(spreadsheetUploadController: any) {
		super(spreadsheetUploadController);
	}

	public getLabelList(columns: Columns, odataType: string, odataEntityType: any, excludeColumns: Columns): ListObject {
		let listObject: ListObject = new Map();

		// get the property list of the entity for which we need to download the template
		const properties: PropertyArray = odataEntityType.property;
		const entityTypeLabel: string = odataEntityType["sap:label"];
		Log.debug("SpreadsheetUpload: Annotations", undefined, "SpreadsheetUpload: MetadataHandler", () => this.spreadsheetUploadController.component.logger.returnObject(odataEntityType));

		// check if file name is not set
		if (!this.spreadsheetUploadController.component.getSpreadsheetFileName() && entityTypeLabel) {
			this.spreadsheetUploadController.component.setSpreadsheetFileName(`${entityTypeLabel}.xlsx`);
		} else if (!this.spreadsheetUploadController.component.getSpreadsheetFileName() && !entityTypeLabel) {
			this.spreadsheetUploadController.component.setSpreadsheetFileName(`Template.xlsx`);
		}

		// excludeColumns will remove the columns from the list if columns are present
		if (columns.length > 0 && excludeColumns.length > 0) {
			columns = columns.filter((column) => !excludeColumns.includes(column));
		}

		if (columns.length > 0) {
			for (const propertyName of columns) {
				const property = properties.find((property: any) => property.name === propertyName);
				if (property) {
					let propertyObject: Property = {} as Property;
					propertyObject.label = this.getLabel(odataEntityType, properties, property, propertyName);
					if (!propertyObject.label) {
						propertyObject.label = propertyName;
					}
					propertyObject.type = property["type"];
					propertyObject.maxLength = property["maxLength"];
					listObject.set(propertyName, propertyObject);
				} else {
					Log.warning(`SpreadsheetUpload: Property ${propertyName} not found`);
				}
			}
		} else if (columns.length === 0 && excludeColumns.length > 0) {
			for (const property of properties) {
				// if property is in excludeColumns, skip it
				if (excludeColumns.includes(property.name)) {
					continue;
				}
				let hiddenProperty = false;
				const propertyName = property.name;
				try {
					hiddenProperty = property["com.sap.vocabularies.UI.v1.Hidden"].Bool === "true";
				} catch (error) {
					Log.debug(`No hidden property on ${property.name}`, undefined, "SpreadsheetUpload: MetadataHandler");
				}
				if (!hiddenProperty && !propertyName.startsWith("SAP__")) {
					let propertyObject: Property = {} as Property;
					propertyObject.label = this.getLabel(odataEntityType, properties, property, propertyName);
					propertyObject.type = property["type"];
					propertyObject.maxLength = property["maxLength"];
					listObject.set(propertyName, propertyObject);
				}
			}
		} else {
			for (const property of properties) {
				let hiddenProperty = false;
				const propertyName = property.name;
				try {
					hiddenProperty = property["com.sap.vocabularies.UI.v1.Hidden"].Bool === "true";
				} catch (error) {
					Log.debug(`No hidden property on ${property.name}`, undefined, "SpreadsheetUpload: MetadataHandler");
				}
				if (!hiddenProperty && !propertyName.startsWith("SAP__")) {
					let propertyObject: Property = {} as Property;
					propertyObject.label = this.getLabel(odataEntityType, properties, property, propertyName);
					propertyObject.type = property["type"];
					propertyObject.maxLength = property["maxLength"];
					listObject.set(propertyName, propertyObject);
				}
			}
		}

		return listObject;
	}

	private getLabel(odataEntityType: { [x: string]: any }, properties: any, property: { [x: string]: any }, propertyName: string) {
		let label = "";
		if (property["sap:label"]) {
			label = property["sap:label"];
		}
		try {
			const lineItemsAnnotations = odataEntityType["com.sap.vocabularies.UI.v1.LineItem"];
			label = lineItemsAnnotations.find((dataField: { Value: { Path: any } }) => dataField.Value.Path === propertyName).Label.String;
		} catch (error) {
			Log.debug(`SpreadsheetUpload: ${propertyName} not found as a LineItem Label`, undefined, "SpreadsheetUpload: MetadataHandlerV2");
		}
		if (label.startsWith("{") && label.endsWith("}")) {
			try {
				label = this.parseI18nText(label, this.spreadsheetUploadController.view);
			} catch (error) {
				Log.debug(`SpreadsheetUpload: ${label} not found as a Resource Bundle and i18n text`, undefined, "SpreadsheetUpload: MetadataHandlerV2");
			}
		}

		if (label === "") {
			label = propertyName;
		}
		return label;
	}

	/**
	 * Creates a list of properties that are defined mandatory in the OData metadata V2
	 * @param odataType
	 **/
	getKeyList(odataEntityType: any): string[] {
		let keys: string[] = [];
		if (this.spreadsheetUploadController.component.getSkipMandatoryFieldCheck()) {
			return keys;
		}

		for (const property of odataEntityType.property) {
			// if property is mandatory, field should be in spreadsheet file
			const propertyName = property.name;
			// skip sap property
			if (propertyName.startsWith("SAP__")) {
				continue;
			}
			if (
				!this.spreadsheetUploadController.component.getSkipMandatoryFieldCheck() &&
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
