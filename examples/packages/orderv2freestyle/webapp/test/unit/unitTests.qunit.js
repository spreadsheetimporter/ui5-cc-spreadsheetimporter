/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require(["ui/v2/orderv2freestyle/test/unit/AllTests"], function () {
		QUnit.start();
	});
});
