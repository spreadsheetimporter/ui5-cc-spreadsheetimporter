sap.ui.define(["sap/m/MessageToast"], function (MessageToast) {
	"use strict";

	return {
		/**
		 * Native server-side template download.
		 * Opens the Template $value media stream — the backend sets
		 * content-disposition: attachment; filename, so the browser downloads the .xlsx directly.
		 */
		downloadTemplate: function () {
			var oModel = this.editFlow.getView().getModel();
			var sBase = oModel.getServiceUrl();
			if (sBase.charAt(sBase.length - 1) !== "/") {
				sBase += "/";
			}
			var sUrl = sBase + "Template(EntityName='ZSSI_R_ORD')/FileContent";
			MessageToast.show("Downloading template …");
			window.open(sUrl, "_blank");
		},

		/**
		 * Client-side path: open the ui5-cc-spreadsheetimporter component dialog.
		 * The component parses the .xlsx in the browser and creates Orders via the
		 * OData V4 model (no server-side action involved) — the "component" half of
		 * the side-by-side comparison with the native server actions above.
		 */
		openSpreadsheetUploadDialog: async function () {
			var oController = this.editFlow.getView().getController();
			this.spreadsheetUpload = await oController.getAppComponent().createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this,
					createActiveEntity: true
				}
			});
			this.spreadsheetUpload.openSpreadsheetUploadDialog();
		}
	};
});
