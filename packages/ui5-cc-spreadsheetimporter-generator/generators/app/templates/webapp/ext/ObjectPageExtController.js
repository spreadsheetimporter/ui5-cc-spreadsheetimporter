sap.ui.define([], function () {
	"use strict";
	return {
		/**
		 * Create Dialog to Upload Excel and open it
		 * @param {*} oEvent
		 */
		openSpreadsheetUploadDialog: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);
			if (!this.spreadsheetUpload) {
				this.spreadsheetUpload = await this.getView().getController().getAppComponent().createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: this
					}
				});
			}
			this.spreadsheetUpload.openSpreadsheetUploadDialog();
			this.getView().setBusy(false);
		}
	};
});
