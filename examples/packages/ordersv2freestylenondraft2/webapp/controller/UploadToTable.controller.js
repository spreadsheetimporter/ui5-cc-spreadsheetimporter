sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "../model/formatter", "sap/m/library"], function (BaseController, JSONModel, formatter, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return BaseController.extend("ui.v2.ordersv2freestylenondraft.controller.UploadToTable", {
		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
			});
			var oTableModel = new JSONModel();
			this.setModel(oTableModel, "tableData");
			this.setModel(oViewModel, "detailView");
		},

		openSpreadsheetUpload: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);

			this.spreadsheetUpload = await this.getOwnerComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					columns: ["product_ID", "username"],
					standalone: true,
					readAllSheets: true
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
				return payload;
			}, this);

			this.spreadsheetUpload.attachUploadButtonPress(function (oEvent) {
				const model = this.getModel("tableData");
				model.setData(oEvent.getParameter("rawData"));
				oEvent.preventDefault();
			}, this);

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
			this.getView().setBusy(false);
		},

		checkBeforeRead(oEvent) {
			const sheetData = oEvent.getParameter("sheetData");
			let errorArray = [];
			for (const [index, row] of sheetData.entries()) {
				//check for invalid price
				if (row["UnitPrice[price]"]) {
					if (row["UnitPrice[price]"].rawValue > 100) {
						const error = {
							title: "Price to high (max 100)",
							row: index + 2,
							group: true,
							rawValue: row["UnitPrice[price]"].rawValue,
							ui5type: "Error"
						};
						errorArray.push(error);
					}
				}
			}
			oEvent.getSource().addArrayToMessages(errorArray);
		},

		changeBeforeCreate(oEvent) {
			let payload = oEvent.getParameter("payload");
			// round number from 12,56 to 12,6
			if (payload.price) {
				payload.price = Number(payload.price.toFixed(1));
			}
			return payload;
		},

		uploadButtonPress(oEvent) {
			const model = this.getModel("tableData");
			model.setData(oEvent.getParameter("rawData"));
		}
	});
});
