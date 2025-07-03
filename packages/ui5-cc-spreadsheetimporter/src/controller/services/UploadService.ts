import ManagedObject from 'sap/ui/base/ManagedObject';
import { FireEventReturnType } from '../../types';
import Component from '../../Component';
import SpreadsheetUpload from '../SpreadsheetUpload';
import MessageToast from 'sap/m/MessageToast';
import Util from '../Util';
import Log from 'sap/base/Log';
import OData from '../odata/OData';
import DirectUploader from '../DirectUploader';

/**
 * UploadService handles all upload operations.
 * Supports both traditional OData upload and direct file upload.
 *
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class UploadService extends ManagedObject {
  private component: Component;
  private spreadsheetUploadController: SpreadsheetUpload;
  private util: Util;
  private directUploader: DirectUploader;

  constructor(component: Component, spreadsheetUploadController: SpreadsheetUpload, util: Util, messageHandler: any, resourceBundle: any) {
    super();
    this.component = component;
    this.spreadsheetUploadController = spreadsheetUploadController;
    this.util = util;

    // Initialize direct uploader if needed
    const directUploadConfig = component.getDirectUploadConfig();
    if (directUploadConfig && directUploadConfig.enabled) {
      this.directUploader = new DirectUploader(component, messageHandler, resourceBundle);
    }
  }

  /**
   * Determines which upload method to use and executes it
   * @param payloadArray The processed data to upload
   * @param file Optional file for direct upload
   * @returns Whether the upload was successful
   */
  async uploadData(payloadArray: any[], file?: File): Promise<boolean> {
    try {
      // Check if payload is empty
      if (!payloadArray || !payloadArray.length) {
        MessageToast.show(this.util.geti18nText('spreadsheetimporter.selectFileUpload'));
        return false;
      }

      // Fire uploadButtonPress event
      const fireEventAsyncReturn = await this.fireUploadEvent(payloadArray);

      // Exit if event was prevented or in standalone mode
      if (fireEventAsyncReturn.bPreventDefault || this.component.getStandalone()) {
        return true;
      }

      // Determine upload method
      const useDirectUpload = this.shouldUseDirectUpload(file);

      if (useDirectUpload && file) {
        return await this.performDirectUpload(file, payloadArray);
      } else {
        return await this.performTraditionalUpload(payloadArray);
      }
    } catch (error) {
      Log.error('Error during upload', error as Error, 'UploadService');
      return false;
    }
  }

  /**
   * Performs direct file upload
   */
  private async performDirectUpload(file: File, payloadArray: any[]): Promise<boolean> {
    try {
      if (!this.directUploader) {
        throw new Error('Direct uploader not initialized');
      }

      // Convert file to ArrayBuffer
      const arrayBuffer = await this.fileToArrayBuffer(file);

      // Get OData type for entity name
      const odataType = this.spreadsheetUploadController.getOdataType();

      // Upload file
      await this.directUploader.uploadFile(arrayBuffer, file.name, odataType);

      // Show success message
      MessageToast.show(this.util.geti18nText('spreadsheetimporter.uploadSuccessful'));

      // Fire completed event
      await Util.fireEventAsync('requestCompleted', { success: true }, this.component);

      return true;
    } catch (error) {
      Log.error('Direct upload failed', error as Error, 'UploadService');
      MessageToast.show(this.util.geti18nText('spreadsheetimporter.directUploadError'));
      await Util.fireEventAsync('requestCompleted', { success: false }, this.component);
      return false;
    }
  }

  /**
   * Performs traditional OData upload
   */
  private async performTraditionalUpload(payloadArray: any[]): Promise<boolean> {
    try {
      // Store payload in controller for OData handler
      this.spreadsheetUploadController.payloadArray = payloadArray;

      // Get OData handler
      const odataHandler = this.spreadsheetUploadController.getODataHandler();
      if (!odataHandler) {
        throw new Error('OData handler not available');
      }

      // Call OData service
      await new Promise((resolve, reject) => {
        odataHandler.callOdata(resolve, reject, this.spreadsheetUploadController);
      });

      const uploadSuccess = !this.spreadsheetUploadController.errorsFound;

      // Fire completed event
      await Util.fireEventAsync('requestCompleted', { success: uploadSuccess }, this.component);

      return uploadSuccess;
    } catch (error) {
      Log.error('Traditional upload failed', error as Error, 'UploadService');
      this.spreadsheetUploadController.errorsFound = true;
      await Util.fireEventAsync('requestCompleted', { success: false }, this.component);
      return false;
    }
  }

  /**
   * Determines if direct upload should be used
   */
  private shouldUseDirectUpload(file?: File): boolean {
    const directUploadConfig = this.component.getDirectUploadConfig();
    return directUploadConfig?.enabled === true && file !== null && file !== undefined;
  }

  /**
   * Converts file to ArrayBuffer
   */
  private async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Fires the upload button press event
   */
  private async fireUploadEvent(payloadArray: any[]): Promise<FireEventReturnType> {
    // Extract raw and parsed values
    const rawData = this.extractRawValues(payloadArray);
    const parsedData = this.extractParsedValues(payloadArray);

    return await Util.fireEventAsync(
      'uploadButtonPress',
      {
        payload: payloadArray,
        rawData: rawData,
        parsedData: parsedData
      },
      this.component
    );
  }

  /**
   * Extracts raw values from payloadArray
   */
  private extractRawValues(data: any[]): any[] {
    return data.map(item => {
      const newObj: { [key: string]: any } = {};
      for (const key in item) {
        if (item[key].hasOwnProperty('rawValue')) {
          newObj[key] = item[key].rawValue;
        }
      }
      return newObj;
    });
  }

  /**
   * Extracts parsed values from payloadArray
   */
  private extractParsedValues(data: any[]): any[] {
    return data.map(item => {
      const newObj: { [key: string]: any } = {};
      for (const key in item) {
        if (item[key].hasOwnProperty('formattedValue')) {
          newObj[key] = item[key].formattedValue;
        }
      }
      return newObj;
    });
  }
}
