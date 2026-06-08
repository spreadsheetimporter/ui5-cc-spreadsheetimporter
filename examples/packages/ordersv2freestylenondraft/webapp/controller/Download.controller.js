sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("ui.v2.ordersv2freestylenondraft.controller.Download", {
		onDownload: async function () {
			this.spreadsheetUpload = await this.getOwnerComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this,
					createActiveEntity: true,
					deepDownloadConfig: {
						deepLevel: 2,
						deepExport: true,
						addKeysToExport: true,
						showOptions: false,
						filename: "FeatureDeepDownload",
						columns: {
							OrderNo: { order: 1 },
							buyer: { order: 3 },
							Items: { quantity: { order: 2 }, title: { order: 4 } },
							Shipping: { address: { order: 5 } }
						}
					}
				}
			});

			this.spreadsheetUpload.triggerDownloadSpreadsheet();
		},

		onNavBack: function () {
			window.history.back();
		}
	});
});
