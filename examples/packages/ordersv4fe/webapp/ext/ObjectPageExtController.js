sap.ui.define(["cc/spreadsheetimporter/v0_22_0/TableChooser"], function (TableChooser) {
	"use strict";
	return {
		openSpreadsheetUploadDialog: async function (oEvent) {
			this.editFlow.getView().setBusyIndicatorDelay(0);
			this.editFlow.getView().setBusy(true);
			const tableChooser = new TableChooser(this.editFlow.getView());
			// possible to get all tables found
			const tables = tableChooser.getTables();
			let chosenTable;
			try {
				chosenTable = await tableChooser.chooseTable();
			} catch (error) {
				// user canceled or no table found
				this.editFlow.getView().setBusy(false);
				return;
			}
			let spreadsheetImporterOptions;
			if (chosenTable.getId() === "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable") {
				spreadsheetImporterOptions = {
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
				};
			}
			if (chosenTable.getId() === "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable") {
				spreadsheetImporterOptions = {
					context: this,
					tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable"
				};
			}

			// prettier-ignore
			this.spreadsheetUpload = await this.editFlow.getView()
					.getController()
					.getAppComponent()
					.createComponent({
						usage: "spreadsheetImporter",
						async: true,
						componentData: 
							spreadsheetImporterOptions
						
					});

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
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
			// prettier-ignore
			this.spreadsheetUploadTableShipping = await this.editFlow.getView()
					.getController()
					.getAppComponent()
					.createComponent({
						usage: "spreadsheetImporter",
						async: true,
						componentData: {
							context: this,
							tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable"
						}
					});
			this.spreadsheetUploadTableShipping.openSpreadsheetUploadDialog();
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
