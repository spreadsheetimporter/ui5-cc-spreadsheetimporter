import ManagedObject from 'sap/ui/base/ManagedObject';
import Fragment from 'sap/ui/core/Fragment';
import SpreadsheetUpload from '../SpreadsheetUpload';
import SpreadsheetDialog, {
  SpreadsheetDialog$AvailableOptionsChangedEvent,
  SpreadsheetDialog$DecimalSeparatorChangedEvent,
  SpreadsheetDialog$FileDropEvent,
  SpreadsheetDialog$DataPasteEvent
} from '../../control/SpreadsheetDialog';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import Component from '../../Component';
import Event from 'sap/ui/base/Event';
import FileUploader, { FileUploader$ChangeEvent } from 'sap/ui/unified/FileUploader';
import MessageToast from 'sap/m/MessageToast';
import Preview from '../Preview';
import Util from '../Util';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';
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
import TemplateService from '../services/TemplateService';
import FileService from '../services/FileService';

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
  private templateService: TemplateService;
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

    // Initialize template service
    this.templateService = new TemplateService(component, spreadsheetUploadController, componentI18n.getResourceBundle() as ResourceBundle);
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
      this.spreadsheetUploadDialog.attachDataPaste(this.onDataPaste.bind(this));
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
   * Handle paste data event from SpreadsheetDialog
   * @param {SpreadsheetDialog$DataPasteEvent} event - The paste data event
   */
  async onDataPaste(event: SpreadsheetDialog$DataPasteEvent) {
    const workbook = event.getParameter('workbook') as any; // Cast to any to access XLSX.WorkBook properties
    const type = event.getParameter('type');
    const originalData = event.getParameter('originalData');

    // Update file uploader display to show paste was used
    const displayName = type === 'file' ? originalData || 'Pasted File' : 'Pasted Data';
    (this.spreadsheetUploadDialog.getModel('info') as JSONModel).setProperty('/fileUploadValue', displayName);

    // Process the workbook using existing pipeline
    // For pasted data, use 'PastedData' sheet name; for pasted files, use first sheet name
    this.handleWorkbook(workbook);
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
   * Process a workbook directly (from paste functionality)
   * @param {any} workbook - The XLSX workbook to process
   * @param {string} sheetName - Sheet name to use (default: 'PastedData')
   */
  async handleWorkbook(workbook: any) {
    try {
      this.setBusy(true);

      // Clear current file reference since this is from paste
      this.currentFile = null;

      const sheetName = await FileService.getSheetName(workbook, this.component.getReadSheet(), this.componentI18n);
      // Run import pipeline using the workbook directly
      const result = await this.importService.processValidateAndUpload(
        workbook,
        sheetName, // Pass sheet name, not index for workbooks
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
        MessageToast.show(this.util.geti18nText('spreadsheetimporter.dataReadyForUpload'));
      }

      this.setBusy(false);
    } catch (error) {
      this.setBusy(false);
      Log.error('Error handling workbook', error as Error, 'SpreadsheetUploadDialog');
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

  async onTempDownload(): Promise<void> {
    try {
      await this.templateService.downloadTemplate();
    } catch (error) {
      Log.error('Error downloading template', error as Error, 'SpreadsheetUploadDialog');
      MessageToast.show(this.util.geti18nText('spreadsheetimporter.errorDownloadingTemplate'));
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
