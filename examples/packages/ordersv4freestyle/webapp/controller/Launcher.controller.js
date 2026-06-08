sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (Controller, JSONModel) {
	"use strict";

	// Single source of truth for the harness feature pages. Add an entry here when adding a feature
	// view + route; the console row and its navigation are then generated automatically.
	const FEATURES = [
		{ title: "Upload (standalone parse)", hash: "feature/upload", flavor: "standalone" },
		{ title: "Deep Download (export)", hash: "feature/download", flavor: "backend" },
		{ title: "Create (backend)", hash: "feature/create", flavor: "backend" },
		{ title: "Locale (decimal separator)", hash: "feature/locale", flavor: "standalone" },
		{ title: "Errors (validation)", hash: "feature/errors", flavor: "backend" },
		{ title: "Options (available options)", hash: "feature/options", flavor: "backend" }
	];

	return Controller.extend("ordersv4freestyle.controller.Launcher", {
		onInit: function () {
			this.getView().setModel(new JSONModel(FEATURES), "features");
		},

		onOpenFeature: function (oEvent) {
			const hash = oEvent.getSource().getBindingContext("features").getProperty("hash");
			this.getOwnerComponent().getRouter().getHashChanger().setHash(hash);
		}
	});
});
