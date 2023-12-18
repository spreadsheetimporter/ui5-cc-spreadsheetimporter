/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require(
	["sap/ui/test/Opa5", "sap/ui/test/opaQunit", "sap/ui/test/actions/Press", "sap/ui/test/matchers/Properties", "sap/ui/test/matchers/BindingPath"],
	function (Opa5, opaTest, Press, Properties, BindingPath) {
		"use strict";
		QUnit.module("First journey");
		// in QUnit start page, before all OPA tests
		Opa5.extendConfig({
			autoWait: true
		});

		opaTest("Open Spreadsheet Upload Dialog", function (Given, When, Then) {
			const url = sap.ui.require.toUrl("ui/v4/orders") + "/index.html";
			Given.iStartMyAppInAFrame(url);
			When.waitFor({
				id: "ui.v4.ordersv4fe::OrdersList--fe::FilterBar::Orders-btnSearch",
				controlType: "sap.m.Button",
				visible: true,
				actions: new Press(),
				success: function (oControl) {
					Opa5.assert.ok(true, "Go Button pressed");
				},
				errorMessage: "Can not select 'sap.m.Button'"
			});
			Then.waitFor({
				id: "ui.v4.ordersv4fe::OrdersList--fe::table::Orders::LineItem::CustomAction::test",
				controlType: "sap.m.Button",
				visible: true,
				actions: new Press(),
				success: function (oControl) {
					Opa5.assert.ok(true, "Spreadsheet Upload Button pressed");
				},
				errorMessage: "Can not select 'sap.m.Button'"
			});
			Then.waitFor({
				controlType: "cc.spreadsheetimporter.v0_29_1.SpreadsheetDialog",
				check: function (dialog) {
					return dialog[0].isOpen();
				},
				success: function (dialog) {
					const util = Opa5.getWindow().cc.spreadsheetimporter.v0_29_1.Util;
					console.log("Util", util);
					Opa5.getContext().util = util;
					Opa5.getContext().component = dialog[0].getComponent();
					Opa5.assert.ok(true, "Context set");
				},
				errorMessage: "Incorrect decimal seperator"
			});
		});

		opaTest("Test Util normalizeNumberString comma", function (Given, When, Then) {
			testNormalizeNumberString(Then, ",", "5,6", 5.6);
			testNormalizeNumberString(Then, ",", "1.234,56", 1234.56);
			testNormalizeNumberString(Then, ",", "1.234", 1234);
			testNormalizeNumberString(Then, ",", "1234,56", 1234.56);
			testNormalizeNumberString(Then, ",", "1.234.567,89", 1234567.89);
			testNormalizeNumberString(Then, ",", "-1234,56", -1234.56);
		});

		opaTest("Test Util normalizeNumberString point", function (Given, When, Then) {
			testNormalizeNumberString(Then, ".", "5.6", 5.6);
			testNormalizeNumberString(Then, ".", "1,234.56", 1234.56);
			testNormalizeNumberString(Then, ".", "1,234", 1234);
			testNormalizeNumberString(Then, ".", "1234.56", 1234.56);
			testNormalizeNumberString(Then, ".", "1,234,567.89", 1234567.89);
			testNormalizeNumberString(Then, ".", "-1234.56", -1234.56);
		});

		function testNormalizeNumberString(Then, decimalSeparator, input, expectedOutput) {
			Then.waitFor({
				controlType: "cc.spreadsheetimporter.v0_29_1.SpreadsheetDialog",
				success: function (dialog) {
					Opa5.getContext().component.setDecimalSeparator(decimalSeparator);
					// Call 'normalizeNumberString' method and check its output
					var output = Opa5.getContext().util.normalizeNumberString(input, Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal separator");
					} else {
						Opa5.assert.ok(true, "Correct decimal separator");
					}
				},
				errorMessage: "Incorrect decimal separator"
			});
		}

		QUnit.start();
	}
);
