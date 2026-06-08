sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("ordersv4freestyle.controller.Errors", {
		onOpenErrors: async function () {
			// Non-standalone: the component resolves the bound /OrderItems table from context and
			// validates the uploaded file against the OrderItems metadata (price is a Double, so bad
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
