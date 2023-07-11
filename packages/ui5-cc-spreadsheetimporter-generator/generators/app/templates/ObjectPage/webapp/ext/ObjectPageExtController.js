sap.ui.define([], function () {
	"use strict";
	return {
		/**
		 * Create Dialog to Upload Spreadsheet and open it
		 * @param {*} oEvent
		 */
		openSpreadsheetUploadDialog: async function (oEvent) {
			this.editFlow.getView().setBusyIndicatorDelay(0);
			this.editFlow.getView().setBusy(true);
			this.spreadsheetUpload = await this.editFlow
				.getView()
				.getController()
				.getAppComponent()
				.createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: this
					}
				});
			this.spreadsheetUpload.openSpreadsheetUploadDialog();
			this.editFlow.getView().setBusy(false);
		}
	};
});
