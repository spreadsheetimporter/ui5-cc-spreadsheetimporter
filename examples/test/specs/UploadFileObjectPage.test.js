const Base = require("./Objects/Base");
const FEV2 = require("./Objects/FEV2");
const FEV4 = require("./Objects/FEV4");
const { optionsLong, optionsShort } = require("./Objects/types");

let FE = undefined;
let BaseClass = undefined;

describe("Upload File Object Page", () => {
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
			await BaseClass.pressById(FE.listReportGoButton);
		} catch (error) {
			await BaseClass.pressById(FE.listReportDynamicPageTitle);
			await BaseClass.dummyWait(500);
			await BaseClass.pressById(FE.listReportGoButton);
		}
	});

	it("go to object page", async () => {
		const hash = await FE.getRoutingHash(FE.listReportTable, FE.navToObjectPageAttribute, FE.navToObjectPageValue);
		await browser.goTo({ sHash: hash });
		// force wait to stabelize tests
		await BaseClass.dummyWait(1000);
	});

	it("go to edit mode", async () => {
		await BaseClass.pressById(FE.objectPageEditButton);
	});

	it("Open ExcelUpload Dialog", async () => {
		await BaseClass.pressById(FE.objectPageExceluploadButton);
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
		await BaseClass.pressById(FE.objectPageSaveButton);
	});

	it("go to Sub Detail Page", async () => {
		const hash = await FE.getRoutingHash(FE.objectPageOrderItems, FE.navToSubObjectPageAttribute, FE.navToSubObjectPageValue, true);
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
		const returnObject = await FE.getDateFields("validFrom", optionsLong);
		expect(returnObject.valueText).toBe(returnObject.formattedDate);
	});

	it("check Field: timestamp", async () => {
		const returnObject = await FE.getDateFields("timestamp", optionsLong);
		expect(returnObject.valueText).toBe(returnObject.formattedDate);
	});

	it("check Field: date", async () => {
		const returnObject = await FE.getDateFields("date", optionsShort);
		expect(returnObject.valueText).toBe(returnObject.formattedDate);
	});

	it("check Field: time", async () => {
		const value = await FE.getFieldValue("time");
		expect(value).toBe("4:00:00 PM");
	});
});
