import Component from '../Component';
import * as XLSX from 'xlsx';
import Log from 'sap/base/Log';
import Util from './Util';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import MessageHandler from './MessageHandler';
import Parser from './Parser';
import SpreadsheetUpload from './SpreadsheetUpload';
import { ArrayData } from '../types';
import FileService from './services/FileService';
import DataExtractorService from './services/DataExtractorService';
import ValidationService from './services/ValidationService';
import UploadService from './services/UploadService';

/**
 * ImportService provides a simple interface for importing spreadsheet data.
 *
 * This service orchestrates the import process using specialized services:
 * - FileService: Handles file reading and workbook operations
 * - DataExtractorService: Extracts data from spreadsheets
 * - ValidationService: Validates data (can be used separately)
 * - UploadService: Handles upload to backend
 *
 * The service is designed to be easy to use and understand, with clear
 * separation between different stages of the import process.
 */
export default class ImportService {
  protected component: Component;
  protected util: Util;
  protected spreadsheetUploadController: SpreadsheetUpload;
  protected messageHandler: MessageHandler;
  protected i18nResource: ResourceBundle;

  // Specialized services
  private fileService: FileService;
  private dataExtractorService: DataExtractorService;
  private validationService: ValidationService;
  private uploadService: UploadService;

  constructor(
    spreadsheetUploadController: SpreadsheetUpload,
    component: Component,
    i18nResourceBundle: ResourceBundle,
    messageHandler: MessageHandler
  ) {
    this.spreadsheetUploadController = spreadsheetUploadController;
    this.component = component;
    this.i18nResource = i18nResourceBundle;
    this.messageHandler = messageHandler;
    this.util = new Util(i18nResourceBundle);

    // Initialize specialized services
    this.fileService = new FileService();
    this.dataExtractorService = new DataExtractorService();
    this.validationService = new ValidationService(messageHandler, component);
    this.uploadService = new UploadService(component, spreadsheetUploadController, this.util, messageHandler, i18nResourceBundle);
  }

  /**
   * Simple method to read and process a file
   * @param file The file to process
   * @param sheetOption Sheet selection option
   * @param coordinates Optional coordinates for header row
   * @returns Processed data with workbook, sheet data, and validation results
   */
  async processFile(file: File | Blob, sheetOption?: string | number, coordinates?: string): Promise<any> {
    try {
      // Step 1: Read the file
      const workbook = await this.fileService.readFile(file);

      // Step 2: Get sheet name
      const sheetName = await FileService.getSheetName(workbook, sheetOption || this.component.getReadSheet(), this.i18nResource);

      // Step 3: Get raw data for preview
      const rawSheetData = this.dataExtractorService.getRawSheetData(workbook, sheetName);

      // Step 4: Extract data with coordinates
      const extractResult =
        this.component.getStandalone() && this.component.getReadAllSheets()
          ? this.dataExtractorService.extractAllSheetsData(workbook)
          : this.dataExtractorService.extractSheetData(workbook, sheetName, coordinates || this.component.getReadSheetCoordinates());

      // Store data in controller
      this.spreadsheetUploadController.payload = extractResult.spreadsheetSheetsData;

      // Step 5: Parse data
      const payloadArray = await this.parseData(extractResult.spreadsheetSheetsData);

      return {
        workbook,
        sheetName,
        rawSheetData,
        spreadsheetSheetsData: extractResult.spreadsheetSheetsData,
        columnNames: extractResult.columnNames,
        payloadArray,
        coordinates: coordinates || this.component.getReadSheetCoordinates()
      };
    } catch (error) {
      Log.error('Error processing file', error as Error, 'ImportService');
      throw error;
    }
  }

  /**
   * Validates data separately (for wizard flow)
   * @param spreadsheetData The data to validate
   * @param columnNames Column names from the spreadsheet
   * @returns Validation result
   */
  async validateData(spreadsheetData: ArrayData, columnNames: string[]): Promise<{ isValid: boolean; messages: any[] }> {
    const typeLabelList = this.spreadsheetUploadController.typeLabelList;
    const odataKeyList = this.spreadsheetUploadController.odataKeyList;

    return this.validationService.validateData(spreadsheetData, columnNames, typeLabelList, odataKeyList);
  }

  /**
   * Shows validation messages if any
   */
  async showValidationMessages(): Promise<void> {
    await this.validationService.showMessages();
  }

  /**
   * Parses spreadsheet data according to OData types
   */
  async parseData(spreadsheetData: ArrayData): Promise<any[]> {
    const isStandalone = this.component.getStandalone();

    // Store raw data in controller
    this.spreadsheetUploadController.payload = spreadsheetData;

    // Parse data according to OData types in non-standalone mode
    const payloadArray = isStandalone
      ? spreadsheetData
      : Parser.parseSpreadsheetData(
          spreadsheetData,
          this.spreadsheetUploadController.typeLabelList,
          this.component,
          this.messageHandler,
          this.util,
          this.spreadsheetUploadController.isODataV4
        );

    // Store parsed data in controller
    this.spreadsheetUploadController.payloadArray = payloadArray;

    // Fire checkBeforeRead event
    await Util.fireEventAsync(
      'checkBeforeRead',
      {
        sheetData: spreadsheetData,
        parsedData: payloadArray,
        messages: this.messageHandler.getMessages()
      },
      this.component
    );

    return payloadArray;
  }

  /**
   * Basic file processing without validation or upload
   * @param fileOrWorkbook File/Blob or workbook to process
   * @param sheetOptionOrSheetName Sheet selection option or name
   * @param coordinates Optional coordinates for header row
   * @returns Processed data for further use
   */
  async processFileData(fileOrWorkbook: File | Blob | XLSX.WorkBook, sheetOptionOrSheetName?: string | number, coordinates?: string): Promise<any> {
    try {
      let result: any;
      let file: File | undefined;

      // Check if we received a workbook or a file
      if ('SheetNames' in fileOrWorkbook) {
        // It's a workbook
        const workbook = fileOrWorkbook as XLSX.WorkBook;
        const sheetName = sheetOptionOrSheetName as string;

        if (!sheetName) {
          throw new Error('Sheet name is required when passing a workbook');
        }

        // Get raw data for preview
        const rawSheetData = this.dataExtractorService.getRawSheetData(workbook, sheetName);

        // Extract data with coordinates
        const extractResult =
          this.component.getStandalone() && this.component.getReadAllSheets()
            ? this.dataExtractorService.extractAllSheetsData(workbook)
            : this.dataExtractorService.extractSheetData(workbook, sheetName, coordinates || this.component.getReadSheetCoordinates());

        // Store data in controller
        this.spreadsheetUploadController.payload = extractResult.spreadsheetSheetsData;

        // Parse data
        const payloadArray = await this.parseData(extractResult.spreadsheetSheetsData);

        result = {
          workbook,
          sheetName,
          rawSheetData,
          spreadsheetSheetsData: extractResult.spreadsheetSheetsData,
          columnNames: extractResult.columnNames,
          payloadArray,
          coordinates: coordinates || this.component.getReadSheetCoordinates()
        };
      } else {
        // It's a file
        file = fileOrWorkbook as File;
        result = await this.processFile(file, sheetOptionOrSheetName, coordinates);
      }

      return result;
    } catch (error) {
      Log.error('Error processing file data', error as Error, 'ImportService');
      throw error;
    }
  }

  /**
   * Validates processed data and returns validation result
   * @param processedData The result from processFileData
   * @param showMessages Whether to show validation messages immediately
   * @returns Validation result with messages
   */
  async validateProcessedData(processedData: any, showMessages: boolean = false): Promise<{ isValid: boolean; messages: any[]; processedData: any }> {
    try {
      // Validate data
      const validation = await this.validateData(processedData.spreadsheetSheetsData, processedData.columnNames);

      // Handle validation messages
      if (!validation.isValid && showMessages) {
        await this.showValidationMessages();
      }

      return {
        isValid: validation.isValid,
        messages: validation.messages,
        processedData: {
          ...processedData,
          validationMessages: validation.messages,
          canceled: !validation.isValid
        }
      };
    } catch (error) {
      Log.error('Error validating processed data', error as Error, 'ImportService');
      throw error;
    }
  }

  /**
   * Executes the final upload operation
   * @param payloadArray The data to upload
   * @param file Optional file for direct upload
   * @returns Whether upload was successful
   */
  async executeUpload(payloadArray: any[], file?: File): Promise<boolean> {
    return this.uploadService.uploadData(payloadArray, file);
  }

  /**
   * Simple workflow: Process + Validate (wizard pattern)
   * @param fileOrWorkbook File/Blob or workbook to process
   * @param sheetOptionOrSheetName Sheet selection option or name
   * @param coordinates Optional coordinates for header row
   * @param options Processing options
   * @returns Processed and validated data
   */
  async processAndValidate(
    fileOrWorkbook: File | Blob | XLSX.WorkBook,
    sheetOptionOrSheetName?: string | number,
    coordinates?: string,
    options: {
      resetMessages?: boolean;
      validate?: boolean;
      showMessages?: boolean;
    } = {}
  ): Promise<any> {
    const { resetMessages = true, validate = true, showMessages = false } = options;

    try {
      // Reset messages if requested
      if (resetMessages) {
        this.messageHandler.setMessages([]);
      }

      // Process the file/workbook
      const processedData = await this.processFileData(fileOrWorkbook, sheetOptionOrSheetName, coordinates);

      // Validate if requested
      if (validate) {
        const validationResult = await this.validateProcessedData(processedData, showMessages);

        return validationResult.processedData;
      } else {
        return {
          ...processedData,
          validationMessages: [],
          canceled: false
        };
      }
    } catch (error) {
      Log.error('Error in process and validate', error as Error, 'ImportService');
      throw error;
    }
  }

  /**
   * Complete workflow: Process + Validate + Upload (dialog pattern with callbacks)
   * @param fileOrWorkbook File/Blob or workbook to process
   * @param sheetOptionOrSheetName Sheet selection option or name
   * @param coordinates Optional coordinates for header row
   * @param options Processing options
   * @param callbacks UI feedback callbacks
   * @returns Complete result with upload status
   */
  async processValidateAndUpload(
    fileOrWorkbook: File | Blob | XLSX.WorkBook,
    sheetOptionOrSheetName?: string | number,
    coordinates?: string,
    options: {
      resetMessages?: boolean;
      validate?: boolean;
      showMessages?: boolean;
      upload?: boolean;
    } = {},
    callbacks: {
      onBusy?: (state: boolean) => void;
      onMessagesPresent?: () => void;
      onImportSuccess?: (rowCount: number) => void;
    } = {}
  ): Promise<any> {
    const { resetMessages = true, validate = true, showMessages = true, upload = false } = options;

    try {
      // Set busy state if callback is provided
      if (callbacks.onBusy) {
        callbacks.onBusy(true);
      }

      // Process and validate
      const result = await this.processAndValidate(
        fileOrWorkbook,
        sheetOptionOrSheetName,
        coordinates,
        { resetMessages, validate, showMessages: false } // Don't show messages in processAndValidate
      );

      // Handle validation failure
      if (result.canceled) {
        if (showMessages) {
          // Show messages - use callback if provided, otherwise use default
          if (callbacks.onMessagesPresent) {
            callbacks.onMessagesPresent();
          } else {
            this.messageHandler.displayMessages();
          }
        }
        // Clear busy state before returning
        if (callbacks.onBusy) {
          callbacks.onBusy(false);
        }
        return result;
      }

      // Notify success if callback is provided
      if (callbacks.onImportSuccess) {
        callbacks.onImportSuccess(result.payloadArray.length);
      }

      // Upload if requested
      let uploadSuccess = false;
      if (upload) {
        const file = fileOrWorkbook instanceof File ? fileOrWorkbook : undefined;
        uploadSuccess = await this.executeUpload(result.payloadArray, file);
        result.uploadSuccess = uploadSuccess;
      }

      // Clear busy state
      if (callbacks.onBusy) {
        callbacks.onBusy(false);
      }

      return result;
    } catch (error) {
      // Clear busy state in case of error
      if (callbacks.onBusy) {
        callbacks.onBusy(false);
      }
      Log.error('Error in process validate and upload', error as Error, 'ImportService');
      throw error;
    }
  }

  /**
   * @deprecated Use processAndValidate() instead for wizard flows or processValidateAndUpload() for dialog flows
   *
   * Complete import flow for default dialog (renamed from runImportFlow)
   * Reads, extracts, validates, parses, and optionally uploads data
   * Can accept either a File/Blob or a workbook with sheet name
   */
  async runImportPipeline(
    fileOrWorkbook: File | Blob | XLSX.WorkBook,
    sheetOptionOrSheetName?: string | number,
    coordinates?: string,
    pipelineOptions: {
      upload?: boolean;
      resetMessages?: boolean;
      validate?: boolean;
      showMessages?: boolean;
    } = {},
    callbacks: {
      onBusy?: (state: boolean) => void;
      onMessagesPresent?: () => void;
      onImportSuccess?: (rowCount: number) => void;
    } = {}
  ): Promise<any> {
    // Forward to the new method for backward compatibility
    return this.processValidateAndUpload(fileOrWorkbook, sheetOptionOrSheetName, coordinates, pipelineOptions, callbacks);
  }

  /**
   * Wrapper method for executeUpload to match existing usage
   * @param payloadArray The data to upload
   * @param file Optional file for direct upload
   * @returns Whether upload was successful
   */
  async determineAndExecuteUpload(payloadArray: any[], file?: File): Promise<boolean> {
    return this.executeUpload(payloadArray, file);
  }

  /**
   * Gets only the workbook and basic info (for wizard initial step)
   */
  async getWorkbookInfo(
    file: File | Blob,
    sheetOption?: string | number
  ): Promise<{
    workbook: XLSX.WorkBook;
    sheetName: string;
    rawSheetData: any[][];
  }> {
    const workbook = await this.fileService.readFile(file);
    const sheetName = await FileService.getSheetName(workbook, sheetOption || this.component.getReadSheet(), this.i18nResource);
    const rawSheetData = this.dataExtractorService.getRawSheetData(workbook, sheetName);

    return { workbook, sheetName, rawSheetData };
  }

  /**
   * Validates just headers for quick feedback
   */
  validateHeaders(columnNames: string[]): { isValid: boolean; issues: string[] } {
    return this.validationService.validateHeaders(columnNames, this.spreadsheetUploadController.typeLabelList);
  }

  /**
   * Gets the specialized services for advanced use cases
   */
  getServices() {
    return {
      fileService: this.fileService,
      dataExtractorService: this.dataExtractorService,
      validationService: this.validationService,
      uploadService: this.uploadService
    };
  }
}
