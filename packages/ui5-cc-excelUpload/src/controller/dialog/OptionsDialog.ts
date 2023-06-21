import ManagedObject from "sap/ui/base/ManagedObject";
import Log from "sap/base/Log";
import Dialog from "sap/m/Dialog";
import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";
import ExcelUpload from "../ExcelUpload";

/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class OptionsDialog extends ManagedObject{
    excelUploadController: ExcelUpload;
    optionsDialog: Dialog;
	availableOptions = ["strict", "fieldMatchType", "decimalSeperator"];

	constructor(excelUploadController: any) {
		super();
		this.excelUploadController = excelUploadController;
	}

    async openOptionsDialog() {
		let showOptionsToUser = this.excelUploadController.component.getAvailableOptions();
		if(showOptionsToUser.length === 0) {
			showOptionsToUser = this.availableOptions
		}
		const availableOptionsData = this.availableOptions.reduce((acc, key) => {
			acc[key] = showOptionsToUser.includes(key);
			return acc;
		  }, {} as Record<string, boolean>);
		this.excelUploadController.excelUploadDialogHandler.getDialog().setBusy(true)
		const optionsModel = new JSONModel({
			strict: this.excelUploadController.component.getStrict(),
			fieldMatchType: this.excelUploadController.component.getFieldMatchType(),
			decimalSeparator: this.excelUploadController.component.getDecimalSeparator(),
		});
		const showOptionsModel = new JSONModel(availableOptionsData)
		Log.debug("openOptionsDialog",undefined,"ExcelUpload: Options",() => this.excelUploadController.component.logger.returnObject({
			strict: this.excelUploadController.component.getStrict(),
			fieldMatchType: this.excelUploadController.component.getFieldMatchType(),
			decimalSeparator: this.excelUploadController.component.getDecimalSeparator()
		}))
		if (!this.optionsDialog) {
			this.optionsDialog = (await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.OptionsDialog",
				type: "XML",
				controller: this,
			})) as Dialog;
            this.optionsDialog.setModel(this.excelUploadController.componentI18n, "i18n");
		}
		this.optionsDialog.setModel(optionsModel, "options");
		this.optionsDialog.setModel(showOptionsModel, "availableOptions");
		this.optionsDialog.open();
		this.excelUploadController.excelUploadDialogHandler.getDialog().setBusy(false)
	}


    onSave() {
        this.excelUploadController.component.setFieldMatchType((this.optionsDialog.getModel("options") as JSONModel).getProperty("/fieldMatchType"));
        this.excelUploadController.component.setStrict((this.optionsDialog.getModel("options") as JSONModel).getProperty("/strict"));
        this.excelUploadController.component.setDecimalSeparator((this.optionsDialog.getModel("options") as JSONModel).getProperty("/decimalSeparator"));
        this.optionsDialog.close();
    }

    onCancel() {
        this.optionsDialog.close();
    }
}