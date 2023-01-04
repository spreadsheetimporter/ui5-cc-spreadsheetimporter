sap.ui.require(
	["sap/fe/test/JourneyRunner", "ui/v4/ordersv4fpm/test/integration/FirstJourney", "ui/v4/ordersv4fpm/test/integration/pages/OrdersMain"],
	function (JourneyRunner, opaJourney, OrdersMain) {
		"use strict";
		var JourneyRunner = new JourneyRunner({
			// start index.html in web folder
			launchUrl: sap.ui.require.toUrl("ui/v4/ordersv4fpm") + "/index.html"
		});

		JourneyRunner.run(
			{
				pages: {
					onTheOrdersMain: OrdersMain
				}
			},
			opaJourney.run
		);
	}
);
