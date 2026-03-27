/**
 * Test: V2 FE Deep Download and Mass Update (Draft scenario)
 *
 * Flow:
 * 1. Put entity into draft state via V4 API (cov2ap translates)
 * 2. Navigate to V2 draft object page
 * 3. Trigger deep download → verify XLSX file created
 * 4. Modify spreadsheet (update quantity)
 * 5. Upload via mass update dialog
 * 6. Save/activate draft
 * 7. Verify updated data via API
 */

const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const Base = require("./../Objects/Base");
const { wdi5 } = require("wdio-ui5-service");

const TEST_CONSTANTS = {
	FILE: {
		NAME: "Orders123.xlsx",
		TIMEOUT: 30000,
		SHEET_NAME: "Sheet1"
	},
	ORDER: {
		ID: "64e718c9-ff99-47f1-8ca3-950c850777d4",
		NEW_QUANTITY: 777
	},
	API: {
		V4_BASE_URL: "http://localhost:4004/odata/v4/orders"
	},
	WAIT_TIME: 5000
};

describe("V2 FE: Download and Update Spreadsheet Object Page", function () {
	let BaseClass, downloadDir, filePath;

	before(async function () {
		BaseClass = new Base();
		downloadDir = path.resolve(__dirname, "../../downloads");
		// Clean up any leftover files
		const fp = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
		if (fs.existsSync(fp)) {
			fs.unlinkSync(fp);
		}
	});

	it("should set entity to draft state via V4 API", async function () {
		// First discard any existing draft
		try {
			const discardUrl = `${TEST_CONSTANTS.API.V4_BASE_URL}/Orders(ID=${TEST_CONSTANTS.ORDER.ID},IsActiveEntity=false)/OrdersService.draftActivate`;
			await fetch(discardUrl, {
				method: "POST",
				headers: {
					Accept: "application/json;odata.metadata=minimal",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({})
			});
		} catch (e) {
			/* ignore if no draft exists */
		}

		const url = `${TEST_CONSTANTS.API.V4_BASE_URL}/Orders(ID=${TEST_CONSTANTS.ORDER.ID},IsActiveEntity=true)/OrdersService.draftEdit`;
		const response = await fetch(url, {
			method: "POST",
			headers: {
				Accept: "application/json;odata.metadata=minimal;IEEE754Compatible=true",
				"Content-Type": "application/json;charset=UTF-8;IEEE754Compatible=true",
				"Accept-Language": "en",
				Prefer: "handling=strict"
			},
			body: JSON.stringify({
				PreserveChanges: true
			})
		});

		expect(response.ok).toBeTruthy();
		await BaseClass.dummyWait(2000);
	});

	it("should navigate to V2 draft object page", async function () {
		await wdi5.goTo(`#/Orders(ID=guid'${TEST_CONSTANTS.ORDER.ID}',IsActiveEntity=false)`);
		await BaseClass.dummyWait(3000);
	});

	it("should trigger deep download", async function () {
		// The "Deep Download" button is in the OP header actions
		// Full ID: ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--deepdownloadButton
		const deepDownloadButton = await browser.asControl({
			selector: {
				id: new RegExp("deepdownloadButton"),
				controlType: "sap.m.Button"
			}
		});
		await deepDownloadButton.press();

		if (!fs.existsSync(downloadDir)) {
			fs.mkdirSync(downloadDir, { recursive: true });
		}

		await browser.waitUntil(
			() => {
				const files = fs.readdirSync(downloadDir);
				return files.includes(TEST_CONSTANTS.FILE.NAME);
			},
			{
				timeout: TEST_CONSTANTS.FILE.TIMEOUT,
				timeoutMsg: `Expected ${TEST_CONSTANTS.FILE.NAME} to be downloaded within ${TEST_CONSTANTS.FILE.TIMEOUT}ms`
			}
		);
	});

	it("should modify spreadsheet data", async function () {
		filePath = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
		const workbook = XLSX.readFile(filePath);
		const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = XLSX.utils.sheet_to_json(firstSheet);

		// Update quantity for all rows
		data.forEach((row) => {
			const key = Object.keys(row).find((k) => k.toLowerCase().includes("quantity"));
			if (key) {
				row[key] = TEST_CONSTANTS.ORDER.NEW_QUANTITY;
			}
		});

		const workbookNew = XLSX.utils.book_new();
		const worksheetNew = XLSX.utils.json_to_sheet(data);
		XLSX.utils.book_append_sheet(workbookNew, worksheetNew, TEST_CONSTANTS.FILE.SHEET_NAME);
		XLSX.writeFile(workbookNew, filePath);
	});

	it("should open mass update dialog and upload modified file", async function () {
		// The "Mass Update" button is in the OP header actions
		// Full ID: ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--massUpdateButton
		const massUpdateButton = await browser.asControl({
			selector: {
				id: new RegExp("massUpdateButton"),
				controlType: "sap.m.Button"
			}
		});
		await massUpdateButton.press();

		// Wait for the spreadsheet upload dialog to appear
		await browser.waitUntil(
			async () => {
				try {
					const dialog = await browser.asControl({
						selector: {
							controlType: "sap.m.Dialog",
							properties: {
								contentWidth: "40vw"
							},
							searchOpenDialogs: true
						},
						forceSelect: true
					});
					return !!dialog?._domId;
				} catch (e) {
					return false;
				}
			},
			{ timeout: 10000, timeoutMsg: "Spreadsheet upload dialog did not appear" }
		);

		// Remove block layer if present (same pattern as BaseUpload)
		try {
			await browser.execute(() => {
				const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
				if (blockLayerPopup) {
					blockLayerPopup.remove();
				}
			});
		} catch (error) {}

		// Make file input visible (UI5 FileUploader hides it)
		await browser.waitUntil(
			async () => {
				try {
					const found = await browser.execute(() => !!document.querySelector("input[type=file]"));
					return found;
				} catch (e) {
					return false;
				}
			},
			{ timeout: 5000, timeoutMsg: "File input not found in dialog" }
		);

		await browser.execute(() => {
			document.querySelector("input[type=file]").style.display = "block";
		});

		// Set file path
		const input = await $("input[type=file]");
		await input.setValue(filePath);
		await BaseClass.dummyWait(1000);

		// Press Upload button in the dialog
		const dialogUpload = await browser.asControl({
			selector: {
				controlType: "sap.m.Button",
				properties: { text: "Upload" },
				searchOpenDialogs: true
			},
			forceSelect: true
		});
		await dialogUpload.press();
		await BaseClass.dummyWait(TEST_CONSTANTS.WAIT_TIME);
	});

	it("should save object page", async function () {
		// Remove block layer if still present from dialog
		try {
			await browser.execute(() => {
				const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
				if (blockLayerPopup) {
					blockLayerPopup.remove();
				}
			});
		} catch (error) {}

		// In V2 SUGE template, the save/activate button
		// Full ID: ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--activate
		const saveButton = await browser.asControl({
			selector: {
				id: new RegExp("activate$"),
				controlType: "sap.m.Button"
			}
		});
		await saveButton.press();
		await BaseClass.dummyWait(TEST_CONSTANTS.WAIT_TIME);
	});

	it("should verify updated quantities via API", async function () {
		const response = await fetch(`${TEST_CONSTANTS.API.V4_BASE_URL}/Orders(ID=${TEST_CONSTANTS.ORDER.ID},IsActiveEntity=true)/Items`);
		const data = await response.json();

		data.value.forEach((item) => {
			expect(item.quantity).toBe(TEST_CONSTANTS.ORDER.NEW_QUANTITY);
		});
	});

	after(async function () {
		// Cleanup downloaded files
		const fp = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
		if (fs.existsSync(fp)) {
			fs.unlinkSync(fp);
		}
	});
});
