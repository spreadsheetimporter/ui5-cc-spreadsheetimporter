const { default: _ui5Service } = require("wdio-ui5-service");
const ui5Service = new _ui5Service();
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
		// TODO: dont know why this is not working
		// const spreadsheetUploadDialog = await browser.asControl({
		// 	selector: {
		// 		controlType: "sap.m.Dialog",
		// 		properties: {
		// 			contentWidth: "40vw"
		// 		},
		// 		searchOpenDialogs: true
		// 	}
		// });
		// expect(spreadsheetUploadDialog.isOpen()).toBeTruthy();
		// try {
		// 	browser.execute(function () {
		// 		const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
		// 		if (blockLayerPopup) {
		// 			blockLayerPopup.remove();
		// 		}
		// 	});
		// } catch (error) {
		// 	console.log("sap-ui-blocklayer-popup removed");
		// }
	});

	it("Upload file", async () => {
		const uploader = await browser.asControl({
			forceSelect: true,

			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader"
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
		let object = await FE.getTableObject(FE.listReportTable, FE.checkFileuploadListreportAttribute, FE.checkFileuploadListreportValue);
		if (object) {
			if (scenario.startsWith("ordersv2fenondraft")) {
				expect(object.OrderNo).toBe("4");
			} else {
				expect(object.IsActiveEntity).toBeTruthy();
			}
		} else {
			await browser.refresh();
			await ui5Service.injectUI5();
			try {
				await BaseClass.pressById(FE.listReportGoButton);
			} catch (error) {
				await BaseClass.pressById(FE.listReportDynamicPageTitle);
				await BaseClass.dummyWait(500);
				await BaseClass.pressById(FE.listReportGoButton);
			}
			object = await FE.getTableObject(FE.listReportTable, FE.checkFileuploadListreportAttribute, FE.checkFileuploadListreportValue);
			if (object) {
				if (scenario.startsWith("ordersv2fenondraft")) {
					expect(object.OrderNo).toBe("4");
				} else {
					expect(object.IsActiveEntity).toBeTruthy();
				}
			} else {
				throw new Error("Object not found");
			}

		}
	});
});
