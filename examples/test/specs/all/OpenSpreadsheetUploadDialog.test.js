const FEV2ND = require("../Objects/FEV2ND");
const Base = require("../Objects/Base");
const FEV2 = require("../Objects/FEV2");
const FEV4 = require("../Objects/FEV4");
const { optionsLong, optionsShort } = require("../Objects/types");

let FE = undefined;
let BaseClass = undefined;

describe("Upload File List Report", () => {
	before(async () => {
		BaseClass = new Base();
		const scenario = global.scenario;
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
		try {
			await BaseClass.pressById(FE.listReportGoButton);
		} catch (error) {
			await BaseClass.pressById(FE.listReportDynamicPageTitle);
			await BaseClass.dummyWait(1500);
			await BaseClass.pressById(FE.listReportGoButton);
		}
	});

	it("Open Spreadsheet Upload Dialog", async () => {
		await BaseClass.pressById(FE.listReportSpreadsheetuploadButton);
	});

	it("Close SpreadsheetUpload Dialog", async () => {
		try {
			browser.execute(function () {
				const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
				if (blockLayerPopup) {
					blockLayerPopup.remove();
				}
			});
		} catch (error) {
			console.log("sap-ui-blocklayer-popup removed");
		}

		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: "Cancel"
					}
				}
			})
			.press();
	});

	it("Open Spreadsheet Upload Dialog", async () => {
		await BaseClass.pressById(FE.listReportSpreadsheetuploadButton);
		const spreadsheetUploadDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					contentWidth: "40vw"
				}
			}
		});
		const isDialogOpen = await spreadsheetUploadDialog.isOpen();
		expect(isDialogOpen).toBeTruthy();
	});
});
