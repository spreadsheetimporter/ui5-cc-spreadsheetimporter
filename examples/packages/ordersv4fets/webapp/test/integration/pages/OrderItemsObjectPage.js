sap.ui.define(["sap/fe/test/ObjectPage"], function (ObjectPage) {
	"use strict";

	var CustomPageDefinitions = {
		actions: {},
		assertions: {}
	};

	return new ObjectPage(
		{
			appId: "ui.v4.ordersv4fe",
			componentId: "OrderItemsObjectPage",
			entitySet: "OrderItems"
		},
		CustomPageDefinitions
	);
});
