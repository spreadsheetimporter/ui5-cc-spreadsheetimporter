sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("ui.v2.ordersv2freestylenondraft.controller.Errors", {
		onOpenErrors: async function () {
			// Non-standalone: the component resolves the bound /OrderItems table from context and
			// validates the uploaded file against the OrderItems metadata (price is numeric, so bad
			// number formats raise validation errors in the messages dialog before any backend write).
			this.spreadsheetUpload = await this.getOwnerComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this
				}
			});

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
		},

		onNavBack: function () {
			window.history.back();
		}
	});
});
