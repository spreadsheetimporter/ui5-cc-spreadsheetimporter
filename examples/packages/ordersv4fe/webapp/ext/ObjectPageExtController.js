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
						tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
						columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal"],
						mandatoryFields: ["product_ID", "quantity"],
						excelFileName: "Test.xlsx"
					}
				});

				// event to check before uploaded to app
				this.excelUpload.attachCheckBeforeRead(function (oEvent) {
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
				this.excelUpload.attachChangeBeforeCreate(function (oEvent) {
					let payload = oEvent.getParameter("payload");
					// round number from 12,56 to 12,6
					if (payload.price) {
						payload.price = Number(payload.price.toFixed(1))
					}
					oEvent.getSource().setPayload(payload);
				}, this);
			}
			this.excelUpload.openExcelUploadDialog();
			this._view.setBusy(false);
		},
		openExcelUploadDialogTable: async function (oEvent) {
			this._view.setBusyIndicatorDelay(0);
			this._view.setBusy(true);
			if (!this.excelUploadTable) {
				this.excelUploadTable = await this._controller.getAppComponent().createComponent({
					usage: "excelUpload",
					async: true,
					componentData: {
						context: this,
						columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal"],
						mandatoryFields: ["product_ID", "quantity"],
						excelFileName: "Test.xlsx",
						tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable"
					}
				});
			}
			this.excelUploadTable.openExcelUploadDialog();
			this._view.setBusy(false);
		},
		openExcelUploadDialogTableShipping: async function (oEvent) {
			this._view.setBusyIndicatorDelay(0);
			this._view.setBusy(true);
			if (!this.excelUploadTableShipping) {
				this.excelUploadTableShipping = await this._controller.getAppComponent().createComponent({
					usage: "excelUpload",
					async: true,
					componentData: {
						context: this,
						tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable"
					}
				});
			}
			this.excelUploadTableShipping.openExcelUploadDialog();
			this._view.setBusy(false);
		},
		openExcelUploadDialogTableInfo: async function (oEvent) {
			this._view.setBusyIndicatorDelay(0);
			this._view.setBusy(true);
			if (!this.excelUploadTableShippingInfo) {
				this.excelUploadTableShippingInfo = await this._controller.getAppComponent().createComponent({
					usage: "excelUpload",
					async: true,
					componentData: {
						context: this,
						tableId: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::table::Infos::LineItem-innerTable"
					}
				});
			}
			this.excelUploadTableShippingInfo.openExcelUploadDialog();
			this._view.setBusy(false);
		}
	};
});
