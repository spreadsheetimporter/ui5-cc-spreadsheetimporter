sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("ui.v2.ordersv2freestylenondraft.controller.Options", {
		onOpenOptions: async function () {
			// availableOptions makes the importer show its Options/Settings menu, restricted to the
			// listed options (here only "strict").
			this.spreadsheetUpload = await this.getOwnerComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this,
					availableOptions: ["strict"]
				}
			});

			this.spreadsheetUpload.openSpreadsheetUploadDialog();
		},

		onNavBack: function () {
			window.history.back();
		}
	});
});
