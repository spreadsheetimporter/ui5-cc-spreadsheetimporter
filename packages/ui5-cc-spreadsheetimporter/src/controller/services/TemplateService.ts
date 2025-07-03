import ManagedObject from 'sap/ui/base/ManagedObject';
import Component from '../../Component';
import SpreadsheetUpload from '../SpreadsheetUpload';
import Util from '../Util';
import MessageToast from 'sap/m/MessageToast';
import * as XLSX from 'xlsx';
import Log from 'sap/base/Log';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';

/**
 * TemplateService handles spreadsheet template generation and download.
 * This service creates Excel templates based on component configuration
 * and provides both custom template download and dynamic template generation.
 *
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class TemplateService extends ManagedObject {
  private component: Component;
  private spreadsheetUploadController: SpreadsheetUpload;
  private util: Util;

  constructor(component: Component, spreadsheetUploadController: SpreadsheetUpload, resourceBundle: ResourceBundle) {
    super();
    this.component = component;
    this.spreadsheetUploadController = spreadsheetUploadController;
    this.util = new Util(resourceBundle);
  }

  /**
   * Downloads template - either custom template file or generates one dynamically
   */
  async downloadTemplate(): Promise<void> {
    // Check if custom template is provided, otherwise generate it
    if (this.component.getSpreadsheetTemplateFile() !== '') {
      await this.downloadCustomTemplate();
    } else {
      await this.generateAndDownloadTemplate();
    }
  }

  /**
   * Downloads a custom template file (from URL or local path)
   */
  private async downloadCustomTemplate(): Promise<void> {
    try {
      const templateFile = this.component.getSpreadsheetTemplateFile();
      let arrayBuffer: ArrayBuffer;
      let fileName: string | undefined;

      if (typeof templateFile === 'string') {
        // Check if the string is a HTTP/HTTPS address
        if (templateFile.startsWith('http://') || templateFile.startsWith('https://')) {
          const response = await fetch(templateFile);
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          fileName = templateFile.split('/').pop();
          arrayBuffer = await response.arrayBuffer();
        }
        // Assume the string is a local file path
        else {
          const sPath = sap.ui.require.toUrl(templateFile);
          const response = await fetch(sPath);
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          fileName = templateFile.split('/').pop();
          arrayBuffer = await response.arrayBuffer();
        }
      } else if (templateFile instanceof ArrayBuffer) {
        // If the input is already an ArrayBuffer, use it directly
        arrayBuffer = templateFile;
      } else {
        throw new Error('Unsupported type for templateFile');
      }

      // Spreadsheet file name will overwrite the template file name
      if (this.component.getSpreadsheetFileName() !== 'Template.xlsx' || fileName === undefined) {
        fileName = this.component.getSpreadsheetFileName();
      }

      Util.downloadSpreadsheetFile(arrayBuffer, fileName);
    } catch (error) {
      Log.error('Error loading custom template file', error as Error, 'TemplateService');
      throw error;
    }
  }

  /**
   * Generates and downloads a dynamic template based on component configuration
   */
  private async generateAndDownloadTemplate(): Promise<void> {
    try {
      const fieldMatchType = this.component.getFieldMatchType();
      const worksheet = {} as XLSX.WorkSheet;
      const colWidths: { wch: number }[] = []; // array to store column widths
      let sampleData = this.component.getSampleData() as any[];
      let sampleDataDefined = true;

      // If sampledata is empty add one row of empty data
      if (!sampleData || sampleData.length === 0) {
        sampleDataDefined = false;
        sampleData = [{}];
      }

      const colWidthDefault = 15;
      const colWidthDate = 20;
      let col = 0;
      let rows = 1;

      if (this.component.getStandalone()) {
        col = this.generateStandaloneTemplate(worksheet, sampleData, col, rows);
      } else {
        col = await this.generateODataTemplate(
          worksheet,
          fieldMatchType,
          sampleData,
          sampleDataDefined,
          colWidths,
          colWidthDefault,
          colWidthDate,
          col,
          rows
        );
      }

      // Set worksheet range and column widths
      worksheet['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: col - 1, r: sampleData.length } });
      if (colWidths.length > 0) {
        worksheet['!cols'] = colWidths;
      }

      // Create and download the workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, worksheet, 'Tabelle1');
      XLSX.writeFile(wb, this.component.getSpreadsheetFileName());

      MessageToast.show(this.util.geti18nText('spreadsheetimporter.downloadingTemplate'));
    } catch (error) {
      Log.error('Error generating template', error as Error, 'TemplateService');
      throw error;
    }
  }

  /**
   * Generates template for standalone mode using component columns
   */
  private generateStandaloneTemplate(worksheet: XLSX.WorkSheet, sampleData: any[], col: number, rows: number): number {
    // Create headers
    for (const column of this.component.getColumns()) {
      worksheet[XLSX.utils.encode_cell({ c: col, r: 0 })] = { v: column, t: 's' };
      col++;
    }

    // Add sample data
    let currentCol = 0;
    for (const column of this.component.getColumns()) {
      for (const [index, data] of sampleData.entries()) {
        rows = index + 1;
        if (data[column]) {
          const sampleDataValue = data[column];
          worksheet[XLSX.utils.encode_cell({ c: currentCol, r: rows })] = { v: sampleDataValue, t: 's' };
        }
      }
      currentCol++;
    }

    return col;
  }

  /**
   * Generates template for OData mode using metadata information
   */
  private async generateODataTemplate(
    worksheet: XLSX.WorkSheet,
    fieldMatchType: string,
    sampleData: any[],
    sampleDataDefined: boolean,
    colWidths: { wch: number }[],
    colWidthDefault: number,
    colWidthDate: number,
    col: number,
    rows: number
  ): Promise<number> {
    for (const [key, value] of this.spreadsheetUploadController.typeLabelList.entries()) {
      // Create header label
      let label = '';
      if (fieldMatchType === 'label') {
        label = value.label;
      }
      if (fieldMatchType === 'labelTypeBrackets') {
        label = `${value.label}[${key}]`;
      }
      worksheet[XLSX.utils.encode_cell({ c: col, r: 0 })] = { v: label, t: 's' };

      // Create sample data for each row
      for (const [index, data] of sampleData.entries()) {
        let sampleDataValue;
        rows = index + 1;
        if (data[key]) {
          sampleDataValue = data[key];
        }

        const cell = await this.createCellByType(value.type, value, sampleDataValue, sampleDataDefined, colWidthDefault, colWidthDate);

        if (!this.component.getHideSampleData()) {
          worksheet[XLSX.utils.encode_cell({ c: col, r: rows })] = cell.cellObject;
        }

        // Add column width if not already added for this column
        if (index === 0) {
          colWidths.push(cell.columnWidth);
        }
      }
      col++;
    }

    return col;
  }

  /**
   * Creates a cell object based on OData type
   */
  private async createCellByType(
    type: string,
    typeInfo: any,
    sampleDataValue: any,
    sampleDataDefined: boolean,
    colWidthDefault: number,
    colWidthDate: number
  ): Promise<{ cellObject: XLSX.CellObject; columnWidth: { wch: number } }> {
    let cell: XLSX.CellObject = { v: '', t: 's' };
    let columnWidth = { wch: colWidthDefault };

    if (type === 'Edm.Boolean') {
      const defaultValue = sampleDataDefined ? '' : 'true';
      sampleDataValue = sampleDataValue ? sampleDataValue.toString() : defaultValue;
      cell = { v: sampleDataValue, t: 'b' };
    } else if (type === 'Edm.String') {
      let newStr;
      if (typeInfo.maxLength) {
        newStr = sampleDataValue ? sampleDataValue : 'test string'.substring(0, typeInfo.maxLength);
      } else {
        newStr = sampleDataValue ? sampleDataValue : 'test string';
      }
      const defaultValue: string = sampleDataDefined ? '' : newStr;
      sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
      cell = { v: sampleDataValue, t: 's' };
    } else if (type === 'Edm.DateTimeOffset' || type === 'Edm.DateTime') {
      let format;
      const currentLang = await Util.getLanguage();
      if (currentLang.startsWith('en')) {
        format = 'mm/dd/yyyy hh:mm AM/PM';
      } else {
        format = 'dd.mm.yyyy hh:mm';
      }

      const defaultValue = sampleDataDefined ? '' : new Date();
      sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
      const cellFormat: XLSX.ExcelDataType = sampleDataValue ? 'd' : 's';
      cell = { v: sampleDataValue, t: cellFormat, z: format };
      columnWidth = { wch: colWidthDate };
    } else if (type === 'Edm.Date') {
      const defaultValue = sampleDataDefined ? '' : new Date();
      sampleDataValue = sampleDataValue ? sampleDataValue.toString() : defaultValue;
      const cellFormat: XLSX.ExcelDataType = sampleDataValue ? 'd' : 's';
      cell = { v: sampleDataValue, t: cellFormat };
    } else if (type === 'Edm.TimeOfDay' || type === 'Edm.Time') {
      const defaultValue = sampleDataDefined ? '' : new Date();
      sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
      const cellFormat: XLSX.ExcelDataType = sampleDataValue ? 'd' : 's';
      cell = { v: sampleDataValue, t: cellFormat, z: 'hh:mm' };
    } else if (
      type === 'Edm.UInt8' ||
      type === 'Edm.Int16' ||
      type === 'Edm.Int32' ||
      type === 'Edm.Integer' ||
      type === 'Edm.Int64' ||
      type === 'Edm.Integer64'
    ) {
      const defaultValue = sampleDataDefined ? '' : 85;
      sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
      cell = { v: sampleDataValue, t: 'n' };
    } else if (type === 'Edm.Double' || type === 'Edm.Decimal') {
      const decimalSeparator = this.component.getDecimalSeparator();
      const defaultValue = sampleDataDefined ? '' : `123${decimalSeparator}4`;
      sampleDataValue = sampleDataValue ? sampleDataValue.toString() : defaultValue;
      cell = { v: sampleDataValue, t: 'n' };
    }

    return { cellObject: cell, columnWidth };
  }
}
