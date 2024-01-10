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
let items = undefined;

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
			skipSave = false;
		}
	});

	it("go to object page", async () => {
		await BaseClass.dummyWait(1000);
		const hash = `#/${FE.entitySet}(${FE.entityObjectPageComma})`;
		await browser.goTo({ sHash: hash });
		// force wait to stabelize tests
		await BaseClass.dummyWait(1000);
	});

	it("go to edit mode", async () => {
		await BaseClass.pressById(FE.objectPageEditButton);
		await BaseClass.dummyWait(500);
		await BaseClass.pressById(FE.objectPageEditButton);
		await BaseClass.dummyWait(500);
		await browser.refresh();
		await ui5Service.injectUI5();
		await BaseClass.pressById(FE.objectPageEditButton);
		await BaseClass.dummyWait(500);
	});

	it("Open Spreadsheet Upload Dialog", async () => {
		await BaseClass.dummyWait(1000);
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
		spreadsheetUploadDialog.setDecimalSeparator(",");
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
		const fileName = "test/testFiles/TwoRowsNoErrorsNumberFormatsDecimalComma.xlsx"; // relative to wdio.conf.(j|t)s
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
		await BaseClass.dummyWait(1000);
		await BaseClass.pressById(FE.objectPageSaveButton);
		await BaseClass.dummyWait(1000);
	});

	it("get items", async () => {
		// Replace with your specific API endpoint and necessary parameters
		const apiEndpoint = `http://localhost:4004/odata/v4/Orders/${FE.entitySet}(${FE.entityObjectPageComma})/Items`;
		try {
			const response = await fetch(apiEndpoint);

			// Check if the response status is 200 (OK)
			if (response.ok) {
				const data = await response.json();
				items = data.value;

				// Perform any additional validations or operations with 'item'

				// Expectation for the test
				expect(response.status).toBe(200);
			} else {
				// Log error details if the response status is not OK
				console.error("Error fetching data:", response.status, response.statusText);
				throw new Error(`Fetch failed with status: ${response.status} ${response.statusText}`);
			}
		} catch (error) {
			// Handle any errors that occur during the fetch operation
			console.error("Error during fetch operation:", error.message);
			throw error;
		}
	});

	it("entry created and activated", async () => {
		const pricesExpect = [1000, 1001];
		const prices = [];
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			prices.push(element.price);
		}

		// Sort both arrays
		const sortedPricesExpect = pricesExpect.sort();
		const sortedPrices = prices.sort();

		// Compare the sorted arrays
		expect(sortedPricesExpect).toEqual(sortedPrices);
	});
});
