sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("ui.v2.ordersv2freestylenondraft.controller.FieldMatch", {
		onOpenFieldMatch: async function () {
			// Non-standalone with fieldMatchType "label": the component resolves the bound /OrderItems
			// table from context and matches columns by their plain field label instead of the default
			// "[key]" bracket notation. The uploaded file uses the bracket format, so in "label" mode
			// none of the headers match a field label and the component raises a "column not found"
			// error for every column in the messages dialog instead of writing.
			this.spreadsheetUpload = await this.getOwnerComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this,
					fieldMatchType: "label"
				}
			});

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
		},

		onNavBack: function () {
			window.history.back();
		}
	});
});
