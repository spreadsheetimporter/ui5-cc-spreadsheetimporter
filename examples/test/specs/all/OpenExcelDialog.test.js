const FEV2ND = require("../Objects/FEV2ND");
const Base = require("./../Objects/Base");
const FEV2 = require("./../Objects/FEV2");
const FEV4 = require("./../Objects/FEV4");
const { optionsLong, optionsShort } = require("./../Objects/types");

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
		if (scenario.startsWith("ordersv2fenondraft")) {
			FE = new FEV2ND;
		}
	});
	it("should trigger search on ListReport page", async () => {
		try {
			await BaseClass.pressById(FE.listReportGoButton);
		} catch (error) {
			await BaseClass.pressById(FE.listReportDynamicPageTitle);
			await BaseClass.dummyWait(1500);
			await BaseClass.pressById(FE.listReportGoButton);
		}
	});

	it("Open ExcelUpload Dialog", async () => {
		await BaseClass.pressById(FE.listReportExceluploadButton);
	});

	it("Close ExcelUpload Dialog", async () => {
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: "Close"
					}
				}
			})
			.press();
	});

	it("Open ExcelUpload Dialog", async () => {
		await BaseClass.pressById(FE.listReportExceluploadButton);
		const excelUploadDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					title: "Excel Upload"
				}
			}
		});
		const isDialogOpen = await excelUploadDialog.isOpen()
		expect(isDialogOpen).toBeTruthy();
	});
});
