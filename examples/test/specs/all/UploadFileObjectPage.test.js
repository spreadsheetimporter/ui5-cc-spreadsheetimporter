const FEV2ND = require("../Objects/FEV2ND");
const Base = require("./../Objects/Base");
const FEV2 = require("./../Objects/FEV2");
const FEV4 = require("./../Objects/FEV4");
const { optionsLong, optionsShort } = require("./../Objects/types");

let FE = undefined;
let BaseClass = undefined;
let skipSave = false;
let item = undefined;

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
		await browser.goTo({ sHash: "#/Orders(ID=64e718c9-ff99-47f1-8ca3-950c850777d4,IsActiveEntity=true)" });
		// force wait to stabelize tests
		await BaseClass.dummyWait(1000);
	});

	it("go to edit mode", async () => {
		await BaseClass.pressById(FE.objectPageEditButton);
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
		if (!skipSave) {
			await BaseClass.pressById(FE.objectPageSaveButton);
		}
	});

	it("get items", async () => {
		// Replace with your specific API endpoint and necessary parameters
		const apiEndpoint =
			"http://localhost:4004/odata/v4/Orders/Orders(ID=64e718c9-ff99-47f1-8ca3-950c850777d4,IsActiveEntity=true)/Items?$count=true&$select=HasActiveEntity,ID,IsActiveEntity,date,price,product_ID,quantity,time,timestamp,title,validFrom&$skip=0&$top=10";
		try {
			const response = await fetch(apiEndpoint);

			// Check if the response status is 200 (OK)
			if (response.ok) {
				const data = await response.json();
				item = data.value.find((item) => item.product_ID === "254");

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

	it("check Field: Quantity", async () => {
		if (item === undefined) throw new Error("item is undefined");
		const value = item.quantity;
		expect(value).toBe(3);
	});

	it("check Field: Product", async () => {
		const value = item.title;
		expect(value).toBe("Product Test 2");
	});

	it("check Field: UnitPrice", async () => {
		const value = item.price;
		expect(value).toBe(13.7);
	});

	it("check Field: validFrom", async () => {
		const value = item.validFrom;
		expect(value).toBe("2024-11-25T00:00:00Z");
	});

	it("check Field: timestamp", async () => {
		const value = item.timestamp;
		expect(value).toBe("2024-11-24T00:00:00.000Z");
	});

	it("check Field: date", async () => {
		const value = item.date;
		expect(value).toBe("2024-11-23");
	});

	it("check Field: time", async () => {
		const value = item.time;
		expect(value).toBe("16:00");
	});
});
