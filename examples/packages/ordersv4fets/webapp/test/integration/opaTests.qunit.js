sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ui/v4/ordersv4fets/test/integration/FirstJourney',
		'ui/v4/ordersv4fets/test/integration/pages/OrdersList',
		'ui/v4/ordersv4fets/test/integration/pages/OrdersObjectPage',
		'ui/v4/ordersv4fets/test/integration/pages/OrderItemsObjectPage'
    ],
    function(JourneyRunner, opaJourney, OrdersList, OrdersObjectPage, OrderItemsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ui/v4/ordersv4fets') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheOrdersList: OrdersList,
					onTheOrdersObjectPage: OrdersObjectPage,
					onTheOrderItemsObjectPage: OrderItemsObjectPage
                }
            },
            opaJourney.run
        );
    }
);