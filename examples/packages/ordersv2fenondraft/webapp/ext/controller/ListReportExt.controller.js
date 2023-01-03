sap.ui.define([], function () {
	"use strict";
	return {
		openExcelUpload: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);
			if (!this.excelUpload) {
				this.excelUpload = await sap.ui.getCore().createComponent({
					name: "cc.excelUpload",
					async: false,
					componentData: {
						context: this,
						activateDraft: true
					}
				});

				// event to check before uploaded to app
				this.excelUpload.attachCheckBeforeRead(function (oEvent) {
					// example
					const sheetData = oEvent.getParameter("sheetData");
					let errorArray = [
						{
							title: "Price to high (max 100)",
							counter: 0
						}
					];
					for (const row of sheetData) {
						//check for invalid date
						if (row.UnitPrice) {
							if (row.UnitPrice > 100) {
								errorArray[0].counter = errorArray[0].counter + 1;
							}
						}
					}
					oEvent.getSource().addToErrorsResults(errorArray);
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
			this.getView().setBusy(false);
		}
	};
});
