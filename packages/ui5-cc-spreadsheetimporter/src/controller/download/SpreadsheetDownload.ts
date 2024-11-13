import ManagedObject from "sap/ui/base/ManagedObject";
import { EntityDefinition, EntityObject, PropertyWithOrder, DeepDownloadConfig } from "../../types";
import * as XLSX from "xlsx";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Component from "../../Component";
import OData from "../odata/OData";
import Util from "../Util";
/**
 * @namespace cc.spreadsheetimporter.download.XXXnamespaceXXX
 */
export default class SpreadsheetDownload extends ManagedObject {
	spreadsheetUploadController: SpreadsheetUpload;
	component: Component;
	odataHandler: OData;

	constructor(spreadsheetUploadController: SpreadsheetUpload, component: Component, odataHandler: OData) {
		super();
		this.spreadsheetUploadController = spreadsheetUploadController;
		this.component = component;
		this.odataHandler = odataHandler;
	}

	async downloadSpreadsheet(entityDefinition: EntityDefinition, spreadsheetExportConfig: DeepDownloadConfig): Promise<void> {
		let filename = spreadsheetExportConfig.filename || this.spreadsheetUploadController.getOdataType() + ".xlsx";
		const wb = XLSX.utils.book_new(); // creating the new spreadsheet work book

		await this._appendRootEntitySheet(wb, entityDefinition, spreadsheetExportConfig);
		if (spreadsheetExportConfig.deepExport) {
			await this._appendSiblingsSheetsRecursively(wb, entityDefinition, entityDefinition, spreadsheetExportConfig);
		}
		// check if filename ends with .xlsx if not add it
		if (!filename.endsWith(".xlsx")) {
			filename = filename.concat(".xlsx");
		}

		// download the created spreadsheet file
		XLSX.writeFile(wb, filename);
		// MessageToast.show(this.util.geti18nText("downloadingTemplate"));
	}

	async downloadSpreadsheetFlatTemplate(entityDefinition: EntityDefinition, downloadTemplate: boolean, spreadsheetExportConfig: DeepDownloadConfig): Promise<void> {
		const properties = await this._extractProperties(spreadsheetExportConfig.columns, entityDefinition, "root");
		// Sort properties based on the order and then map to get the property names
		const sortedProperties = properties.sort((a, b) => a.order - b.order).map((p) => p.name);
		var worksheet = {} as XLSX.WorkSheet;
		// loop over sorted properties and add them to the worksheet
		for (let i = 0; i < sortedProperties.length; i++) {
			worksheet[XLSX.utils.encode_cell({ c: i, r: 0 })] = { v: sortedProperties[i], t: "s" };
		}
		worksheet["!ref"] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: sortedProperties.length - 1, r: 0 } });
		const wb = XLSX.utils.book_new();
		wb.SheetNames.push("Template");
		wb.Sheets["Template"] = worksheet;
		// download the created spreadsheet file
		XLSX.writeFile(wb, "Template.xlsx");
	}

	async _appendRootEntitySheet(wb: XLSX.WorkBook, entityDefinition: EntityDefinition, spreadsheetExportConfig: DeepDownloadConfig): Promise<void> {
		if (entityDefinition.$XYZData) {
			const data = entityDefinition.$XYZData;
			const labelList = await this.odataHandler.getLabelList([], this.spreadsheetUploadController.getOdataType(), this.component.getExcludeColumns());
			if (spreadsheetExportConfig.addKeysToExport) {
				this.odataHandler.addKeys(labelList, this.spreadsheetUploadController.getOdataType());
			}
			const sheet = this._getSheet(labelList, data, entityDefinition.SiblingEntity.$Type, spreadsheetExportConfig, entityDefinition["$XYZColumns"], undefined);
			const sheetName = this.spreadsheetUploadController.getOdataType().split(".").pop();
			if (wb.SheetNames.includes(sheetName)) {
				sheetName.concat("_1");
			}
			XLSX.utils.book_append_sheet(wb, sheet, sheetName);
		}
	}

	async _appendSiblingsSheetsRecursively(
		wb: XLSX.WorkBook,
		entityDefinition: EntityDefinition,
		parentEntity: any,
		spreadsheetExportConfig: DeepDownloadConfig
	): Promise<void> {
		for (const property in entityDefinition) {
			const currentEntity = entityDefinition[property];

			if (!currentEntity.$XYZFetchableEntity) continue;
			if (!currentEntity.$XYZData) continue;

			// if (currentEntity["$XYZColumns"] && currentEntity["$XYZColumns"].length > 0) {
				const data = currentEntity.$XYZData;

				const labelList = await this.odataHandler.getLabelList([], currentEntity.$Type, this.component.getExcludeColumns());
				if (spreadsheetExportConfig.addKeysToExport) {
					this.odataHandler.addKeys(labelList, currentEntity.$Type, parentEntity, currentEntity.$Partner);
				}

				const sheet = this._getSheet(labelList, data, currentEntity.$Type, spreadsheetExportConfig, currentEntity["$XYZColumns"], entityDefinition.SiblingEntity.$Type);
				let sheetName = currentEntity.$Type.split(".").pop();
				let suffix = 0;
				let originalSheetName = sheetName;
				let availableLength = 31 - ("_" + suffix).length;
				sheetName = originalSheetName.substring(0, availableLength) + (suffix > 0 ? "_" + suffix : "");

				while (wb.SheetNames.includes(sheetName)) {
					suffix++;
					availableLength = 31 - ("_" + suffix).length;
					sheetName = originalSheetName.substring(0, availableLength) + "_" + suffix;
				}

				XLSX.utils.book_append_sheet(wb, sheet, sheetName);
			// }

			// Recursively append other nested navigation properties.
			// Also, pass the current entity as parent for the next level.
			await this._appendSiblingsSheetsRecursively(wb, currentEntity.$XYZEntity, entityDefinition, spreadsheetExportConfig);
		}
	}

	_getSheet(labelList: any, dataArray: any, entityType: string, spreadsheetExportConfig: DeepDownloadConfig, columnsConfig: string[], parentEntityType?: string): XLSX.WorkSheet {
		let rows = dataArray.length;
		let fieldMatchType = this.component.getFieldMatchType();
		var worksheet = {} as XLSX.WorkSheet;
		let colWidths: { wch: number }[] = []; // array to store column widths
		const colWidthDefault = 15;
		const colWidthDate = 20;
		let col = 0;
		let startRow = 0;
		// remove columns from map labelist that are not in the config
		if (columnsConfig && columnsConfig.length > 0) {
			for (let key of labelList.keys()) {
				if (!columnsConfig.includes(key)) {
					labelList.delete(key);
				}
			}
		}
		// add column headers and data
		for (let [key, value] of labelList.entries()) {
			let width = colWidthDefault;
			let cell = { v: "", t: "s" } as XLSX.CellObject;
			let label = "";
			if (fieldMatchType === "label") {
				label = value.label;
			}
			if (fieldMatchType === "labelTypeBrackets") {
				label = `${value.label}[${key}]`;
			}
			worksheet[XLSX.utils.encode_cell({ c: col, r: startRow })] = { v: label, t: "s" };

			for (const [index, data] of dataArray.entries()) {
				let sampleDataValue = "";
				rows = index + 1 + startRow;
				if (data[key]) {
					sampleDataValue = data[key];
				} else {
					worksheet[XLSX.utils.encode_cell({ c: col, r: rows })] = { v: "", t: "s" }; // Set the cell as empty
					continue; // Move to the next iteration
				}
				if (value.type === "Edm.Boolean") {
					cell = {
						v: sampleDataValue.toString(),
						t: "b"
					};
				} else if (value.type === "Edm.String" || value.type === "Edm.Guid" || value.type === "Edm.Any") {
					cell = { v: sampleDataValue, t: "s" };
				} else if (value.type === "Edm.DateTimeOffset" || value.type === "Edm.DateTime") {
					let format;
					const currentLang = sap.ui.getCore().getConfiguration().getLanguage();
					if (currentLang.startsWith("en")) {
						format = "mm/dd/yyyy hh:mm AM/PM";
					} else {
						format = "dd.mm.yyyy hh:mm";
					}

					cell = { v: sampleDataValue, t: "d", z: format };
					width = colWidthDate;
				} else if (value.type === "Edm.Date") {
					cell = {
						v: sampleDataValue,
						t: "d"
					};
				} else if (value.type === "Edm.TimeOfDay" || value.type === "Edm.Time") {
					cell = {
						v: sampleDataValue,
						t: "d",
						z: "hh:mm"
					};
				} else if (
					value.type === "Edm.UInt8" ||
					value.type === "Edm.Int16" ||
					value.type === "Edm.Int32" ||
					value.type === "Edm.Integer" ||
					value.type === "Edm.Int64" ||
					value.type === "Edm.Integer64"
				) {
					cell = {
						v: sampleDataValue,
						t: "n"
					};
				} else if (value.type === "Edm.Double" || value.type === "Edm.Decimal") {
					const decimalSeparator = this.component.getDecimalSeparator();
					cell = {
						v: sampleDataValue,
						t: "n"
					};
				}

				worksheet[XLSX.utils.encode_cell({ c: col, r: rows })] = cell;
			}
			colWidths.push({ wch: width });
			col++;
		}

		worksheet["!ref"] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: col - 1, r: dataArray.length + startRow } });
		worksheet["!cols"] = colWidths; // assign the column widths to the worksheet
		return worksheet;
	}

	getFlatSheet() {}

	// Function to extract the properties from input config and metadata
	async _extractProperties(proConfigColumns: any, entityMetadata: any, entityType: string): Promise<PropertyWithOrder[]> {
		const labelList = await this.odataHandler.getLabelList([], entityType, this.component.getExcludeColumns());
		let properties: PropertyWithOrder[] = [];

		for (let prop in proConfigColumns) {
			if (proConfigColumns[prop].order !== undefined && proConfigColumns[prop].data !== undefined && entityMetadata[prop]) {
				const label = labelList.get(prop);
				let headerName: string;
				if (label) {
					headerName = `${label.label} [${entityType.split(".").pop()}][${prop}]`;
				} else {
					headerName = `${prop} [${entityType.split(".").pop()}][${prop}]`;
				}
				properties.push({ name: headerName, order: proConfigColumns[prop].order });
			} else if (typeof proConfigColumns[prop] === "object") {
				properties = properties.concat(await this._extractProperties(proConfigColumns[prop], entityMetadata[prop].$XYZEntity, entityMetadata[prop].$Type));
			}
		}

		return properties;
	}

	_findAttributeByType(obj: Record<string, EntityObject>, typeToSearch: string): string | undefined {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const entity = obj[key];
				if (entity.$Type === typeToSearch) {
					return key;
				}
			}
		}
		return undefined; // if not found
	}

	public async _fetchData(deepDownloadConfig: DeepDownloadConfig) {
		const { mainEntity, expands } = this.odataHandler.getODataEntitiesRecursive(this.spreadsheetUploadController.getOdataType(), deepDownloadConfig.deepLevel);
		const batchSize = 1000;
		const customBinding = this.odataHandler.getBindingFromBinding(this.spreadsheetUploadController.binding, expands);

		// Start fetching the batches
		const totalResults = await this.odataHandler.fetchBatch(customBinding, batchSize);
		const data = Util.extractObjects(totalResults);
		this._recursiveAssignData(data, mainEntity);
		this._recursiveAssignDataRoot(deepDownloadConfig.columns, mainEntity);
		this._recursiveAssignColumnsRoot(deepDownloadConfig.columns, mainEntity);
		this._recursiveAssignColumns(deepDownloadConfig.columns, mainEntity);
		mainEntity.$XYZData = data;
		return mainEntity;
	}

	private _recursiveAssignData(data: any, entity: any) {
		// Iterate through properties of the current entity
		for (const property in entity) {
			// If the property signifies a fetchable entity
			if (entity[property].$XYZFetchableEntity) {
				let subEntityDataTotal = [];
				for (const row in data) {
					const currentEntity = data[row];
					const subEntityData = currentEntity[property];
					if (subEntityData) {
						subEntityDataTotal = subEntityDataTotal.concat(subEntityData);
					}
					delete currentEntity[property]; // remove the data
				}
				entity[property].$XYZData = subEntityDataTotal;

				// Recursive call to handle deeper levels
				this._recursiveAssignData(subEntityDataTotal, entity[property].$XYZEntity);
			}
		}
	}

	private _recursiveAssignDataRoot(data: any, entity: any) {
		// Iterate through properties of the current entity
		entity.$XYZData = [];
		let row = {};
		for (const column in data) {
			if (entity.hasOwnProperty(column) && !entity[column].$XYZFetchableEntity) {
				if (!entity["$XYZColumns"]) entity["$XYZColumns"] = [];
				row[column] = data[column];
			}
		}
		entity.$XYZData.push(row);
	}

	private _recursiveAssignColumnsRoot(data: any, entity: any) {
		for (const column in data) {
			if (entity.hasOwnProperty(column) && !entity[column].$XYZFetchableEntity) {
				if (!entity["$XYZColumns"]) entity["$XYZColumns"] = [];
				entity["$XYZColumns"].push(column);
			}
		}
	}

	// function to assign columns to the sub entities
	private _recursiveAssignColumns(data: any, entity: any) {
		for (const property in entity) {
			// If the property signifies a fetchable entity
			if (entity[property].$XYZFetchableEntity && data.hasOwnProperty(property)) {
				const subEntity = entity[property].$XYZEntity;
				// Defined Columns in the pro config
				for (const column in data[property]) {
					if (subEntity.hasOwnProperty(column) && !subEntity[column].$XYZFetchableEntity) {
						if (!entity[property]["$XYZColumns"]) entity[property]["$XYZColumns"] = [];
						entity[property]["$XYZColumns"].push(column);
					}
				}
				this._recursiveAssignColumns(data[property], entity[property].$XYZEntity);
			}
		}
	}
}
