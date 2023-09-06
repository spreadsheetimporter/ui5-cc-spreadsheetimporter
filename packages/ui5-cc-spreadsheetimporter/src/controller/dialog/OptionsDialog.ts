import ManagedObject from "sap/ui/base/ManagedObject";
import Log from "sap/base/Log";
import Dialog from "sap/m/Dialog";
import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";
import SpreadsheetUpload from "../SpreadsheetUpload";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class OptionsDialog extends ManagedObject {
	spreadsheetUploadController: SpreadsheetUpload;
	optionsDialog: Dialog;
	availableOptions = ["strict", "fieldMatchType", "decimalSeperator"];

	constructor(spreadsheetUploadController: any) {
		super();
		this.spreadsheetUploadController = spreadsheetUploadController;
	}

	async openOptionsDialog() {
		let showOptionsToUser = this.spreadsheetUploadController.component.getAvailableOptions();
		if (showOptionsToUser.length === 0) {
			showOptionsToUser = this.availableOptions;
		}
		const availableOptionsData = this.availableOptions.reduce(
			(acc, key) => {
				acc[key] = showOptionsToUser.includes(key);
				return acc;
			},
			{} as Record<string, boolean>
		);
		this.spreadsheetUploadController.spreadsheetUploadDialogHandler.getDialog().setBusy(true);
		const optionsModel = new JSONModel({
			strict: this.spreadsheetUploadController.component.getStrict(),
			fieldMatchType: this.spreadsheetUploadController.component.getFieldMatchType(),
			decimalSeparator: this.spreadsheetUploadController.component.getDecimalSeparator()
		});
		const showOptionsModel = new JSONModel(availableOptionsData);
		Log.debug("openOptionsDialog", undefined, "SpreadsheetUpload: Options", () =>
			this.spreadsheetUploadController.component.logger.returnObject({
				strict: this.spreadsheetUploadController.component.getStrict(),
				fieldMatchType: this.spreadsheetUploadController.component.getFieldMatchType(),
				decimalSeparator: this.spreadsheetUploadController.component.getDecimalSeparator()
			})
		);
		if (!this.optionsDialog) {
			this.optionsDialog = (await Fragment.load({
				name: "cc.spreadsheetimporter.XXXnamespaceXXX.fragment.OptionsDialog",
				type: "XML",
				controller: this
			})) as Dialog;
			this.optionsDialog.setModel(this.spreadsheetUploadController.componentI18n, "i18n");
		}
		this.optionsDialog.setModel(optionsModel, "options");
		this.optionsDialog.setModel(showOptionsModel, "availableOptions");
		this.optionsDialog.open();
		this.spreadsheetUploadController.spreadsheetUploadDialogHandler.getDialog().setBusy(false);
	}

	onSave() {
		this.spreadsheetUploadController.component.setFieldMatchType((this.optionsDialog.getModel("options") as JSONModel).getProperty("/fieldMatchType"));
		this.spreadsheetUploadController.component.setStrict((this.optionsDialog.getModel("options") as JSONModel).getProperty("/strict"));
		this.spreadsheetUploadController.component.setDecimalSeparator((this.optionsDialog.getModel("options") as JSONModel).getProperty("/decimalSeparator"));
		this.optionsDialog.close();
	}

	onCancel() {
		this.optionsDialog.close();
	}
}
