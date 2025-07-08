sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";
	return {
		/**
		 * Create Dialog to Upload Spreadsheet and open it
		 * @param {*} oEvent
		 */
		openSpreadsheetUploadDialog: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			// this.getView().setBusy(true)
			this.spreadsheetUpload = await this.getView()
				.getController()
				.getOwnerComponent()
				.createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: this,
						tableId: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--Items::com.sap.vocabularies.UI.v1.LineItem::responsiveTable",
						columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal", "byte", "binary"],
						mandatoryFields: ["product_ID", "quantity"],
						spreadsheetFileName: "Test.xlsx",
						hidePreview: false
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
				let payload = oEvent.getParameter("payload");
				// round number from 12,56 to 12,6
				if (payload.price) {
					payload.price = Number(Number(payload.price).toFixed(1));
				}
				return payload;
			}, this);

			this.spreadsheetUpload.attachRequestCompleted(function (oEvent) {
				const success = oEvent.getParameter("success");
				if (success) {
					console.log("Request Completed");
				} else {
					console.log("Request Failed");
				}
			}, this);
			this.spreadsheetUpload.openSpreadsheetUploadDialog();
			this.getView().setBusy(false);
		},
		openSpreadsheetUploadDialogInfo: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			// this.getView().setBusy(true)
			this.spreadsheetUpload = await this.getView()
				.getController()
				.getOwnerComponent()
				.createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: this,
						spreadsheetFileName: "Test.xlsx",
						hidePreview: false
					}
				});

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
			this.getView().setBusy(false);
		},
		deepdownload: async function () {
			this.spreadsheetUpload = await this.getView()
				.getController()
				.getOwnerComponent()
				.createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: this,
						tableId: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--Items::com.sap.vocabularies.UI.v1.LineItem::responsiveTable",
						createActiveEntity: true,
						debug: false,
						deepDownloadConfig: {
							deepLevel: 2,
							deepExport: true,
							addKeysToExport: true,
							showOptions: false,
							filename: "Orders123",
							columns: {
								OrderNo: {
									order: 1
								},
								buyer: {
									order: 3
								},
								Items: {
									quantity: {
										order: 2
									},
									title: {
										order: 4
									}
								},
								Shipping: {
									address: {
										order: 5
									}
								}
							}
						}
					}
				});

			// this.spreadsheetUpload.attachBeforeDownloadFileProcessing(this.onBeforeDownloadFileProcessing, this);
			// this.spreadsheetUpload.attachBeforeDownloadFileExport(this.onBeforeDownloadFileExport, this);

			this.spreadsheetUpload.triggerDownloadSpreadsheet();
		}
	};
});
