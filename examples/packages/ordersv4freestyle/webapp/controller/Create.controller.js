sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("ordersv4freestyle.controller.Create", {
		onOpenCreate: async function () {
			// Non-standalone: the component resolves the bound table from the controller context
			// (the /Orders table in this view) and creates the parsed rows in the backend.
			this.spreadsheetUpload = await this.getOwnerComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this,
					createActiveEntity: true
				}
			});

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
		},

		onNavBack: function () {
			window.history.back();
		}
	});
});
