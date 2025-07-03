import ManagedObject from 'sap/ui/base/ManagedObject';
import Dialog from 'sap/m/Dialog';
import Fragment from 'sap/ui/core/Fragment';
import JSONModel from 'sap/ui/model/json/JSONModel';
import SpreadsheetUpload from '../SpreadsheetUpload';
import { DeepDownloadConfig } from '../../types';
import SpreadsheetUploadDialog from '../dialog/SpreadsheetUploadDialog';
import Util from '../Util';

/**
 * @namespace cc.spreadsheetimporter.download.XXXnamespaceXXX
 */
export default class SpreadsheetDownloadDialog extends ManagedObject {
  spreadsheetUploadController: SpreadsheetUpload;
  spreadsheetDownloadDialog: any;
  spreadsheetOptionsModel: JSONModel;
  componentI18n: any;
  component: any;
  spreadsheetUploadDialog: SpreadsheetUploadDialog;

  constructor(spreadsheetUploadController: any, spreadsheetUploadDialog: SpreadsheetUploadDialog) {
    super();
    this.spreadsheetUploadDialog = spreadsheetUploadDialog;
    this.spreadsheetUploadController = spreadsheetUploadController;
    this.componentI18n = this.spreadsheetUploadController.componentI18n;
    this.component = this.spreadsheetUploadController.component;
  }

  async createSpreadsheetDownloadDialog(): Promise<void> {
    this.spreadsheetUploadController.view.setBusyIndicatorDelay(0);
    this.spreadsheetUploadController.view.setBusy(true);
    if (!this.spreadsheetDownloadDialog) {
      this.spreadsheetOptionsModel = new JSONModel(this.component.getDeepDownloadConfig());
      const modelData = this.spreadsheetOptionsModel.getData();
      this.spreadsheetOptionsModel.setProperty('/filename', modelData.filename || this.spreadsheetUploadController.getOdataType());
      this.spreadsheetDownloadDialog = (await Fragment.load({
        name: 'cc.spreadsheetimporter.XXXnamespaceXXX.fragment.SpreadsheetDownload',
        type: 'XML',
        controller: this
      })) as Dialog;
      this.spreadsheetDownloadDialog.setBusyIndicatorDelay(0);
      this.spreadsheetDownloadDialog.setModel(this.componentI18n, 'i18n');
      this.spreadsheetDownloadDialog.setModel(this.spreadsheetOptionsModel, 'spreadsheetOptions');
      this.spreadsheetDownloadDialog.setModel(this.component.getModel('device'), 'device');
    }
    this.spreadsheetUploadController.view.setBusy(false);
  }

  onSave() {
    const deepDownloadConfig = this.spreadsheetDownloadDialog.getModel('spreadsheetOptions').getData() as DeepDownloadConfig;
    const mergedConfig = Util.mergeDeepDownloadConfig(this.component.getDeepDownloadConfig(), deepDownloadConfig);
    this.component.setDeepDownloadConfig(mergedConfig);
    this.spreadsheetUploadDialog.onDownloadDataSpreadsheet();
    this.spreadsheetDownloadDialog.close();
  }

  onCancel() {
    this.spreadsheetDownloadDialog.close();
  }
}
