sap.ui.define(["sap/m/MessageToast"], function (MessageToast) {
	"use strict";
	return {
		/**
		 * Create Dialog to Upload Spreadsheet and open it
		 * @param {*} oEvent
		 */
		openSpreadsheetUploadDialog: async function (oEvent) {
			this.editFlow.getView().setBusyIndicatorDelay(0);
			this.editFlow.getView().setBusy(true);

			// prettier-ignore
			this.spreadsheetUpload = await this.editFlow.getView()
					.getController()
					.getAppComponent()
					.createComponent({
						usage: "spreadsheetImporter",
						async: true,
						componentData: {
							context: this,
							action: "UPDATE",
							createActiveEntity: true,
							i18nModel: this.getModel("i18n"),
							debug: true,
							showDownloadButton: true,
							deepDownloadConfig: {
								deepLevel: 1,
								deepExport: false,
								addKeysToExport: true,
								showOptions: true,
								filename: "Orders123",
								columns : {
									"OrderNo":{
										"order": 1
									},
									"buyer": {
										"order": 3
									},
									"Items": {
										"quantity" : {
											"order": 2
										},
										"title": {
											"order": 4
										}
									},
									"Shipping": {
										"address" : {
											"order": 5
										},
									}
								}
							}
						}
					});
			
			this.spreadsheetUpload.attachPreFileProcessing(function (event) {
				// example
				let file = event.getParameter("file");
				if (file.name.endsWith(".txt")) {
					// prevent processing of file
					event.preventDefault();
					// show custom ui5 error message
					new MessageToast.show("File with .txt extension is not allowed");
					// change the file that will be processed
					// Create a Blob with some text content
					const blob = new Blob(["This is some dummy text content"], { type: "text/plain" });
					// Create a File object from the Blob
					const file2 = new File([blob], "TEXT.txt", { type: "text/plain" });
					return file2;
				}
			})

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

			// event example to prevent uploading data to backend
			this.spreadsheetUpload.attachUploadButtonPress(function (event) {
				//event.preventDefault();
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
			// this.spreadsheetUpload.triggerDownloadSpreadsheet({
			// 	deepLevel: 1,
			// 	deepExport: true,
			// 	addKeysToExport: true,
			// 	showOptions: true,
			// 	filename: "Orders12",
			// 	columns : {
			// 		"OrderNo":{
			// 			"order": 1
			// 		},
			// 		"buyer": {
			// 			"order": 3
			// 		},
			// 		"Items": {
			// 			"quantity" : {
			// 				"order": 2
			// 			}
			// 		},
			// 		"Shipping": {
			// 			"address" : {
			// 				"order": 5
			// 			},
			// 		}
			// 	}
			// });
			this.editFlow.getView().setBusy(false);
		},

		openLanding: function (oEvent) {
			window.open("https://spreadsheet-importer.com/", "_blank");
		},

		openDocs: function (oEvent) {
			window.open("https://docs.spreadsheet-importer.com/", "_blank");
		}
	};
});
