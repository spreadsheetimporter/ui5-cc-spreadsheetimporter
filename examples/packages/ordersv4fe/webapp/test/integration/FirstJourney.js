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

		opaTest("Open Excel Upload Dialog", function (Given, When, Then) {
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
				id: "ui.v4.ordersv4fe::OrdersList--fe::CustomAction::excelUploadListReport",
				controlType: "sap.m.Button",
				visible: true,
				actions: new Press(),
				success: function (oControl) {
					Opa5.assert.ok(true, "Excel Upload Button pressed");
				},
				errorMessage: "Can not select 'sap.m.Button'"
			});
		});

		opaTest("Test Util normalizeNumberString comma", function (Given, When, Then) {
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function (dialog) {
					dialog[0].getComponent().setDecimalSeparator(",")
					const util = window[0].cc.excelUpload.v0_19_0.Util;
					Opa5.getContext().util = util;
					Opa5.getContext().component = dialog[0].getComponent();
					var input = "5,6";
					var expectedOutput = 5.6;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "1.234,56";
					var expectedOutput = 1234.56;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "1.234";
					var expectedOutput = 1234;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "1234,56";
					var expectedOutput = 1234.56;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "1.234.567,89";
					var expectedOutput = 1234567.89
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "-1234,56";
					var expectedOutput = -1234.56;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
		});

		opaTest("Test Util normalizeNumberString point", function (Given, When, Then) {
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function (dialog) {
					dialog[0].getComponent().setDecimalSeparator(".")
					const util = window[0].cc.excelUpload.v0_19_0.Util;
					Opa5.getContext().util = util;
					var input = "5.6";
					var expectedOutput = 5.6;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "1,234.56";
					var expectedOutput = 1234.56;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "1,234";
					var expectedOutput = 1234;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "1234.56";
					var expectedOutput = 1234.56;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "1,234,567.89";
					var expectedOutput = 1234567.89
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
			Then.waitFor({
				controlType: "cc.excelUpload.v0_19_0.ExcelDialog",
				success: function () {
					const util = Opa5.getContext().util
					var input = "-1234.56";
					var expectedOutput = -1234.56;
					// Call 'normalizeNumberString' method and check its output
					var output = util.normalizeNumberString(input,Opa5.getContext().component);
					if (parseFloat(output) !== expectedOutput) {
						Opa5.assert.ok(false, "Incorrect decimal seperator");
					} else {
						Opa5.assert.ok(true, "Correct decimal seperator");
					}
				},
				errorMessage: "Incorrect decimal seperator"
			});
		});
		QUnit.start();
	}
);
