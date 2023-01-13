const Base = require("../Objects/Base");
const FEV2 = require("../Objects/FEV2");
const FEV4 = require("../Objects/FEV4");
const { optionsLong, optionsShort } = require("../Objects/types");

let FE = undefined;
let BaseClass = undefined;

describe("Open Excel Upload dialog", () => {
	before(async () => {
		BaseClass = new Base();
		const scenario = browser.config.scenario;
		if (scenario.startsWith("ordersv2")) {
			FE = new FEV2();
		}
		if (scenario.startsWith("ordersv4")) {
			FE = new FEV4();
		}
	});
	it("should trigger search on ListReport page", async () => {
		try {
			await BaseClass.pressById("ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders--listReportFilter-btnGo");
		} catch (error) {
			await BaseClass.pressById("ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders--template:::ListReportPage:::DynamicPageTitle");
			await BaseClass.dummyWait(500);
			await BaseClass.pressById("ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders--listReportFilter-btnGo");
		}
	});

	it("go to object page", async () => {
		const hash = await FE.getRoutingHash("ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders--responsiveTable", "OrderNo", "2");
		await browser.goTo({ sHash: hash });
		// force wait to stabelize tests
		await BaseClass.dummyWait(1000);
	});

	it("go to edit mode", async () => {
		await BaseClass.pressById("ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--edit");
	});

	it("Open ExcelUpload Dialog", async () => {
		await BaseClass.pressById("ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--action::excelUploadButton");
		const excelUploadDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					title: "Excel Upload"
				},
				searchOpenDialogs: true
			}
		});
		expect(excelUploadDialog.isOpen()).toBeTruthy();
	});

	it("Upload file", async () => {
		const uploader = await browser.asControl({
			forceSelect: true,

			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader",
				id: "__uploader0"
			}
		});
		const fileName = "test/testFiles/TwoRowsNoErrors.xlsx"; // relative to wdio.conf.(j|t)s
		const remoteFilePath = await browser.uploadFile(fileName); // this also works in CI senarios!
		// transition from wdi5 api -> wdio api
		const $uploader = await uploader.getWebElement(); // wdi5
		const $fileInput = await $uploader.$("input[type=file]"); // wdio
		await $fileInput.setValue(remoteFilePath); // wdio
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: "Upload"
					}
				}
			})
			.press();
	});

	it("execute save", async () => {
		await BaseClass.pressById("ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--activate");
	});

	it("go to Sub Detail Page", async () => {
		const hash = await FE.getRoutingHash(
			"ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--Items::com.sap.vocabularies.UI.v1.LineItem::responsiveTable",
			"product_ID",
			"254"
		);
		await browser.goTo({ sHash: hash });
		// force wait to stabelize tests
		await BaseClass.dummyWait(1000);
	});

	it("check Field: Quantity", async () => {
		const value = await FE.getFieldValue("quantity");
		expect(value).toBe("3");
	});

	it("check Field: Product", async () => {
		const value = await FE.getFieldValue("title");
		expect(value).toBe("Product Test 2");
	});

	it("check Field: UnitPrice", async () => {
		const value = await FE.getFieldValue("price");
		expect(value).toBe("13.7");
	});

	it("check Field: validFrom", async () => {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: "validFrom"
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		const formattedDate = await date.toLocaleString("en-US", optionsLong);
		const valueText = await field.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: timestamp", async () => {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: "timestamp"
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		const formattedDate = await date.toLocaleString("en-US", optionsLong);
		const valueText = await field.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: date", async () => {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: "date"
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		const formattedDate = await date.toLocaleString("en-US", optionsShort);
		const valueText = await field.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: time", async () => {
		const value = await FE.getFieldValue("time");
		expect(value).toBe("4:00:00 PM");
	});
});
