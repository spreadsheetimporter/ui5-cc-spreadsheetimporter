import ManagedObject from 'sap/ui/base/ManagedObject';
import Fragment from 'sap/ui/core/Fragment';
import SpreadsheetUpload from '../SpreadsheetUpload';
import SpreadsheetDialog, {
  SpreadsheetDialog$AvailableOptionsChangedEvent,
  SpreadsheetDialog$DecimalSeparatorChangedEvent,
  SpreadsheetDialog$FileDropEvent
} from '../../control/SpreadsheetDialog';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import Component from '../../Component';
import Event from 'sap/ui/base/Event';
import FileUploader, { FileUploader$ChangeEvent } from 'sap/ui/unified/FileUploader';
import MessageToast from 'sap/m/MessageToast';
import Preview from '../Preview';
import Util from '../Util';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import * as XLSX from 'xlsx';
import OptionsDialog from './OptionsDialog';
import MessageHandler from '../MessageHandler';
import Log from 'sap/base/Log';
import Button from 'sap/m/Button';
import { AvailableOptionsType, DeepDownloadConfig } from '../../types';
import FlexBox from 'sap/m/FlexBox';
import JSONModel from 'sap/ui/model/json/JSONModel';
import SpreadsheetDownloadDialog from '../download/SpreadsheetDownloadDialog';
import SpreadsheetGenerator from '../download/SpreadsheetGenerator';
import SpreadsheetDownload from '../download/SpreadsheetDownload';
import OData from '../odata/OData';
import ImportService from '../ImportService';
import { Action } from '../../enums';

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class SpreadsheetUploadDialog extends ManagedObject {
  spreadsheetUploadController: SpreadsheetUpload;
  spreadsheetUploadDialog: SpreadsheetDialog;
  spreadsheetDownloadDialog: SpreadsheetDownloadDialog;
  component: Component;
  previewHandler: Preview;
  util: Util;
  componentI18n: ResourceModel;
  optionsHandler: OptionsDialog;
  messageHandler: MessageHandler;
  spreadsheetOptionsModel: JSONModel;
  spreadsheetGenerator: SpreadsheetGenerator;
  spreadsheetDownload: SpreadsheetDownload;
  private odataHandler: OData;
  private importService: ImportService;
  private currentFile: File | null = null;

  constructor(spreadsheetUploadController: SpreadsheetUpload, component: Component, componentI18n: ResourceModel, messageHandler: MessageHandler) {
    super();
    this.spreadsheetUploadController = spreadsheetUploadController;
    this.component = component;
    this.componentI18n = componentI18n;
    this.util = new Util(componentI18n.getResourceBundle() as ResourceBundle);
    this.messageHandler = messageHandler;

    // Initialize the import service
    this.importService = new ImportService(
      spreadsheetUploadController,
      component,
      componentI18n.getResourceBundle() as ResourceBundle,
      messageHandler
    );

    this.previewHandler = new Preview(this.util);
    this.optionsHandler = new OptionsDialog(spreadsheetUploadController);
    this.spreadsheetDownloadDialog = new SpreadsheetDownloadDialog(this.spreadsheetUploadController, this);
  }

  async createSpreadsheetUploadDialog() {
    if (!this.spreadsheetUploadDialog) {
      this.spreadsheetOptionsModel = new JSONModel({
        dataRows: 0,
        strict: this.component.getStrict(),
        hidePreview: this.component.getHidePreview(),
        showOptions: this.component.getShowOptions(),
        showDownloadButton: this.component.getShowDownloadButton(),
        hideGenerateTemplateButton: false,
        fileUploadValue: '',
        densityClass: this.component._densityClass,
        action: this.component.getAction()
      });
      this.spreadsheetUploadDialog = (await Fragment.load({
        name: 'cc.spreadsheetimporter.XXXnamespaceXXX.fragment.SpreadsheetUpload',
        type: 'XML',
        controller: this
      })) as SpreadsheetDialog;
      this.spreadsheetUploadDialog.setComponent(this.component);
      this.spreadsheetUploadDialog.setBusyIndicatorDelay(0);
      this.spreadsheetUploadDialog.setModel(this.componentI18n, 'i18n');
      this.spreadsheetUploadDialog.setModel(this.spreadsheetOptionsModel, 'info');
      this.spreadsheetUploadDialog.setModel(this.component.getModel('device'), 'device');
      this.spreadsheetUploadDialog.attachDecimalSeparatorChanged(this.onDecimalSeparatorChanged.bind(this));
      this.spreadsheetUploadDialog.attachAvailableOptionsChanged(this.onAvailableOptionsChanged.bind(this));
      this.spreadsheetUploadDialog.attachFileDrop(this.onFileDrop.bind(this));
    }
    if (this.component.getStandalone() && this.component.getColumns().length === 0 && !this.component.getSpreadsheetTemplateFile()) {
      this.spreadsheetOptionsModel.setProperty('/hideGenerateTemplateButton', true);
    }
  }

  onFileDrop(event: SpreadsheetDialog$FileDropEvent) {
    const files = event.getParameter('files');
    const file = files[0] as File;
    (this.spreadsheetUploadDialog.getModel('info') as JSONModel).setProperty('/fileUploadValue', file.name);
    this.handleFile(file);
  }

  /**
   * Handles file upload event.
   * @param {Event} event - The file upload event
   */
  async onFileUpload(event: FileUploader$ChangeEvent) {
    const file = event.getParameter('files')[0] as File;
    (this.spreadsheetUploadDialog.getModel('info') as JSONModel).setProperty('/fileUploadValue', file.name);
    await this.handleFile(file);
  }

  /**
   * Process the uploaded file using the import pipeline
   * @param {Blob} file - The file to process
   */
  async handleFile(file: Blob) {
    try {
      this.setBusy(true);

      // Save file reference if it's a File object
      if (file instanceof File) {
        this.currentFile = file;
      }

      // Run import pipeline using the service
      const sheetOption = this.spreadsheetUploadController.component.getReadSheet();
      const result = await this.importService.processValidateAndUpload(
        file,
        sheetOption,
        undefined,
        { resetMessages: true },
        {
          onBusy: state => this.setBusy(state),
          onMessagesPresent: () => this.messageHandler.displayMessages(),
          onImportSuccess: rowCount => this.setDataRows(rowCount)
        }
      );

      if (!result.canceled && result.payloadArray) {
        // Show a success message
        MessageToast.show(this.util.geti18nText('spreadsheetimporter.fileReadyForUpload'));
      }

      this.setBusy(false);
    } catch (error) {
      this.setBusy(false);
      Log.error('Error handling file upload', error as Error, 'SpreadsheetUploadDialog');
      this.resetContent();
    }
  }

  /**
   * Sending extracted data to backend
   * @param {*} event
   */
  async onUploadSet(event: Event) {
    try {
      this.setBusy(true);

      // Get the button source to know which dialog to close afterwards
      const source = event.getSource() as Button;

      if (this.currentFile || (this.spreadsheetUploadController.payloadArray && this.spreadsheetUploadController.payloadArray.length > 0)) {
        let uploadSuccess = false;

        if (this.currentFile) {
          // If we have a file, run validation first
          const sheetOption = this.spreadsheetUploadController.component.getReadSheet();
          const result = await this.importService.processAndValidate(this.currentFile, sheetOption, undefined, {
            resetMessages: true,
            validate: true,
            showMessages: true
          });

          if (!result.canceled) {
            // If validation passed, execute upload
            uploadSuccess = await this.importService.executeUpload(result.payloadArray, this.currentFile);
          }
        } else {
          // No file, but we have payload data - execute upload directly
          uploadSuccess = await this.importService.executeUpload(this.spreadsheetUploadController.payloadArray);
        }

        if (uploadSuccess) {
          MessageToast.show(this.util.geti18nText('spreadsheetimporter.uploadSuccessful'));
        } else {
          MessageToast.show(this.util.geti18nText('spreadsheetimporter.uploadFailed'));
        }
      } else {
        MessageToast.show(this.util.geti18nText('spreadsheetimporter.selectFileUpload'));
        this.setBusy(false);
        return;
      }

      // Close dialog after upload is handled
      this.onCloseDialog();
    } catch (error) {
      Log.error('Error handling upload', error as Error, 'SpreadsheetUploadDialog');
    } finally {
      this.setBusy(false);
    }
  }

  openSpreadsheetUploadDialog() {
    this.spreadsheetUploadDialog.open();
  }

  /**
   * Closes the Spreadsheet upload dialog.
   */
  onCloseDialog() {
    this.component.fireRequestCompleted();
    this.resetContent();
    this.spreadsheetUploadDialog.close();
  }

  onDecimalSeparatorChanged(event: SpreadsheetDialog$DecimalSeparatorChangedEvent) {
    this.component.setDecimalSeparator(event.getParameter('decimalSeparator'));
  }

  onAvailableOptionsChanged(event: SpreadsheetDialog$AvailableOptionsChangedEvent) {
    const availableOptions = event.getParameter('availableOptions') as AvailableOptionsType[];
    if (availableOptions.length > 0) {
      this.component.setShowOptions(true);
      this.spreadsheetOptionsModel.setProperty('/showOptions', true);
    } else {
      this.component.setShowOptions(false);
      this.spreadsheetOptionsModel.setProperty('/showOptions', true);
    }
    this.component.setAvailableOptions(availableOptions);
  }

  /**
   * Reset the dialog content and clear the current file
   */
  resetContent() {
    if (this.spreadsheetUploadDialog) {
      (this.spreadsheetUploadDialog.getModel('info') as JSONModel).setProperty('/dataRows', 0);

      // Clear file uploader value
      const content = this.spreadsheetUploadDialog.getContent();
      if (content && content.length > 0) {
        const flexBox = content[0] as FlexBox;
        if (flexBox && flexBox.getItems && flexBox.getItems().length > 1) {
          const fileUploader = flexBox.getItems()[1] as FileUploader;
          if (fileUploader) {
            fileUploader.setValue('');
          }
        }
      }
    }

    // Clear the current file reference
    this.currentFile = null;
  }

  /**
   * Set busy state on dialog
   */
  setBusy(state: boolean): void {
    if (this.spreadsheetUploadDialog) {
      this.spreadsheetUploadDialog.setBusy(state);
    }
  }

  setDataRows(length: number) {
    (this.spreadsheetUploadDialog.getModel('info') as JSONModel).setProperty('/dataRows', length);
  }

  getDialog(): SpreadsheetDialog {
    return this.spreadsheetUploadDialog;
  }

  async showPreview() {
    if (this.spreadsheetUploadController.payloadArray) {
      this.previewHandler.showPreview(
        this.spreadsheetUploadController.payloadArray,
        this.spreadsheetUploadController.typeLabelList,
        this.component.getPreviewColumns()
      );
    }
  }

  async onTempDownload() {
    // Template download implementation unchanged
    // check if custom template is provided, otherwise generate it
    if (this.component.getSpreadsheetTemplateFile() !== '') {
      try {
        const templateFile = this.component.getSpreadsheetTemplateFile();
        let arrayBuffer;
        let fileName;

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

        // spreadsheet file name wll overwrite the template file name
        if (this.component.getSpreadsheetFileName() !== 'Template.xlsx' || fileName === undefined) {
          fileName = this.component.getSpreadsheetFileName();
        }

        Util.downloadSpreadsheetFile(arrayBuffer, fileName);

        // You can now use arrayBuffer to do whatever you need
      } catch (error) {
        console.error('Error loading file', error);
      }
    } else {
      // create spreadsheet column list
      let fieldMatchType = this.component.getFieldMatchType();
      var worksheet = {} as XLSX.WorkSheet;
      let colWidths: { wch: number }[] = []; // array to store column widths
      let sampleData = this.component.getSampleData() as any[];
      let sampleDataDefined = true;
      // if sampledata is empty add one row of empty data
      if (!sampleData || sampleData.length === 0) {
        sampleDataDefined = false;
        sampleData = [{}];
      }
      const colWidthDefault = 15;
      const colWidthDate = 20;
      let col = 0;
      let rows = 1;
      if (this.component.getStandalone()) {
        // loop over this.component.getColumns
        for (let column of this.component.getColumns()) {
          worksheet[XLSX.utils.encode_cell({ c: col, r: 0 })] = { v: column, t: 's' };
          col++;
        }
        col = 0;
        for (let column of this.component.getColumns()) {
          for (const [index, data] of sampleData.entries()) {
            let sampleDataValue;
            rows = index + 1;
            if (data[column]) {
              sampleDataValue = data[column];
              worksheet[XLSX.utils.encode_cell({ c: col, r: 1 })] = { v: sampleDataValue, t: 's' };
            }
          }

          col++;
        }
      } else {
        for (let [key, value] of this.spreadsheetUploadController.typeLabelList.entries()) {
          let cell = { v: '', t: 's' } as XLSX.CellObject;
          let label = '';
          if (fieldMatchType === 'label') {
            label = value.label;
          }
          if (fieldMatchType === 'labelTypeBrackets') {
            label = `${value.label}[${key}]`;
          }
          worksheet[XLSX.utils.encode_cell({ c: col, r: 0 })] = { v: label, t: 's' };

          for (const [index, data] of sampleData.entries()) {
            let sampleDataValue;
            rows = index + 1;
            if (data[key]) {
              sampleDataValue = data[key];
            }
            if (value.type === 'Edm.Boolean') {
              // Set default value for sampleDataValue based on sampleDataDefined flag
              let defaultValue = sampleDataDefined ? '' : 'true';
              // Assign sampleDataValue only if sampleDataValue is not undefined
              sampleDataValue = sampleDataValue ? sampleDataValue.toString() : defaultValue;
              cell = {
                v: sampleDataValue,
                t: 'b'
              };
              colWidths.push({ wch: colWidthDefault });
            } else if (value.type === 'Edm.String') {
              let newStr;
              if (value.maxLength) {
                newStr = sampleDataValue ? sampleDataValue : 'test string'.substring(0, value.maxLength);
              } else {
                newStr = sampleDataValue ? sampleDataValue : 'test string';
              }
              // Set default value for sampleDataValue based on sampleDataDefined flag
              let defaultValue: string = sampleDataDefined ? '' : newStr;
              // Assign sampleDataValue only if sampleDataValue is not undefined
              sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
              cell = { v: sampleDataValue, t: 's' };
              colWidths.push({ wch: colWidthDefault });
            } else if (value.type === 'Edm.DateTimeOffset' || value.type === 'Edm.DateTime') {
              let format;
              const currentLang = await Util.getLanguage();
              if (currentLang.startsWith('en')) {
                format = 'mm/dd/yyyy hh:mm AM/PM';
              } else {
                format = 'dd.mm.yyyy hh:mm';
              }

              // Set default value for sampleDataValue based on sampleDataDefined flag
              let defaultValue = sampleDataDefined ? '' : new Date();
              // Assign sampleDataValue only if sampleDataValue is not undefined
              sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
              // if sampleDataValue is empty and cellFormat is "d", Excel Generation fails
              let cellFormat: XLSX.ExcelDataType = sampleDataValue ? 'd' : 's';
              cell = { v: sampleDataValue, t: cellFormat, z: format };
              colWidths.push({ wch: colWidthDate }); // set column width to 20 for this column
            } else if (value.type === 'Edm.Date') {
              // Set default value for sampleDataValue based on sampleDataDefined flag
              let defaultValue = sampleDataDefined ? '' : new Date();
              // Assign sampleDataValue only if sampleDataValue is not undefined
              sampleDataValue = sampleDataValue ? sampleDataValue.toString() : defaultValue;
              // if sampleDataValue is empty and cellFormat is "d", Excel Generation fails
              let cellFormat: XLSX.ExcelDataType = sampleDataValue ? 'd' : 's';
              cell = {
                v: sampleDataValue,
                t: cellFormat
              };
              colWidths.push({ wch: colWidthDefault });
            } else if (value.type === 'Edm.TimeOfDay' || value.type === 'Edm.Time') {
              // Set default value for sampleDataValue based on sampleDataDefined flag
              let defaultValue = sampleDataDefined ? '' : new Date();
              // Assign sampleDataValue only if sampleDataValue is not undefined
              sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
              // if sampleDataValue is empty and cellFormat is "d", Excel Generation fails
              let cellFormat: XLSX.ExcelDataType = sampleDataValue ? 'd' : 's';
              cell = {
                v: sampleDataValue,
                t: cellFormat,
                z: 'hh:mm'
              };
              colWidths.push({ wch: colWidthDefault });
            } else if (
              value.type === 'Edm.UInt8' ||
              value.type === 'Edm.Int16' ||
              value.type === 'Edm.Int32' ||
              value.type === 'Edm.Integer' ||
              value.type === 'Edm.Int64' ||
              value.type === 'Edm.Integer64'
            ) {
              // Set default value for sampleDataValue based on sampleDataDefined flag
              let defaultValue = sampleDataDefined ? '' : 85;
              // Assign sampleDataValue only if sampleDataValue is not undefined
              sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
              cell = {
                v: sampleDataValue,
                t: 'n'
              };
              colWidths.push({ wch: colWidthDefault });
            } else if (value.type === 'Edm.Double' || value.type === 'Edm.Decimal') {
              const decimalSeparator = this.component.getDecimalSeparator();
              // Set default value for sampleDataValue based on sampleDataDefined flag
              let defaultValue = sampleDataDefined ? '' : `123${decimalSeparator}4`;
              // Assign sampleDataValue only if sampleDataValue is not undefined
              sampleDataValue = sampleDataValue ? sampleDataValue.toString() : defaultValue;
              cell = {
                v: sampleDataValue,
                t: 'n'
              };
              colWidths.push({ wch: colWidthDefault });
            }

            if (!this.component.getHideSampleData()) {
              worksheet[XLSX.utils.encode_cell({ c: col, r: rows })] = cell;
            }
          }
          col++;
        }
      }
      worksheet['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: col, r: sampleData.length } });
      worksheet['!cols'] = colWidths; // assign the column widths to the worksheet

      // creating the new spreadsheet work book
      const wb = XLSX.utils.book_new();
      // set the file value
      XLSX.utils.book_append_sheet(wb, worksheet, 'Tabelle1');
      // download the created spreadsheet file
      XLSX.writeFile(wb, this.component.getSpreadsheetFileName());

      MessageToast.show(this.util.geti18nText('spreadsheetimporter.downloadingTemplate'));
    }
  }

  onOpenOptionsDialog() {
    this.optionsHandler.openOptionsDialog();
  }

  setODataHandler(odataHandler: OData) {
    this.odataHandler = odataHandler;
    this.spreadsheetGenerator = new SpreadsheetGenerator(this.spreadsheetUploadController, this.component, odataHandler);
    this.spreadsheetDownload = new SpreadsheetDownload(this.spreadsheetUploadController, this.component, odataHandler);
  }

  /**
   * Initializes the spreadsheet download process.
   * If showOptions is enabled in the DeepDownloadConfig, opens a dialog allowing users to configure download options.
   * Otherwise, directly triggers the spreadsheet download.
   *
   * @returns {Promise<void>} A promise that resolves when the download process is initialized
   */
  async onInitDownloadSpreadsheetProcess(): Promise<void> {
    const showOptionsToUser = (this.component.getDeepDownloadConfig() as DeepDownloadConfig).showOptions;
    if (showOptionsToUser) {
      await this.spreadsheetDownloadDialog.createSpreadsheetDownloadDialog();
      this.spreadsheetDownloadDialog.spreadsheetDownloadDialog.open();
    } else {
      this.onDownloadDataSpreadsheet();
    }
  }

  async onDownloadDataSpreadsheet(): Promise<void> {
    // if deepLevel is 0, we set deepExport to false
    if ((this.component.getDeepDownloadConfig() as DeepDownloadConfig).deepLevel === 0) {
      (this.component.getDeepDownloadConfig() as DeepDownloadConfig).deepExport = false;
    }
    // if deepExport is false, we set deepLevel to 0
    if ((this.component.getDeepDownloadConfig() as DeepDownloadConfig).deepExport === false) {
      (this.component.getDeepDownloadConfig() as DeepDownloadConfig).deepLevel = 0;
    }
    // if deepLevel is greater 0, we set deepExport to true
    if ((this.component.getDeepDownloadConfig() as DeepDownloadConfig).deepLevel > 0) {
      (this.component.getDeepDownloadConfig() as DeepDownloadConfig).deepExport = true;
    }
    if (!this.spreadsheetUploadController.errorState) {
      try {
        const mainEntitySiblings = await this.spreadsheetDownload.fetchData(this.component.getDeepDownloadConfig() as DeepDownloadConfig);

        let isDefaultPrevented = false;
        try {
          const asyncEventBeforeDownloadFileProcessing = await Util.fireEventAsync(
            'beforeDownloadFileProcessing',
            { data: mainEntitySiblings },
            this.component
          );
          isDefaultPrevented = asyncEventBeforeDownloadFileProcessing.bPreventDefault;
        } catch (error) {
          Log.error('Error while calling the beforeDownloadFileProcessing event', error as Error, 'SpreadsheetUploadDialog.ts');
        }
        if (!isDefaultPrevented) {
          this.spreadsheetGenerator.downloadSpreadsheet(mainEntitySiblings, this.component.getDeepDownloadConfig() as DeepDownloadConfig);
        }
      } catch (error) {
        console.error('Error in onDownloadDataSpreadsheet:', error);
      }
    } else {
      Util.showError(this.spreadsheetUploadController.errorMessage, 'SpreadsheetUpload.ts', 'initialSetup');
      Log.error('Error opening the dialog', undefined, 'SpreadsheetUpload: SpreadsheetUpload');
    }
  }

  /**
   * Formatter for simplified action and data rows text
   * @param {string} action - The current action (CREATE, UPDATE, DELETE, UPSERT)
   * @param {string} createText - i18n text for create action
   * @param {string} updateText - i18n text for update action
   * @param {string} deleteText - i18n text for delete action
   * @param {string} upsertText - i18n text for upsert action
   * @param {string} recordsReadyText - i18n text for records ready for upload
   * @param {number} dataRows - Number of data rows
   * @returns {string} Simplified formatted text
   */
  formatSimplifiedText(
    action: string,
    createText: string,
    updateText: string,
    deleteText: string,
    upsertText: string,
    recordsReadyText: string,
    dataRows: number
  ): string {
    let title = '';

    switch (action) {
      case Action.Create:
        title = createText;
        break;
      case Action.Update:
        title = updateText;
        break;
      case Action.Delete:
        title = deleteText;
        break;
      case Action.Upsert:
        title = upsertText;
        break;
      default:
        title = createText;
    }

    // Format records ready message
    const recordsMessage = recordsReadyText.replace('{0}', dataRows.toString());

    return `${title}<br/>${recordsMessage}`;
  }

  /**
   * Formatter for action text display with title and description
   * @param {string} action - The current action (CREATE, UPDATE, DELETE, UPSERT)
   * @param {string} createText - i18n text for create action
   * @param {string} updateText - i18n text for update action
   * @param {string} deleteText - i18n text for delete action
   * @param {string} upsertText - i18n text for upsert action
   * @param {string} createDesc - i18n description for create action
   * @param {string} updateDesc - i18n description for update action
   * @param {string} deleteDesc - i18n description for delete action
   * @param {string} upsertDesc - i18n description for upsert action
   * @returns {string} Formatted text with title and description
   */
  formatActionText(
    action: string,
    createText: string,
    updateText: string,
    deleteText: string,
    upsertText: string,
    createDesc: string,
    updateDesc: string,
    deleteDesc: string,
    upsertDesc: string
  ): string {
    let title = '';
    let description = '';

    switch (action) {
      case Action.Create:
        title = createText;
        description = createDesc;
        break;
      case Action.Update:
        title = updateText;
        description = updateDesc;
        break;
      case Action.Delete:
        title = deleteText;
        description = deleteDesc;
        break;
      case Action.Upsert:
        title = upsertText;
        description = upsertDesc;
        break;
      default:
        title = createText;
        description = createDesc;
    }

    return `<strong>${title}</strong><br/>${description}`;
  }
}
