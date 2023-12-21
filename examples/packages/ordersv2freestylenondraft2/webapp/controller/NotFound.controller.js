sap.ui.define(["./BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("ui.v2.ordersv2freestylenondraft.controller.NotFound", {
		onInit: function () {
			this.getRouter().getTarget("notFound").attachDisplay(this._onNotFoundDisplayed, this);
		},

		_onNotFoundDisplayed: function () {
			this.getModel("appView").setProperty("/layout", "OneColumn");
		}
	});
});
