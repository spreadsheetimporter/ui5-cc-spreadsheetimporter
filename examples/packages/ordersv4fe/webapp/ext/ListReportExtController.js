sap.ui.define([], function () {
	"use strict";
	return {
		/**
		 * Create Dialog to Upload Excel and open it
		 * @param {*} oEvent
		 */
		openExcelUploadDialog: async function (oEvent) {
			this._view.setBusyIndicatorDelay(0);
			this._view.setBusy(true);
			if (!this.excelUpload) {
				this.excelUpload = await this._controller.getAppComponent().createComponent({
					usage: "excelUpload",
					async: true,
					componentData: {
						context: this,
						activateDraft: true
					}
				});

				// event to check before uploaded to app
				this.excelUpload.attachCheckBeforeRead(function (oEvent) {
					// example
					const sheetData = oEvent.getParameter("sheetData");
					let errorArray = [];
					for (const [index, row] of sheetData.entries()) {
						//check for invalid price
						if (row["UnitPrice[price]"]) {
							if (row["UnitPrice[price]"].rawValue > 100) {
								const error = {
									title: "Price to high (max 100)",
									row: index + 2,
									group: true
								};
								errorArray.push(error);
							}
						}
					}
					oEvent.getSource().addToErrorsResults(errorArray);
				}, this);

				// event example to prevent uploading data to backend
				this.excelUpload.attachUploadButtonPress(function (event) {
					//event.preventDefault();
				}, this);

				// event to change data before send to backend
				this.excelUpload.attachChangeBeforeCreate(function (oEvent) {
					let payload = oEvent.getParameter("payload");
					// round number from 12,56 to 12,6
					if (payload.price) {
						payload.price = Number(payload.price.toFixed(1));
					}
					oEvent.getSource().setPayload(payload);
				}, this);
			}
			this.excelUpload.openExcelUploadDialog();
			this._view.setBusy(false);
		}
	};
});
