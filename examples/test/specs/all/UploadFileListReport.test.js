const FEV2ND = require("../Objects/FEV2ND");
const Base = require("./../Objects/Base");
const FEV2 = require("./../Objects/FEV2");
const FEV4 = require("./../Objects/FEV4");
const { optionsLong, optionsShort } = require("./../Objects/types");

let FE = undefined;
let BaseClass = undefined;
let scenario = undefined;

describe("Upload File List Report", () => {
	before(async () => {
		BaseClass = new Base();
		scenario = browser.config.scenario;
		if (scenario.startsWith("ordersv2")) {
			FE = new FEV2();
		}
		if (scenario.startsWith("ordersv4")) {
			FE = new FEV4();
		}
		if (scenario.startsWith("ordersv2fenondraft")) {
			FE = new FEV2ND();
		}
	});
	it("should trigger search on ListReport page", async () => {
		await browser.waitUntil(
			async () => {
				return (await BaseClass.isVisibleById(FE.listReportGoButton)) || (await BaseClass.isVisibleById(FE.listReportDynamicPageTitle));
			},
			5000,
			"GoButton and DynamicPageTitle not visible"
		);

		try {
			await BaseClass.pressById(FE.listReportGoButton);
		} catch (error) {
			await BaseClass.pressById(FE.listReportDynamicPageTitle);
			await browser.pause(500);
			await BaseClass.pressById(FE.listReportGoButton);
		}
	});

	it("Open ExcelUpload Dialog", async () => {
		await BaseClass.pressById(FE.listReportExceluploadButton);
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
		const fileName = FE.listReportUploadFilename;
		const remoteFilePath = await browser.uploadFile(fileName);
		const $uploader = await uploader.getWebElement();
		const $fileInput = await $uploader.$("input[type=file]");
		await $fileInput.setValue(remoteFilePath);
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
		await browser.pause(500);
	});

	it("entry created and activated", async () => {
		const object = await FE.getTableObject(FE.listReportTable, FE.checkFileuploadListreportAttribute, FE.checkFileuploadListreportValue);
		if (scenario.startsWith("ordersv2fenondraft")) {
			expect(object.OrderNo).toBe("4");
		} else {
			expect(object.IsActiveEntity).toBeTruthy();
		}
	});
}, 30000); // Add a 30-second timeout for the test suite.
