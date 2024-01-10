// only requiring the service for late inject/init
const { default: _ui5Service } = require("wdio-ui5-service");
const ui5Service = new _ui5Service();
const FEV2ND = require("../Objects/FEV2ND");
const Base = require("./../Objects/Base");
const FEV2 = require("./../Objects/FEV2");
const FEV4 = require("./../Objects/FEV4");
const { optionsLong, optionsShort } = require("./../Objects/types");

let FE = undefined;
let BaseClass = undefined;
let skipSave = false;

describe("Upload File Object Page", () => {
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
			skipSave = true;
		}
	});

	it("go to object page", async () => {
		const hash = `#/${FE.entitySet}(${FE.entityObjectPageTestError})`;
		await browser.goTo({ sHash: hash });
		// force wait to stabelize tests
		await BaseClass.dummyWait(1000);
	});

	it("go to edit mode", async () => {
		await BaseClass.pressById(FE.objectPageEditButton);
		await BaseClass.dummyWait(3000);

		// check if edit button is still visible
		const object = await browser.asControl({
			forceSelect: true,
			selector: {
				id: FE.objectPageEditButton
			}
		});
		// if the edit button is still visible refresh the page and try again
		if (object._domId) {
			await browser.refresh();
			await ui5Service.injectUI5();
		}

		// check if edit button is still visible
		const object2 = await browser.asControl({
			forceSelect: true,
			selector: {
				id: FE.objectPageEditButton
			}
		});
		// if the edit button is still visible refresh the page and try again
		if (object2._domId) {
			await BaseClass.pressById(FE.objectPageEditButton);
			await BaseClass.dummyWait(3000);
		}
	});

	it("Open Spreadsheet Upload Dialog", async () => {
		await BaseClass.dummyWait(500);
		await BaseClass.pressById(FE.objectPageSpreadsheetuploadButton);
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
		const fileName = "test/testFiles/TwoRowsErrors.xlsx"; // relative to wdio.conf.(j|t)s
		const remoteFilePath = await browser.uploadFile(fileName); // this also works in CI senarios
		// transition from wdi5 api -> wdio api
		const $uploader = await uploader.getWebElement(); // wdi5
		const $fileInput = await $uploader.$("input[type=file]"); // wdio
		await $fileInput.setValue(remoteFilePath); // wdio
		await BaseClass.dummyWait(200);
		const messageDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					title: "Upload Error"
				},
				searchOpenDialogs: true
			}
		});
		const modelData = await messageDialog.getModel("messages");
		const errorData = await modelData.getData();
		const lengthErrorArray = Object.keys(errorData._baseObject).length;
		expect(lengthErrorArray).toEqual(9);
	});
});
