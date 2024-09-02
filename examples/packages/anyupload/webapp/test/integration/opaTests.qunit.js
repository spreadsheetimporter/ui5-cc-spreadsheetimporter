sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/spreadsheetimporter/anyupload/test/integration/FirstJourney',
		'com/spreadsheetimporter/anyupload/test/integration/pages/OrdersMain'
    ],
    function(JourneyRunner, opaJourney, OrdersMain) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/spreadsheetimporter/anyupload') + '/index.html'
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