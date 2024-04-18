sap.ui.define(["sap/fe/core/PageController"], function (PageController) {
	"use strict";

	return PageController.extend("ui.v4.ordersv4fpm.ext.main.Main", {
		openSpreadsheetUploadDialog: async function (oEvent) {
			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);
			this.spreadsheetUpload = await this.getController()
				.getAppComponent()
				.createComponent({
					name: "cc.spreadsheetimporter",
					async: false,
					componentData: {
						context: this,
						activateDraft: true,
						tableId: "ui.v4.ordersv4fpm::OrdersMain--LineItemTablePageEdit-content-innerTable"
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
					payload.price = Number(payload.price).toFixed(1);
				}
				return payload;
			}, this);

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
			this.getView().setBusy(false);
		}
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ui.v4.ordersv4fpm.ext.main.Main
		 */
		//  onInit: function () {
		//
		//  },

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ui.v4.ordersv4fpm.ext.main.Main
		 */
		//  onBeforeRendering: function() {
		//
		//  },

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ui.v4.ordersv4fpm.ext.main.Main
		 */
		//  onAfterRendering: function() {
		//
		//  },

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ui.v4.ordersv4fpm.ext.main.Main
		 */
		//  onExit: function() {
		//
		//  }
	});
});
