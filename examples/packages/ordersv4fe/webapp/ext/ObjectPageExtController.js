sap.ui.define([], function () {
	"use strict";
	return {
		openSpreadsheetUploadDialog: async function (oEvent) {
			let spreadsheetImporterOptions;
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

							useTableSelector: true,
							i18nModel: this.getModel("i18n")
						}
						
					});
			// necessary to trigger Table Selector and get tableId
			await this.spreadsheetUpload.triggerInitContext();
			const selectedTable = this.spreadsheetUpload.getTableId();
			if (selectedTable) {
				// not necessary to have specific options for each table, but possible to set options for specific table
				// check if selectedTable is available, if not, the user clicked on cancel
				if (selectedTable === "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable") {
					spreadsheetImporterOptions = {
						context: this,
						tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
						columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal"],
						mandatoryFields: ["product_ID", "quantity"],
						spreadsheetFileName: "Test.xlsx",
						hidePreview: true,
						sampleData: [
							{
								product_ID: "HT-1000",
								quantity: 1,
								title: "Notebook Basic 15",
								price: 956,
								validFrom: new Date(),
								timestamp: new Date(),
								date: new Date(),
								time: new Date(),
								boolean: true,
								decimal: 1.1
							}
						]
					};
				}
				if (selectedTable === "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable") {
					spreadsheetImporterOptions = {
						context: this,
						tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable"
					};
				}

				// possible to open dialog with options, option not necessary
				this.spreadsheetUpload.openSpreadsheetUploadDialog(spreadsheetImporterOptions);
			}
			this.editFlow.getView().setBusy(false);
		},
		/**
		 * Create Dialog to Upload Spreadsheet and open it
		 * @param {*} oEvent
		 */
		openSpreadsheetUploadDialogTable: async function (oEvent) {
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
							// action: "UPDATE",
							// updateConfig: {
							// 	fullUpdate: false
							// },
							showDownloadButton: true,
							tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
							columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal", "byte","binary"],
							mandatoryFields: ["product_ID", "quantity"],
							spreadsheetFileName: "Test.xlsx",
							i18nModel: this.getModel("i18n"),
							deepDownloadConfig: {
								depth: 0
							},
							sampleData: [
								{
									product_ID: "HT-1000",
									quantity: 1,
									title: "Notebook Basic 15",
									price: 956,
									validFrom: new Date(),
									timestamp: new Date(),
									date: new Date(),
									time: new Date(),
									boolean: true,
									decimal: 1.1
								}
							]
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
			this.editFlow.getView().setBusy(false);
		},
		openSpreadsheetUploadDialogTableShipping: async function (oEvent) {
			this.editFlow.getView().setBusyIndicatorDelay(0);
			this.editFlow.getView().setBusy(true);
			const options = {
				context: this,
				tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable"
			};
			// prettier-ignore
			this.spreadsheetUploadTableShipping = await this.editFlow.getView()
					.getController()
					.getAppComponent()
					.createComponent({
						usage: "spreadsheetImporter",
						async: true
					});
			this.spreadsheetUploadTableShipping.setHidePreview(true);
			this.spreadsheetUploadTableShipping.openSpreadsheetUploadDialog(options);

			// Attach event to check before data is uploaded to UI5
			this.spreadsheetUploadTableShipping.attachCheckBeforeRead(async function (event) {
				return new Promise(async (resolve, reject) => {
					try {
						// Show busy state in the upload dialog
						const eventParameters = event.getParameters();
						const source = event.getSource();
						const uploadDialog = source.spreadsheetUpload.getSpreadsheetUploadDialog();
						uploadDialog.setBusyIndicatorDelay(0);
						uploadDialog.setBusy(true);

						// Get the parsed data from the spreadsheet
						const parsedData = eventParameters["parsedData"];

						// Prepare shipping details to be checked by the backend
						const shippingDetails = [];
						for (const [index, row] of parsedData.entries()) {
							// Extract the relevant information for checking
							if (row.city) {
								shippingDetails.push({
									city: row.city,
									address: row.address || "",
									row: index + 2 // Add 1 to account for header row and 1 for the index
								});
							}
						}

						// Skip check if no shipping details with cities are present
						if (shippingDetails.length === 0) {
							uploadDialog.setBusy(false);
							resolve();
							return;
						}

						// Get the model to call the unbound action
						const model = event.getSource().getContext().getModel();

						// Create action binding for the unbound action
						const actionBinding = model.bindContext("/checkShippingDetails(...)");

						// Set the parameters for the action
						actionBinding.setParameter("shippingDetails", shippingDetails);

						// Execute the action and wait for the result
						try {
							await actionBinding.execute();

							// Get the result from the action
							const actionResult = actionBinding.getBoundContext().getObject();

							// Check if there are any errors/warnings to display
							if (actionResult && actionResult.value && actionResult.value.length > 0) {
								// Add errors to the spreadsheet uploader component to be displayed
								source.addArrayToMessages(actionResult.value);
							}
						} catch (actionError) {
							console.error("Error executing action:", actionError);
							source.addArrayToMessages([
								{
									title: "Error checking city names",
									row: 0,
									group: true,
									rawValue: "Error in backend check",
									ui5type: "Error"
								}
							]);
						}

						uploadDialog.setBusy(false);
					} catch (error) {
						console.error("Error during city check:", error);
						const uploadDialog = event.getSource().spreadsheetUpload.getSpreadsheetUploadDialog();
						if (uploadDialog) {
							uploadDialog.setBusy(false);
						}
					}

					// Important! This must not be deleted
					// This tells the component that the code can continue running
					resolve();
				});
			}, this);

			this.editFlow.getView().setBusy(false);
		},
		openSpreadsheetUploadDialogTableInfo: async function (oEvent) {
			this.editFlow.getView().setBusyIndicatorDelay(0);
			this.editFlow.getView().setBusy(true);
			// prettier-ignore
			this.spreadsheetUploadTableShippingInfo = await this.editFlow.getView()
					.getController()
					.getAppComponent()
					.createComponent({
						usage: "spreadsheetImporter",
						async: true,
						componentData: {
							context: this,
							tableId: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::table::Infos::LineItem-innerTable"
						}
					});
			this.spreadsheetUploadTableShippingInfo.openSpreadsheetUploadDialog();
			this.editFlow.getView().setBusy(false);
		},

		openSpreadsheetUploadDialogTableUpdate: async function (oEvent) {
			this.spreadsheetUploadUpdate = await this.editFlow
				.getView()
				.getController()
				.getAppComponent()
				.createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: this,
						tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
						action: "UPDATE",
						updateConfig: {
							fullUpdate: false
						},
						deepDownloadConfig: {
							addKeysToExport: true,
							showOptions: false,
							filename: "OrderItems"
						},
						showDownloadButton: true,
						tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
						columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal", "byte", "binary"],
						mandatoryFields: ["product_ID", "quantity"]
					}
				});
			this.spreadsheetUploadUpdate.openSpreadsheetUploadDialog();
		},

		openSpreadsheetUpdateDialog: async function (oEvent) {
			this.spreadsheetUpload = await this.editFlow
				.getView()
				.getController()
				.getAppComponent()
				.createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: this,
						tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
						action: "UPDATE",
						updateConfig: {
							fullUpdate: false
						}
					}
				});
			this.spreadsheetUpload.openSpreadsheetUploadDialog();
		},

		dowloadItems: async function (event) {
			this.spreadsheetUpload = await this.editFlow
				.getView()
				.getController()
				.getAppComponent()
				.createComponent({
					usage: "spreadsheetImporter",
					async: true,
					componentData: {
						context: this,
						tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
						createActiveEntity: true,
						debug: false,
						deepDownloadConfig: {
							addKeysToExport: true,
							showOptions: false,
							filename: "OrderItems"
						}
					}
				});
			this.spreadsheetUpload.triggerDownloadSpreadsheet();
		}
	};
});
