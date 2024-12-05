import Log from "sap/base/Log";
import { Columns, Property, ListObject, PropertyArray, PropertyObject } from "../../types";
import MetadataHandler from "./MetadataHandler";
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class MetadataHandlerV4 extends MetadataHandler {
	constructor(spreadsheetUploadController: any) {
		super(spreadsheetUploadController);
	}

	public getLabelList(columns: Columns, odataType: string, excludeColumns: Columns): ListObject {
		let listObject: ListObject = new Map();
		let entityTypeLabel;

		const { annotations, properties } = MetadataHandlerV4.getAnnotationProperties(this.spreadsheetUploadController.context, odataType);
		Log.debug("SpreadsheetUpload: Annotations", undefined, "SpreadsheetUpload: MetadataHandler", () =>
			this.spreadsheetUploadController.component.logger.returnObject(annotations)
		);
		Log.debug("SpreadsheetUpload: Properties", undefined, "SpreadsheetUpload: MetadataHandler", () =>
			this.spreadsheetUploadController.component.logger.returnObject(properties)
		);
		// try get facet label
		try {
			entityTypeLabel = annotations[odataType]["@com.sap.vocabularies.UI.v1.Facets"][0].Label;
		} catch (error) {
			Log.debug(`SpreadsheetUpload: Facet Label not found`, undefined, "SpreadsheetUpload: MetadataHandler");
		}

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
				const property = properties[propertyName];
				if (property) {
					const propertyLabel = annotations[`${odataType}/${propertyName}`];
					let propertyObject: Property = {} as Property;
					propertyObject.label = this.getLabel(annotations, properties, propertyName, propertyLabel, odataType);
					if (!propertyObject.label) {
						propertyObject.label = propertyName;
					}
					propertyObject.type = property.$Type;
					propertyObject.maxLength = property.$MaxLength;
					propertyObject.precision = property.$Precision;
					listObject.set(propertyName, propertyObject);
				} else {
					Log.warning(`SpreadsheetUpload: Property ${propertyName} not found`, undefined, "SpreadsheetUpload: MetadataHandler");
				}
			}
		} else if (columns.length === 0 && excludeColumns.length > 0) {
			const propertiesFiltered = [];
			for (const propertyName in properties) {
				const propertyValue = properties[propertyName];
				if (propertyValue["$kind"] === "Property") {
					propertiesFiltered.push([propertyName, propertyValue]);
				}
			}
			for (const [propertyName, propertyValue] of propertiesFiltered) {
				// if property is in excludeColumns, skip it
				if (excludeColumns.includes(propertyName)) {
					continue;
				}
				const propertyLabel = annotations[`${odataType}/${propertyName}`];
				if (propertyLabel && !propertyLabel["@com.sap.vocabularies.UI.v1.Hidden"] && !propertyName.startsWith("SAP__")) {
					let propertyObject: Property = {} as Property;
					propertyObject.label = this.getLabel(annotations, properties, propertyName, propertyLabel, odataType);
					if (!propertyObject.label) {
						propertyObject.label = propertyName;
					}
					propertyObject.type = propertyValue.$Type;
					propertyObject.maxLength = propertyValue.$MaxLength;
					listObject.set(propertyName, propertyObject);
				}
			}
		} else {
			const propertiesFiltered = [];
			for (const propertyName in properties) {
				const propertyValue = properties[propertyName];
				if (propertyValue["$kind"] === "Property") {
					propertiesFiltered.push([propertyName, propertyValue]);
				}
			}
			for (const [propertyName, propertyValue] of propertiesFiltered) {
				const propertyLabel = annotations[`${odataType}/${propertyName}`];
				if (propertyLabel && !propertyLabel["@com.sap.vocabularies.UI.v1.Hidden"] && !propertyName.startsWith("SAP__")) {
					let propertyObject: Property = {} as Property;
					propertyObject.label = this.getLabel(annotations, properties, propertyName, propertyLabel, odataType);
					if (!propertyObject.label) {
						propertyObject.label = propertyName;
					}
					propertyObject.type = propertyValue.$Type;
					propertyObject.maxLength = propertyValue.$MaxLength;
					listObject.set(propertyName, propertyObject);
				}
			}
		}

		return listObject;
	}

	public getLabel(annotations: { [x: string]: { [x: string]: any } }, properties: any, propertyName: string, propertyLabel: { [x: string]: any }, odataType: string) {
		let label = "";
		if (propertyLabel && propertyLabel["@com.sap.vocabularies.Common.v1.Label"]) {
			label = propertyLabel["@com.sap.vocabularies.Common.v1.Label"];
		}
		if (label === "") {
			try {
				const lineItemsAnnotations = annotations[odataType]["@com.sap.vocabularies.UI.v1.LineItem"];
				label = lineItemsAnnotations.find((dataField: { Value: { $Path: any } }) => dataField.Value.$Path === propertyName).Label;
			} catch (error) {
				Log.debug(`v: ${propertyName} not found as a LineItem Label`, undefined, "SpreadsheetUpload: MetadataHandlerV4");
			}
		}
		if (typeof label === 'string' && label.startsWith("{") && label.endsWith("}")) {
			try {
				label = this.parseI18nText(label, this.spreadsheetUploadController.view);
			} catch (error) {
				Log.debug(`SpreadsheetUpload: ${label} not found as a Resource Bundle and i18n text`, undefined, "SpreadsheetUpload: MetadataHandlerV4");
			}
		}

		if (label === "") {
			label = propertyName;
		}
		return label;
	}

	/**
	 * Creates a list of properties that are defined mandatory in the OData metadata V4
	 * @param odataType
	 **/
	getKeyList(odataType: string): string[] {
		let keys: string[] = [];
		if (this.spreadsheetUploadController.component.getSkipMandatoryFieldCheck()) {
			return keys;
		}

		const { annotations, properties } = MetadataHandlerV4.getAnnotationProperties(this.spreadsheetUploadController.context, odataType);
		const messagesPath = annotations[odataType]?.["@com.sap.vocabularies.Common.v1.Messages"] ?? undefined;

		const propertiesFiltered = Object.entries(properties).filter(([propertyName, propertyValue]) => (propertyValue as any)["$kind"] === "Property");
		for (const [propertyName, propertyValue] of propertiesFiltered) {
			const propertyLabel = annotations[`${odataType}/${propertyName}`];
			if (!propertyLabel) {
				continue;
			}
			// skip messages property
			if (propertyName === messagesPath?.$Path || propertyName.startsWith("SAP__")) {
				continue;
			}
			// if property is mandatory, field should be in spreadsheet file
			if (
				!this.spreadsheetUploadController.component.getSkipMandatoryFieldCheck() &&
				propertyLabel["@com.sap.vocabularies.Common.v1.FieldControl"] &&
				propertyLabel["@com.sap.vocabularies.Common.v1.FieldControl"]["$EnumMember"] &&
				propertyLabel["@com.sap.vocabularies.Common.v1.FieldControl"]["$EnumMember"] === "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory"
			) {
				keys.push(propertyName);
			}
		}
		return keys;
	}

	public getODataEntitiesRecursive(entityName: string, deepLevel: number = Infinity): { mainEntity: any; expands: any } {
		const entities: any = this.spreadsheetUploadController.binding.getModel().getMetaModel().getData();

		if (!entities || !entities[entityName]) {
			throw new Error(`Entity '${entityName}' not found`); // Add appropriate error message and handling
		}

		const mainEntity: any = entities[entityName];
		// Find all entities by navigation properties and add them to the mainEntity, only till the deepLevel (i.e. only mainEntity if deepLevel is 0)
		this._findEntitiesByNavigationProperty(entities, entityName, deepLevel);

		const expands: any = {};
		// Get the expands for the mainEntity till the deepLevel
		this._getExpandsRecursive(mainEntity, expands, undefined, undefined, 0, deepLevel);

		return { mainEntity, expands };
	}

	private _findEntitiesByNavigationProperty(entities: any, rootEntityName: any, deepLevel: number = Infinity): void {
		const queue: { entity: any; entityName: string; parentEntityName: string; level: number }[] = [];
		const traversedEntities: Set<string> = new Set();

		const rootEntity = entities[rootEntityName];

		// Add level tracking to queue items
		queue.push({ entity: rootEntity, entityName: rootEntityName, parentEntityName: "", level: 0 });
		traversedEntities.add(rootEntityName);

		while (queue.length > 0) {
			const { entity, entityName, parentEntityName, level } = queue.shift()!;

			// Skip if we've reached the maximum depth level
			if (level >= deepLevel) {
				continue;
			}

			for (const property in entity) {
				const navProperty = entity[property];

				if (
					navProperty.$kind === "NavigationProperty" &&
					navProperty.$Partner &&
					// TODO: that does not work on 1:1 relationships
					!navProperty.$ReferentialConstraint

					// && !this.isReverseRelationship(entities, navProperty, entityName)
					// && !traversedEntities.has(navProperty.$Type)
				) {
					navProperty.$XYZEntity = entities[navProperty.$Type];
					navProperty.$XYZFetchableEntity = true;

					queue.push({ entity: navProperty.$XYZEntity, entityName: navProperty.$Type, parentEntityName: entityName, level: level + 1 });
					traversedEntities.add(navProperty.$Type);
				}
			}
		}
		
	}
	
	_getExpandsRecursive(mainEntity: any, expands: any, parent?: string, parentExpand?: any, currentLevel: number = 0, deepLevel: number = Infinity) {
		if (currentLevel >= deepLevel) return;

		for (const entity in mainEntity) {
			if (mainEntity[entity].$XYZFetchableEntity) {
				if (parent) {
					parentExpand.$expand = entity;
				} else {
					if (!expands[entity]) {
						expands[entity] = {};
					}
					parentExpand = expands[entity];
				}
				this._getExpandsRecursive(mainEntity[entity].$XYZEntity, expands, entity, parentExpand, currentLevel + 1, deepLevel);
			}
		}
	}

	/**
	 * Adds keys from entity to labelList so it will be added to the sheet
	 * @param labelList 
	 * @param entityName 
	 * @param parentEntity 
	 * @param partner 
	 */
	addKeys(labelList: ListObject, entityName: string, parentEntity?: any, partner?: string) {
		const annotations = this.spreadsheetUploadController.context.getModel().getMetaModel().getData()["$Annotations"];
		const properties = this.spreadsheetUploadController.context.getModel().getMetaModel().getData()[entityName];
		const keys = [];
		// if parentEntity is set, we need to get the key from the parent Entity
		if (parentEntity) {
			const propertyObject = {} as PropertyObject;
			const refConstraint = properties[partner]["$ReferentialConstraint"];
			propertyObject.propertyName = Object.keys(refConstraint)[0];
			const parentPropertyName = refConstraint[propertyObject.propertyName];
			propertyObject.propertyValue = parentEntity[parentPropertyName];
			propertyObject.propertyLabel = annotations[`${entityName}/${propertyObject.propertyName}`];
			keys.push(propertyObject);
		}
		// if parentEntity is not set, we need to get the key from the entity itself
		const entityKeys = properties.$Key;
		for (const key in entityKeys) {
			const propertyObject = {} as PropertyObject;
			propertyObject.propertyName = entityKeys[key];
			propertyObject.propertyValue = properties[entityKeys[key]];
			propertyObject.propertyLabel = annotations[`${entityName}/${propertyObject.propertyName}`];
			keys.push(propertyObject);
		}

		// Create a new Map to make sure the are in the beginning of the spreadsheet
		const newLabelList = new Map<string, Property>();
		
		// Add keys to the new Map
		for (const key of keys) {
			const propertyObject = {} as Property;
			propertyObject.label = this.getLabel(annotations, properties, key.propertyName, key.propertyLabel, entityName);
			if (!propertyObject.label) {
				propertyObject.label = key.propertyName;
			}
			propertyObject.type = key.propertyValue.$Type;
			propertyObject.maxLength = key.propertyValue.$MaxLength;
			propertyObject.$XYZKey = true;
			newLabelList.set(key.propertyName, propertyObject);
		}

		// Merge existing entries after the keys
		labelList.forEach((value, key) => {
			newLabelList.set(key, value);
		});

		// Replace the content of labelList with the new ordered entries
		labelList.clear();
		newLabelList.forEach((value, key) => {
			labelList.set(key, value);
		});
	}

	static getAnnotationProperties(context: any, odataType: string) {
		const model = (context?.getModel && context.getModel()) || context.getView().getModel();
		const annotations = model.getMetaModel().getData()["$Annotations"];
		const properties = model.getMetaModel().getData()[odataType];
		return { annotations, properties };
	}
}
