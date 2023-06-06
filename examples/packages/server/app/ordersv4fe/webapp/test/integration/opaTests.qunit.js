sap.ui.require(
	[
		"sap/fe/test/JourneyRunner",
		"ui/v4/orders/test/integration/FirstJourney",
		"ui/v4/orders/test/integration/pages/OrdersList",
		"ui/v4/orders/test/integration/pages/OrdersObjectPage",
		"ui/v4/orders/test/integration/pages/Orders_ItemsObjectPage"
	],
	function (JourneyRunner, opaJourney, OrdersList, OrdersObjectPage, Orders_ItemsObjectPage) {
		"use strict";
		var JourneyRunner = new JourneyRunner({
			// start index.html in web folder
			launchUrl: sap.ui.require.toUrl("ui/v4/orders") + "/index.html"
		});

		JourneyRunner.run(
			{
				pages: {
					onTheOrdersList: OrdersList,
					onTheOrdersObjectPage: OrdersObjectPage,
					onTheOrders_ItemsObjectPage: Orders_ItemsObjectPage
				}
			},
			opaJourney.run
		);
	}
);
