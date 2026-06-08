sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("ui.v2.ordersv2freestylenondraft.controller.Locale", {
		onInit: function () {
			this.getView().setModel(new JSONModel([]), "tableData");
		},

		onOpenLocale: async function () {
			// Non-standalone so values are coerced against the OData type (OrderItems price = Double)
			// using decimalSeparator ",". uploadButtonPress hands back the coerced rows before the
			// write; preventDefault() skips the actual create (we only assert the coercion).
			const oTableModel = this.getView().getModel("tableData");

			this.spreadsheetUpload = await this.getOwnerComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this,
					decimalSeparator: ","
				}
			});

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
