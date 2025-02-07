import ManagedObject from "sap/ui/base/ManagedObject";
import * as XLSX from "xlsx";
import { EntityDefinition, DeepDownloadConfig } from "../../types";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Component from "../../Component";
import OData from "../odata/OData";
import Util from "../Util";
import Log from "sap/base/Log";

/**
 * @namespace cc.spreadsheetimporter.download.XXXnamespaceXXX
 */
export default class SpreadsheetGenerator extends ManagedObject {
    spreadsheetUploadController: SpreadsheetUpload;
    component: Component;
    odataHandler: OData;
    currentLang: string;

    constructor(spreadsheetUploadController: SpreadsheetUpload, component: Component, odataHandler: OData) {
        super();
        this.spreadsheetUploadController = spreadsheetUploadController;
        this.component = component;
        this.odataHandler = odataHandler;
    }

    async downloadSpreadsheet(entityDefinition: EntityDefinition, spreadsheetExportConfig: DeepDownloadConfig): Promise<void> {
        this.currentLang = await Util.getLanguage();
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

        let isDefaultPrevented = false;

        try {
            const asyncEventBeforeDownloadFileExport = await Util.fireEventAsync("beforeDownloadFileExport", { workbook: wb, filename: filename }, this.component);
            isDefaultPrevented = asyncEventBeforeDownloadFileExport.bPreventDefault;
        } catch (error) {
            Log.error("Error while calling the beforeDownloadFileExport event", error as Error, "SpreadsheetGenerator.ts", "downloadSpreadsheet");
        }

        if (isDefaultPrevented) {
            return;
        }

        // download the created spreadsheet file
        XLSX.writeFile(wb, filename);
    }

    private async _appendRootEntitySheet(wb: XLSX.WorkBook, entityDefinition: EntityDefinition, spreadsheetExportConfig: DeepDownloadConfig): Promise<void> {
        if (entityDefinition.$XYZData) {
            const data = entityDefinition.$XYZData;
            const labelList = await this.odataHandler.getLabelList([], this.spreadsheetUploadController.getOdataType(), this.component.getExcludeColumns());
            if (spreadsheetExportConfig.addKeysToExport) {
                this.odataHandler.addKeys(labelList, this.spreadsheetUploadController.getOdataType());
            }
            const sheet = this._getSheet(labelList, data, entityDefinition["$XYZColumns"]);
            const sheetName = this.spreadsheetUploadController.getOdataType().split(".").pop();
            if (wb.SheetNames.includes(sheetName)) {
                sheetName.concat("_1");
            }
            XLSX.utils.book_append_sheet(wb, sheet, sheetName);
        }
    }

    private async _appendSiblingsSheetsRecursively(
        wb: XLSX.WorkBook,
        entityDefinition: EntityDefinition,
        parentEntity: any,
        spreadsheetExportConfig: DeepDownloadConfig
    ): Promise<void> {
        for (const property in entityDefinition) {
            const currentEntity = entityDefinition[property];

            if (!currentEntity.$XYZFetchableEntity) continue;
            if (!currentEntity.$XYZData) continue;

            const data = currentEntity.$XYZData;
            const labelList = await this.odataHandler.getLabelList([], currentEntity.$Type, this.component.getExcludeColumns());
            if (spreadsheetExportConfig.addKeysToExport) {
                this.odataHandler.addKeys(labelList, currentEntity.$Type, parentEntity, currentEntity.$Partner);
            }

            const sheet = this._getSheet(labelList, data, currentEntity["$XYZColumns"]);
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

            // Recursively append other nested navigation properties.
            // Also, pass the current entity as parent for the next level.
            await this._appendSiblingsSheetsRecursively(wb, currentEntity.$XYZEntity, entityDefinition, spreadsheetExportConfig);
        }
    }

    private _getSheet(labelList: any, dataArray: any, columnsConfig: string[]): XLSX.WorkSheet {
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
                const label = labelList.get(key);
                if (!columnsConfig.includes(key) && !label?.$XYZKey) {
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
                if (data.hasOwnProperty(key)) {
                    sampleDataValue = data[key];
                } else {
                    worksheet[XLSX.utils.encode_cell({ c: col, r: rows })] = { v: "", t: "s" }; // Set the cell as empty
                    continue; // Move to the next iteration
                }

                cell = this._getCellForType(value.type, sampleDataValue);
                if (value.type === "Edm.DateTimeOffset" || value.type === "Edm.DateTime") {
                    width = colWidthDate;
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

    private _getCellForType(type: string, value: any): XLSX.CellObject {
        switch (type) {
            case "Edm.Boolean":
                return { v: value, t: "b" };
            case "Edm.String":
            case "Edm.Guid":
            case "Edm.Any":
                return { v: value, t: "s" };
            case "Edm.DateTimeOffset":
            case "Edm.DateTime":
                const format = this.currentLang.startsWith("en") ? "mm/dd/yyyy hh:mm AM/PM" : "dd.mm.yyyy hh:mm";
                return { v: value, t: "d", z: format };
            case "Edm.Date":
                return { v: value, t: "d" };
            case "Edm.TimeOfDay":
            case "Edm.Time":
                return { v: value, t: "d", z: "hh:mm" };
            case "Edm.UInt8":
            case "Edm.Int16":
            case "Edm.Int32":
            case "Edm.Integer":
            case "Edm.Int64":
            case "Edm.Integer64":
            case "Edm.Double":
            case "Edm.Decimal":
                return { v: value, t: "n" };
            default:
                return { v: value, t: "s" };
        }
    }

    private async _extractProperties(proConfigColumns: any, entityMetadata: any, entityType: string): Promise<PropertyWithOrder[]> {
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
}