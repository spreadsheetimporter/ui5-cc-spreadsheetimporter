import ManagedObject from 'sap/ui/base/ManagedObject';
import * as XLSX from 'xlsx';
import Log from 'sap/base/Log';

/**
 * FileService handles all file and workbook related operations.
 * This includes reading files, creating workbooks, and sheet selection.
 *
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class FileService extends ManagedObject {
  /**
   * Reads a file and returns an XLSX workbook
   * @param file The file to read
   * @returns Promise resolving to the workbook
   */
  async readFile(file: Blob): Promise<XLSX.WorkBook> {
    try {
      const data = await this.bufferRS(file.stream());
      return XLSX.read(data, {
        cellNF: true,
        cellDates: true,
        cellText: true,
        cellFormula: true
      });
    } catch (error) {
      Log.error('Error reading workbook', error as Error, 'FileService');
      throw error;
    }
  }

  /**
   * Gets the sheet name based on options
   * @param workbook The workbook
   * @param sheetOption Sheet index, name, or "XXSelectorXX" for dialog
   * @param i18nBundle Resource bundle for dialog texts
   * @returns Promise resolving to sheet name
   */
  async getSheetName(workbook: XLSX.WorkBook, sheetOption: string | number, i18nBundle?: any): Promise<string> {
    let sheetName: string;

    if (typeof sheetOption === 'number') {
      if (sheetOption >= 0 && sheetOption < workbook.SheetNames.length) {
        sheetName = workbook.SheetNames[sheetOption];
      } else {
        Log.error('Invalid sheet index, defaulting to first Sheet', undefined, 'FileService');
        sheetName = workbook.SheetNames[0];
      }
    } else if (sheetOption === 'XXSelectorXX') {
      if (workbook.SheetNames.length === 1) {
        sheetName = workbook.SheetNames[0];
        Log.debug('Only one sheet in workbook, defaulting to first Sheet', undefined, 'FileService');
      } else if (i18nBundle) {
        sheetName = await this.displaySheetSelectorDialog(workbook.SheetNames, i18nBundle);
      } else {
        throw new Error('Sheet selector requested but no i18n bundle provided');
      }
    } else if (workbook.SheetNames.includes(sheetOption as string)) {
      sheetName = sheetOption as string;
    } else {
      Log.error('Invalid sheet name, defaulting to first Sheet', undefined, 'FileService');
      sheetName = workbook.SheetNames[0];
    }

    return sheetName;
  }

  /**
   * Gets raw sheet data as array of arrays
   * @param workbook The workbook
   * @param sheetName The sheet name
   * @returns Array of arrays representing the sheet data
   */
  getRawSheetData(workbook: XLSX.WorkBook, sheetName: string): any[][] {
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, dateNF: 'yyyy-mm-dd' }) as any[][];
  }

  /**
   * Converts a ReadableStream to a buffer
   */
  private async bufferRS(stream: ReadableStream): Promise<Uint8Array> {
    const buffers: Uint8Array[] = [];
    const reader = stream.getReader();

    for (;;) {
      const res = await reader.read();
      if (res.value) buffers.push(res.value);
      if (res.done) break;
    }

    const out = new Uint8Array(buffers.reduce((acc, v) => acc + v.length, 0));
    let off = 0;
    for (const u8 of buffers) {
      out.set(u8, off);
      off += u8.length;
    }

    return out;
  }

  /**
   * Shows a dialog for sheet selection
   */
  private displaySheetSelectorDialog(sheetNames: string[], i18nBundle: any): Promise<string> {
    return new Promise((resolve, reject) => {
      // lazy load UI5 controls only when needed
      sap.ui.require(['sap/m/Select', 'sap/ui/core/Item', 'sap/m/Dialog', 'sap/m/Button'], (Select: any, Item: any, Dialog: any, Button: any) => {
        const select = new Select();
        sheetNames.forEach(name => select.addItem(new Item({ key: name, text: name })));

        const dialog = new Dialog({
          title: i18nBundle.getText('spreadsheetimporter.sheetSelectorDialogTitle'),
          type: 'Message',
          content: [select],
          beginButton: new Button({
            text: i18nBundle.getText('spreadsheetimporter.ok'),
            press: () => {
              resolve(select.getSelectedKey());
              dialog.close();
            }
          }),
          endButton: new Button({
            text: i18nBundle.getText('close'),
            press: () => {
              reject(new Error(i18nBundle.getText('close')));
              dialog.close();
            }
          }),
          afterClose: () => dialog.destroy()
        });
        dialog.open();
      });
    });
  }
}
