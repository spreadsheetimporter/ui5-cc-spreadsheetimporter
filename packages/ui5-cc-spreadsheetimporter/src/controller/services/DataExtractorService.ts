import ManagedObject from "sap/ui/base/ManagedObject";
import * as XLSX from "xlsx";
import { ArrayData } from "../../types";
import SheetHandler from "../SheetHandler";
import Log from "sap/base/Log";

/**
 * DataExtractorService handles extracting data from spreadsheet sheets.
 * This service is responsible for reading sheet data with coordinates
 * and preparing it for further processing.
 *
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class DataExtractorService extends ManagedObject {

    /**
     * Extracts data from a single sheet
     * @param workbook The workbook
     * @param sheetName The sheet name
     * @param coordinates Optional A1 notation coordinates for header row
     * @returns Object with spreadsheet data and column names
     */
    extractSheetData(
        workbook: XLSX.WorkBook,
        sheetName: string,
        coordinates?: string
    ): { spreadsheetSheetsData: ArrayData, columnNames: string[] } {

        // Extract data using SheetHandler
        const spreadsheetSheetsData = SheetHandler.sheet_to_json(
            workbook.Sheets[sheetName],
            undefined,
            coordinates
        );

        // Get column names using header=1 option with the same coordinates
        const headerOptions = { header: 1 };
        const firstRow = SheetHandler.sheet_to_json(
            workbook.Sheets[sheetName],
            headerOptions,
            coordinates
        )[0];

        // Ensure column names are strings
        const rawColumns = Array.isArray(firstRow)
            ? firstRow
            : Object.values(firstRow || {});

        const columnNames = rawColumns.map(column => {
            if (typeof column === 'object' && column !== null && 'rawValue' in column) {
                return column.rawValue || '';
            }
            return String(column || '');
        });

        // Validate that the sheet has data
        if (!spreadsheetSheetsData || spreadsheetSheetsData.length === 0) {
            throw new Error("The file contains no data");
        }

        // Trim values
        for (const object of spreadsheetSheetsData) {
            for (const key in object) {
                object[key].rawValue = typeof object[key].rawValue === "string"
                    ? object[key].rawValue.trim()
                    : object[key].rawValue;
            }
        }

        return { spreadsheetSheetsData, columnNames };
    }

    /**
     * Extracts data from all sheets (for standalone mode)
     * @param workbook The workbook
     * @returns Object with combined data and column names
     */
    extractAllSheetsData(
        workbook: XLSX.WorkBook
    ): { spreadsheetSheetsData: ArrayData, columnNames: string[] } {

        let spreadsheetSheetsData: ArrayData = [];
        let columnNames: string[] = [];

        for (const sheet of Object.keys(workbook.Sheets)) {
            let currSheetData = SheetHandler.sheet_to_json(workbook.Sheets[sheet]);

            // Tag each data item with the sheet name
            for (const dataVal of currSheetData) {
                Object.keys(dataVal).forEach((key) => {
                    dataVal[key].sheetName = sheet;
                });
            }

            spreadsheetSheetsData = spreadsheetSheetsData.concat(currSheetData);

            // Add column names from this sheet
            const sheetColumnNames = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet],
                { header: 1 }
            )[0] as string[];

            columnNames = columnNames.concat(sheetColumnNames);
        }

        return { spreadsheetSheetsData, columnNames };
    }

    /**
     * Gets raw sheet data as array of arrays (for wizard preview)
     * @param workbook The workbook
     * @param sheetName The sheet name
     * @returns Array of arrays representing the sheet data
     */
    getRawSheetData(workbook: XLSX.WorkBook, sheetName: string): any[][] {
        return XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetName],
            { header: 1, raw: false, dateNF: "yyyy-mm-dd" }
        ) as any[][];
    }

    /**
     * Extracts raw values from payloadArray
     * @param data The payload array
     * @returns Array of objects with raw values only
     */
    extractRawValues(data: any[]): any[] {
        return data.map((item) => {
            const newObj: { [key: string]: any } = {};
            for (const key in item) {
                if (item[key].hasOwnProperty("rawValue")) {
                    newObj[key] = item[key].rawValue;
                }
            }
            return newObj;
        });
    }

    /**
     * Extracts parsed/formatted values from payloadArray
     * @param data The payload array
     * @returns Array of objects with formatted values only
     */
    extractParsedValues(data: any[]): any[] {
        return data.map((item) => {
            const newObj: { [key: string]: any } = {};
            for (const key in item) {
                if (item[key].hasOwnProperty("formattedValue")) {
                    newObj[key] = item[key].formattedValue;
                }
            }
            return newObj;
        });
    }
}
