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

		openExcelUpload: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);
			if (!this.excelUpload) {
				this.excelUpload = await this.getOwnerComponent().createComponent({
					usage: "excelUpload",
					async: true,
					componentData: {
						columns: ["product_ID", "username"],
						standalone: true
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
							if (row["UnitPrice[price]"] > 100) {
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

				// event to change data before send to backend
				this.excelUpload.attachChangeBeforeCreate(function (oEvent) {
					let payload = oEvent.getParameter("payload");
					// round number from 12,56 to 12,6
					if (payload.price) {
						payload.price = Number(payload.price.toFixed(1));
					}
					oEvent.getSource().setPayload(payload);
				}, this);

				this.excelUpload.attachUploadButtonPress(function (oEvent) {
					const model = this.getModel("tableData");
					model.setData(oEvent.getParameter("payload"));
					oEvent.preventDefault();
				}, this);
			}
			this.excelUpload.openExcelUploadDialog();
			this.getView().setBusy(false);
		},

		checkBeforeRead(oEvent) {
			const sheetData = oEvent.getParameter("sheetData");
			let errorArray = [];
			for (const [index, row] of sheetData.entries()) {
				//check for invalid price
				if (row["UnitPrice[price]"]) {
					if (row["UnitPrice[price]"] > 100) {
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
		},

		changeBeforeCreate(oEvent) {
			let payload = oEvent.getParameter("payload");
			// round number from 12,56 to 12,6
			if (payload.price) {
				payload.price = Number(payload.price.toFixed(1));
			}
			oEvent.getSource().setPayload(payload);
		},

		uploadButtonPress(oEvent) {
			const model = this.getModel("tableData");
			model.setData(oEvent.getParameter("payload"));
		}
	});
});
