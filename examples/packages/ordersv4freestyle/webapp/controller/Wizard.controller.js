sap.ui.define(["sap/ui/core/mvc/Controller", "sap/m/MessageToast"], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("ordersv4freestyle.controller.Wizard", {
		onInit: function () {
			// Controller initialization
		},

		/**
		 * Navigate back to main view
		 */
		onNavBack: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("RouteMainView");
		},

		/**
		 * Open wizard programmatically
		 */
		openWizard: function () {
			// Get the spreadsheet importer component
			var oSpreadsheetUpload = this.byId("wizardSpreadsheetImporter");

			if (oSpreadsheetUpload) {
				// Get the component instance
				var oComponent = oSpreadsheetUpload.getComponentInstance();

				if (oComponent) {
					// Open the wizard
					oComponent
						.openWizard()
						.then(function (result) {
							if (!result.canceled) {
								MessageToast.show("Wizard completed successfully!");
							} else {
								MessageToast.show("Wizard was canceled");
							}
						})
						.catch(function (error) {
							MessageToast.show("Error opening wizard: " + error.message);
						});
				} else {
					MessageToast.show("Component not ready yet");
				}
			} else {
				MessageToast.show("Spreadsheet importer not found");
			}
		}
	});
});
