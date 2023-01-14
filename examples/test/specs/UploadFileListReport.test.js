const Base = require("./Objects/Base");
const FEV2 = require("./Objects/FEV2");
const FEV4 = require("./Objects/FEV4");
const { optionsLong, optionsShort } = require("./Objects/types");

let FE = undefined;
let BaseClass = undefined;

describe("Upload File List Report", () => {
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
		const fileName = FE.listReportUploadFilename; // relative to wdio.conf.(j|t)s
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
		await BaseClass.dummyWait(500);
	});

	it("entry created and activated", async () => {
		const object = await FE.getTableObject(FE.listReportTable, FE.checkFileuploadListreportAttribute, FE.checkFileuploadListreportValue);
		expect(hash).toBeTruthy(object.IsActiveEntity)
	});
});
