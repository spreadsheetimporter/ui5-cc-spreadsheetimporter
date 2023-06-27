sap.ui.define([], function () {
	"use strict";
	return {
		/**
		 * Create Dialog to Upload Excel and open it
		 * @param {*} oEvent
		 */
		openExcelUploadDialog: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);
			if (!this.excelUpload) {
				this.excelUpload = await this.getView().getController().getAppComponent().createComponent({
					usage: "excelUpload",
					async: true,
					componentData: {
						context: this
					}
				});
			}
			this.excelUpload.openExcelUploadDialog();
			this.getView().setBusy(false);
		}
	};
});
