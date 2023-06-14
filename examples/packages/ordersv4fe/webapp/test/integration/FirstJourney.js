sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/opaQunit", "sap/ui/test/actions/Press"], function (Opa5, opaTest, Press) {
	"use strict";

	var Journey = {
		run: function () {
			QUnit.module("First journey");
			// in QUnit start page, before all OPA tests
			Opa5.extendConfig({
				autoWait: true
			});

			opaTest("Open Excel Upload Dialog", function (Given, When, Then) {
				Given.iStartMyApp();
				Then.waitFor({
					id: "ui.v4.ordersv4fe::OrdersList--fe::FilterBar::Orders-btnSearch",
					controlType: "sap.m.Button",
					visible: true,
					actions: new Press(),
					success: function (oControl) {
						console.log("Yay!");
					},
					errorMessage: "Can not select 'sap.m.Button'"
				});
				Then.waitFor({
					id: "ui.v4.ordersv4fe::OrdersList--fe::CustomAction::excelUploadListReport",
					controlType: "sap.m.Button",
					visible: true,
					actions: new Press(),
					success: function (oControl) {
						console.log("Yay!");
					},
					errorMessage: "Can not select 'sap.m.Button'"
				});
			});

			opaTest("Test Util", function (Given, When, Then) {
				Then.waitFor({
					controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
					success: function () {
						const util = window[0].cc.excelUpload.v0_19_0.Util;
						var input = "5,6";
						var expectedOutput = 5.6;
						// Call 'changeDecimalSeperator' method and check its output
						var output = util.changeDecimalSeperator(input);
						if (output !== expectedOutput) {
							Opa5.assert.ok(false, "Incorrect decimal seperator");
						} else {
							Opa5.assert.ok(true, "Correct decimal seperator");
						}
					},
					errorMessage: "Incorrect decimal seperator"
				});
			});

			opaTest("Teardown", function (Given, When, Then) {
				// Cleanup
				Given.iTearDownMyApp();
			});
		}
	};

	return Journey;
});
