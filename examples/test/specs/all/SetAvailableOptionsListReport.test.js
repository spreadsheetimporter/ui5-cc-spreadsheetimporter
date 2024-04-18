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
		scenario = global.scenario;
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
			await BaseClass.dummyWait(500);
			await BaseClass.pressById(FE.listReportGoButton);
		}
	});

	it("Open Spreadsheet Upload Dialog", async () => {
		await BaseClass.pressById(FE.listReportSpreadsheetuploadButton);
		const spreadsheetUploadDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					contentWidth: "40vw"
				},
				searchOpenDialogs: true
			}
		});
		this.spreadsheetUploadDialogId = await spreadsheetUploadDialog.getId();
		expect(spreadsheetUploadDialog.isOpen()).toBeTruthy();
		spreadsheetUploadDialog.setAvailableOptions(["strict"]);
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
	});

	it("Open Options Menu", async () => {
		const overflowToolbar = await browser.asControl({
			selector: {
				controlType: "sap.m.OverflowToolbar",
				id: new RegExp("^__toolbar.*", "gm")
			}
		});
		const overflowToolbarId = await overflowToolbar.getId();
		await BaseClass.pressById("__button5");
	});

	it("Check only strict available", async () => {
		await BaseClass.dummyWait(500);
		const grid = await browser.asControl({
			forceSelect: true,
			selector: {
				id: new RegExp("^(__container|__form0--FC-NoHead--Grid).*", "gm"),
				controlType: "sap.ui.layout.Grid"
			}
		});
		const content = await grid.getContent();
		expect(content.length).toBe(2);
	});
});
