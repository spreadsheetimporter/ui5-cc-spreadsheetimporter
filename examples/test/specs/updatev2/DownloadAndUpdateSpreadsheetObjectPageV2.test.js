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
const BaseUpload = require("./../Objects/BaseUpload");
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
	let BaseClass, BaseUploadClass, downloadDir, filePath;

	before(async function () {
		BaseClass = new Base();
		BaseUploadClass = new BaseUpload();
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

		// Lock in the deep export: it must produce Items rows with a quantity column.
		// A regression in the V2 entity-graph/expand resolution would yield an empty/incomplete sheet.
		expect(data.length).toBeGreaterThan(0);
		const quantityKey = Object.keys(data[0]).find((k) => k.toLowerCase().includes("quantity"));
		expect(quantityKey).toBeTruthy();

		// Update quantity for all rows
		data.forEach((row) => {
			if (quantityKey) {
				row[quantityKey] = TEST_CONSTANTS.ORDER.NEW_QUANTITY;
			}
		});

		const workbookNew = XLSX.utils.book_new();
		const worksheetNew = XLSX.utils.json_to_sheet(data);
		XLSX.utils.book_append_sheet(workbookNew, worksheetNew, TEST_CONSTANTS.FILE.SHEET_NAME);
		XLSX.writeFile(workbookNew, filePath);
	});

	it("should open mass update dialog and upload modified file", async function () {
		// Open the "Mass Update" dialog (OP header action). Full ID:
		// ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--massUpdateButton
		const massUpdateButton = await browser.asControl({
			selector: {
				id: new RegExp("massUpdateButton"),
				controlType: "sap.m.Button"
			}
		});
		await massUpdateButton.press();

		// Wait for the importer's upload dialog, then delegate the upload mechanics (block-layer
		// removal, file-input reveal, setValue, Upload press) to the shared BaseUpload helper —
		// the same flow the V4 update spec uses. uploadFile sees the dialog already open and
		// skips re-pressing the button.
		await browser.waitUntil(
			async () => {
				const dialog = await browser.asControl({
					selector: {
						controlType: "sap.m.Dialog",
						properties: { contentWidth: "40vw" },
						searchOpenDialogs: true
					},
					forceSelect: true
				});
				return !!dialog?._domId;
			},
			{ timeout: 10000, timeoutMsg: "Spreadsheet upload dialog did not appear" }
		);

		await BaseUploadClass.uploadFile(filePath, new RegExp("massUpdateButton"), undefined);
		await BaseClass.dummyWait(TEST_CONSTANTS.WAIT_TIME);
	});

	it("should save object page", async function () {
		// Remove a lingering busy overlay so it can't intercept the activate click.
		await BaseClass.removeBlockLayer();

		// V2 SUGE save/activate button. Full ID:
		// ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--activate
		const saveButton = await browser.asControl({
			selector: {
				id: new RegExp("activate$"),
				controlType: "sap.m.Button"
			}
		});
		await saveButton.press();
		await BaseClass.dummyWait(1000);
	});

	it("should verify updated quantities via API", async function () {
		const itemsUrl = `${TEST_CONSTANTS.API.V4_BASE_URL}/Orders(ID=${TEST_CONSTANTS.ORDER.ID},IsActiveEntity=true)/Items`;

		// Poll until draft activation has propagated to the active entity instead of a fixed
		// sleep: more stable under CI load, and faster on a quick machine.
		let data;
		await browser.waitUntil(
			async () => {
				const response = await fetch(itemsUrl);
				data = await response.json();
				return data.value.length > 0 && data.value.every((item) => item.quantity === TEST_CONSTANTS.ORDER.NEW_QUANTITY);
			},
			{ timeout: 15000, interval: 1000, timeoutMsg: "Items quantity did not update to NEW_QUANTITY after activation" }
		);

		data.value.forEach((item) => {
			expect(item.quantity).toBe(TEST_CONSTANTS.ORDER.NEW_QUANTITY);
			// Date/time guard lock-in: a regression would read exported Excel date serials as
			// epoch-milliseconds and corrupt these fields to 1970 on the round-trip.
			if (item.validFrom) {
				expect(new Date(item.validFrom).getUTCFullYear()).toBeGreaterThanOrEqual(2000);
			}
		});
	});

	after(async function () {
		// Discard any leftover draft so re-runs start from a clean active entity (mirrors the
		// setup reset). After a successful run the draft is already activated, so this no-ops.
		try {
			await fetch(`${TEST_CONSTANTS.API.V4_BASE_URL}/Orders(ID=${TEST_CONSTANTS.ORDER.ID},IsActiveEntity=false)/OrdersService.draftActivate`, {
				method: "POST",
				headers: {
					Accept: "application/json;odata.metadata=minimal",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({})
			});
		} catch (e) {
			/* no draft to discard */
		}

		// Cleanup downloaded files
		const fp = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
		if (fs.existsSync(fp)) {
			fs.unlinkSync(fp);
		}
	});
});
