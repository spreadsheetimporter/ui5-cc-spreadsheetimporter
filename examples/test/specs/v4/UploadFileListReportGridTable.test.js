const Base = require("./../Objects/Base");
const FEV2 = require("./../Objects/FEV2");
const FEV4 = require("./../Objects/FEV4");

let FE = undefined;
let BaseClass = undefined;

describe("Upload File List Report Grid Table", () => {
	before(async () => {
		BaseClass = new Base();
		const scenario = browser.config.scenario;
		if (scenario.startsWith("ordersv2")) {
			FE = new FEV2();
		}
		if (scenario.startsWith("ordersv4")) {
			FE = new FEV4();
		}
		await browser.goTo({ sHash: "#/Orders" });
		await BaseClass.dummyWait(1000);
	});
	it("should trigger search on ListReport page", async () => {
		try {
			await BaseClass.pressById(FE.gridTablePageGoButton);
		} catch (error) {
			await BaseClass.pressById(FE.gridTablePageDynamicPageTitle);
			await BaseClass.dummyWait(500);
			await BaseClass.pressById(FE.gridTablePageGoButton);
		}
	});

	it("Open Spreadsheet Upload Dialog", async () => {
		await BaseClass.pressById(FE.gridTablePageSpreadsheetuploadButton);
		const spreadsheetUploadDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					contentWidth: "40vw"
				},
				searchOpenDialogs: true
			}
		});
		expect(spreadsheetUploadDialog.isOpen()).toBeTruthy();
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
		const object = await FE.getTableObject(FE.listReportGridTable, FE.checkFileuploadListreportAttribute, FE.checkFileuploadListreportValue);
		expect(object.IsActiveEntity).toBeTruthy();
	});
});
