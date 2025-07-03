import * as XLSX from 'xlsx';
import Log from 'sap/base/Log';

/**
 * Service to handle text-to-workbook conversion for paste functionality
 * Supports both text data and file data from clipboard
 */
export default class TextToWorkbookService {
  /**
   * Process clipboard data and convert to workbook
   * @param clipboardData - ClipboardData from paste event
   * @returns Promise<XLSX.WorkBook | null> - Workbook or null if no valid data
   */
  async processClipboardData(clipboardData: DataTransfer): Promise<{ workbook: XLSX.WorkBook | null; type: 'text' | 'file' | 'none' }> {
    try {
      // First try to get files from clipboard
      const files = clipboardData.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (this.isSpreadsheetFile(file)) {
          const workbook = await this.readFileAsWorkbook(file);
          return { workbook, type: 'file' };
        }
      }

      // If no files, try to get text data
      const textData = clipboardData.getData('text/plain');
      if (textData && textData.trim().length > 0) {
        const workbook = this.convertTextToWorkbook(textData);
        return { workbook, type: 'text' };
      }

      // No valid data found
      return { workbook: null, type: 'none' };
    } catch (error) {
      Log.error('Error processing clipboard data', error as Error, 'TextToWorkbookService');
      return { workbook: null, type: 'none' };
    }
  }

  /**
   * Check if file is a supported spreadsheet format
   * @param file - File to check
   * @returns boolean
   */
  private isSpreadsheetFile(file: File): boolean {
    const supportedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
    ];

    const supportedExtensions = ['.xlsx', '.xls', '.csv', '.xlsm'];

    return supportedTypes.includes(file.type) || supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  }

  /**
   * Read file as workbook
   * @param file - File to read
   * @returns Promise<XLSX.WorkBook>
   */
  private async readFileAsWorkbook(file: File): Promise<XLSX.WorkBook> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Convert text data to workbook format using SheetJS parsing
   * @param textData - Raw text data from clipboard
   * @returns XLSX.WorkBook
   */
  convertTextToWorkbook(textData: string): XLSX.WorkBook {
    try {
      // Let SheetJS handle CSV/TSV parsing - it's much more robust
      const workbook = XLSX.read(textData, { type: 'string', dense: false });

      // Fail-fast size guard for very large pastes
      const firstSheetName = workbook.SheetNames[0];
      if (workbook.Sheets[firstSheetName]['!ref']) {
        const range = XLSX.utils.decode_range(workbook.Sheets[firstSheetName]['!ref']);
        const cells = (range.e.r - range.s.r + 1) * (range.e.c - range.s.c + 1);
        if (cells > 1000000) {
          // 1 million cells limit
          throw new Error('pasteTooLarge'); // Will be handled by dialog with proper i18n
        }
      }

      // Rename first sheet for consistency
      if (firstSheetName && firstSheetName !== 'PastedData') {
        workbook.Sheets.PastedData = workbook.Sheets[firstSheetName];
        workbook.SheetNames[0] = 'PastedData';
        delete workbook.Sheets[firstSheetName];
      }

      return workbook;
    } catch (error) {
      Log.error('Error converting text to workbook', error as Error, 'TextToWorkbookService');
      throw error;
    }
  }

  /**
   * Get information about data format using SheetJS
   * @param textData - Text data to analyze
   * @returns object with format information
   */
  analyzeTextFormat(textData: string): {
    rowCount: number;
    estimatedColumns: number;
    firstRow: string[];
  } {
    try {
      const workbook = XLSX.read(textData, { type: 'string', dense: false });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      if (!worksheet['!ref']) {
        return { rowCount: 0, estimatedColumns: 0, firstRow: [] };
      }

      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const rowCount = range.e.r - range.s.r + 1;
      const estimatedColumns = range.e.c - range.s.c + 1;

      // Get first row data
      const firstRow: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
        const cell = worksheet[cellAddress];
        firstRow.push(cell ? String(cell.v) : '');
      }

      return { rowCount, estimatedColumns, firstRow };
    } catch (error) {
      return { rowCount: 0, estimatedColumns: 0, firstRow: [] };
    }
  }
}
