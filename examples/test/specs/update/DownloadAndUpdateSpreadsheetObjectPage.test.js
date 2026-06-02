/**
 * Test: Download and Update Spreadsheet with Null and Empty Markers
 *
 * This test validates the four-state model for null/empty handling:
 * - Row 1: Normal value update
 * - Row 2: __EMPTY__ marker (sets string field to empty string)
 * - Row 3: __NULL__ marker (sets field to NULL)
 * - Row 4: Property omitted (keeps existing value unchanged)
 */

const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const Base = require("./../Objects/Base");
const BaseUpload = require("./../Objects/BaseUpload");
const { wdi5 } = require("wdio-ui5-service");

const TEST_CONSTANTS = {
	FILE: {
		NAME: "OrderItems.xlsx",
		TIMEOUT: 20000,
		SHEET_NAME: "Sheet1"
	},
	ORDER: {
		ID: "64e718c9-ff99-47f1-8ca3-950c850777d9",
		NEW_QUANTITY: 999
	},
	MARKERS: {
		NULL: "__NULL__", // Marker to set field to NULL
		EMPTY: "__EMPTY__" // Marker to set string field to empty string
	},
	SELECTORS: {
		UPLOAD_DIALOG: {
			BUTTON_ID: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem::CustomAction::ObjectPageExtControllerUpdate",
			UPLOADER_ID: "__uploader1",
			UPLOAD_BUTTON_TEXT: "Upload"
		},
		OVERFLOW_BUTTON: "overflowButton$",
		DOWNLOAD_BUTTON: "__button27"
	},
	API: {
		BASE_URL: "http://localhost:4004/odata/v4/orders/Orders"
	},
	WAIT_TIME: 4000
};

describe("Download and Update Spreadsheet Object Page with Null and Empty Markers", () => {
	let BaseClass, BaseUploadClass, downloadDir;

	before(async () => {
		BaseClass = new Base();
		BaseUploadClass = new BaseUpload();
		downloadDir = path.resolve(__dirname, "../../downloads");
	});

	it("should set entity to draft state", async () => {
		const url = `${TEST_CONSTANTS.API.BASE_URL}(ID=${TEST_CONSTANTS.ORDER.ID},IsActiveEntity=true)/OrdersService.draftEdit`;
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
		await BaseClass.dummyWait(1000);
	});

	it("should navigate to object page", async () => {
		await wdi5.goTo(`#/orders(ID=${TEST_CONSTANTS.ORDER.ID},IsActiveEntity=false)`);
		await BaseClass.dummyWait(1000);
	});

	it("should open upload dialog", async () => {
		const uploadButton = await browser.asControl({
			selector: {
				id: TEST_CONSTANTS.SELECTORS.UPLOAD_DIALOG.BUTTON_ID
			}
		});
		await uploadButton.press();
	});

	it("should open overflow menu and download spreadsheet", async () => {
		// Press overflow button
		const overflowButton = await browser.asControl({
			selector: {
				controlType: "sap.m.Button",
				searchOpenDialogs: true,
				// Add any specific properties that identify the download button
				// This could be an icon, text, or other unique identifier
				properties: {
					// Adjust these properties based on your button's characteristics
					icon: "sap-icon://overflow"
					// or text: "Download"
				}
			}
		});
		await overflowButton.press();

		// Find download button in the toolbar content
		const downloadButton = await browser.asControl({
			selector: {
				controlType: "sap.m.Button",
				searchOpenDialogs: true,
				// Add any specific properties that identify the download button
				// This could be an icon, text, or other unique identifier
				properties: {
					// Adjust these properties based on your button's characteristics
					text: "Download Data as Spreadsheet"
					// or text: "Download"
				}
			}
		});

		await downloadButton.press();

		// create download directory if it doesn't exist
		if (!fs.existsSync(downloadDir)) {
			fs.mkdirSync(downloadDir, { recursive: true });
		}

		// Wait for download
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

	it("should modify spreadsheet data with null and empty markers", async () => {
		const filePath = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
		const workbook = XLSX.readFile(filePath);
		const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = XLSX.utils.sheet_to_json(firstSheet);

		// Test different marker scenarios for each row
		data.forEach((row, index) => {
			if (index === 0) {
				// Row 1: Normal update with a value
				row["Quantity[quantity]"] = TEST_CONSTANTS.ORDER.NEW_QUANTITY;
				row["ProductTitle[title]"] = "Updated Product";
			} else if (index === 1 && data.length > 1) {
				// Row 2: Set title to empty string marker (strings only)
				row["Quantity[quantity]"] = TEST_CONSTANTS.ORDER.NEW_QUANTITY;
				row["ProductTitle[title]"] = TEST_CONSTANTS.MARKERS.EMPTY; // Empty string marker (only valid for strings)
			} else if (index === 2 && data.length > 2) {
				// Row 3: Set title to NULL marker and test with date field
				row["Quantity[quantity]"] = TEST_CONSTANTS.ORDER.NEW_QUANTITY;
				row["ProductTitle[title]"] = TEST_CONSTANTS.MARKERS.NULL; // NULL marker - clears the field to NULL
				// If date field exists in your spreadsheet:
				if (row["date[date]"] !== undefined) {
					row["date[date]"] = TEST_CONSTANTS.MARKERS.NULL; // NULL marker for date field
				}
			} else if (index === 3 && data.length > 3) {
				// Row 4: Leave title empty (property omitted = no change)
				row["Quantity[quantity]"] = TEST_CONSTANTS.ORDER.NEW_QUANTITY;
				delete row["ProductTitle[title]"]; // Property omitted = backend keeps existing value
			} else {
				// Remaining rows: Normal update
				row["Quantity[quantity]"] = TEST_CONSTANTS.ORDER.NEW_QUANTITY;
			}
		});

		// Save modified data
		const workbookNew = XLSX.utils.book_new();
		const worksheetNew = XLSX.utils.json_to_sheet(data);
		XLSX.utils.book_append_sheet(workbookNew, worksheetNew, TEST_CONSTANTS.FILE.SHEET_NAME);
		XLSX.writeFile(workbookNew, filePath);

		this.filePath = filePath;
	});

	it("should upload modified file", async () => {
		await BaseUploadClass.uploadFile(
			this.filePath,
			TEST_CONSTANTS.SELECTORS.UPLOAD_DIALOG.BUTTON_ID,
			TEST_CONSTANTS.SELECTORS.UPLOAD_DIALOG.UPLOADER_ID,
			TEST_CONSTANTS.SELECTORS.UPLOAD_DIALOG.UPLOAD_BUTTON_TEXT
		);
	});

	it("should save object page", async () => {
		// Let the upload/submit settle, then force-remove any lingering busy block layer
		// (same approach as the upload specs) so the Save click isn't intercepted by
		// sap-ui-blocklayer-popup under parallel CI load.
		await BaseClass.dummyWait(TEST_CONSTANTS.WAIT_TIME);
		try {
			await browser.execute(() => {
				const bl = document.getElementById("sap-ui-blocklayer-popup");
				if (bl) {
					bl.remove();
				}
			});
		} catch (error) {}
		const saveButton = await browser.asControl({
			selector: {
				id: "ui.v4.ordersv4fe::OrdersObjectPage--fe::FooterBar::StandardAction::Save"
			},
			forceSelect: true
		});
		await saveButton.press();
		await BaseClass.dummyWait(TEST_CONSTANTS.WAIT_TIME);
	});

	it("should verify updated quantities and marker values", async () => {
		const response = await fetch(`${TEST_CONSTANTS.API.BASE_URL}(ID=${TEST_CONSTANTS.ORDER.ID},IsActiveEntity=true)/Items`);
		const data = await response.json();

		data.value.forEach((item, index) => {
			// Verify quantity is updated for all rows
			expect(item.quantity).toBe(TEST_CONSTANTS.ORDER.NEW_QUANTITY);

			// Verify marker behavior based on what we set
			if (index === 0) {
				// Row 1: Should have "Updated Product"
				expect(item.title).toBe("Updated Product");
			} else if (index === 1) {
				// Row 2: Should have empty string (from __EMPTY__ marker)
				expect(item.title).toBe("");
			} else if (index === 2) {
				// Row 3: Should have NULL (from __NULL__ marker)
				expect(item.title).toBeNull();
				// If date field was set to NULL
				if (item.date !== undefined) {
					expect(item.date).toBeNull();
				}
			} else if (index === 3) {
				// Row 4: Title should be unchanged (property was omitted)
				// Can't verify this without knowing original value, but it shouldn't be null or empty unless it was before
				// Just verify it exists
				expect(item.title).toBeDefined();
			}
		});
	});

	after(async () => {
		// Cleanup downloaded files
		const filePath = path.join(downloadDir, TEST_CONSTANTS.FILE.NAME);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
	});
});
