sap.ui.define([], function () {
	"use strict";
	return {
		openSpreadsheetUploadDialog: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			// this.getView().setBusy(true)

			this.spreadsheetUpload = await this.getOwnerComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this,
					columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal", "byte", "binary"],
					mandatoryFields: ["product_ID", "quantity"],
					spreadsheetFileName: "Test.xlsx"
				}
			});

			// event to check before uploaded to app
			this.spreadsheetUpload.attachCheckBeforeRead(function (oEvent) {
				// example
				const sheetData = oEvent.getParameter("sheetData");
				let errorArray = [];
				for (const [index, row] of sheetData.entries()) {
					//check for invalid price
					for (const key in row) {
						if (key.endsWith("[price]") && row[key].rawValue > 100) {
							const error = {
								title: "Price too high (max 100)",
								row: index + 2,
								group: true,
								rawValue: row[key].rawValue,
								ui5type: "Error"
							};
							errorArray.push(error);
						}
					}
				}
				oEvent.getSource().addArrayToMessages(errorArray);
			}, this);

			// event to change data before send to backend
			this.spreadsheetUpload.attachChangeBeforeCreate(function (oEvent) {
				let payload = Object.assign({}, oEvent.getParameter("payload"));
				// round number from 12,56 to 12,6
				if (payload.price) {
					payload.price = Number(payload.price.toFixed(1));
				}
				return payload;
			}, this);

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
			this.getView().setBusy(false);
		}
	};
});
