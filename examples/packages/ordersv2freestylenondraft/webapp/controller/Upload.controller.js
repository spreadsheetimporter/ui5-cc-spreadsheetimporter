sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("ui.v2.ordersv2freestylenondraft.controller.Upload", {
		onInit: function () {
			this.getView().setModel(new JSONModel([]), "tableData");
		},

		onOpenUpload: async function () {
			// Capture the model in a closure: the component dispatches its custom events via
			// Util.fireEventAsync, which calls handlers with `this === null` (the listener
			// context passed to attach* is ignored). So never rely on `this` inside the handler.
			const oTableModel = this.getView().getModel("tableData");

			this.spreadsheetUpload = await this.getOwnerComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					columns: ["OrderNo", "buyer"],
					standalone: true,
					readAllSheets: true
				}
			});

			// In standalone mode the component does not write to a backend; it hands the
			// parsed rows back via uploadButtonPress so the app can do what it wants with them.
			this.spreadsheetUpload.attachUploadButtonPress((oEvent) => {
				oTableModel.setData(oEvent.getParameter("rawData"));
				oEvent.preventDefault();
			});

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
		},

		onNavBack: function () {
			window.history.back();
		}
	});
});
