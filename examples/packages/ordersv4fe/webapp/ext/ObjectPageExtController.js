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
							useTableSelector: true
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
							tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
							columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal"],
							mandatoryFields: ["product_ID", "quantity"],
							spreadsheetFileName: "Test.xlsx",
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
					payload.price = Number(payload.price.toFixed(1));
				}
				oEvent.getSource().setPayload(payload);
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
		}
	};
});
