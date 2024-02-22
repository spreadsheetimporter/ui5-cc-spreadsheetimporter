sap.ui.define(["sap/ui/core/mvc/ControllerExtension"], function (ControllerExtension) {
	"use strict";

	return ControllerExtension.extend("ui.v4.ordersv4fe.ext.controller.OrderItems", {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf ui.v4.ordersv4fe.ext.controller.OrderItems
			 */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
				const subsection = this.base.getView().byId("ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::CustomSection::myCustomSection").getSubSections()[0];
				// add Button with text "Upload" to the subsection and press event "onUpload"
				subsection.addBlock(
					new sap.m.Button({
						text: "Upload Spreadsheet Infos",
						press: this.onUpload.bind(this)
					})
				);
			}
		},

		onUpload: async function (oEvent) {
			this.base.getView().setBusyIndicatorDelay(0);
			this.base.getView().setBusy(true);
			// prettier-ignore
			this.spreadsheetUploadTableShippingInfo = await this.base.getView()
					.getController()
					.getAppComponent()
					.createComponent({
						usage: "spreadsheetImporter",
						async: true,
						componentData: {
							context: this,
							tableId: "ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::table::Infos::LineItem-innerTable",
							logTitle: 'Mainak Testing'
						}
					});
			this.spreadsheetUploadTableShippingInfo.openSpreadsheetUploadDialog();
			this.base.getView().setBusy(false);
		}
	});
});
