const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const Base = require("./../Objects/Base");
const { wdi5 } = require("wdio-ui5-service");

// Test Constants
const TEST_CONSTANTS = {
	EXPECTED_FILE_NAME: "Orders12.xlsx",
	DOWNLOAD_TIMEOUT: 20000,
	EXPECTED_ORDER_NUMBER: "2",
	EXPECTED_FIELDS: {
		ID: "ID[ID]",
		ORDER_NUMBER: "Order Number[OrderNo]"
	}
};

describe("Download Spreadsheet List Report", () => {
	let downloadDir;
	let BaseClass;
	let scenario;

	before(async () => {
		BaseClass = new Base();
		scenario = global.scenario;
		downloadDir = path.resolve(__dirname, "../../downloads");
		// Ensure download directory exists
		if (!fs.existsSync(downloadDir)) {
			fs.mkdirSync(downloadDir, { recursive: true });
		}
	});

	it("should trigger download button", async () => {
		// Trigger the download
		const object = await browser.asControl({
			forceSelect: true,
			selector: {
				id: new RegExp(".*downloadButton$")
			}
		});
		await object.press();
	});

	it("should trigger download code", async () => {
		// Trigger the download
		await BaseClass.pressById("container-ordersv4freestyle---MainView--downloadButtonCode");
	});

	it("Download spreadsheet and verify content", async () => {
		const expectedFileName = TEST_CONSTANTS.EXPECTED_FILE_NAME;

		try {
			await browser.waitUntil(
				async () => {
					try {
						const files = await fs.promises.readdir(downloadDir);
						return files.includes(expectedFileName);
					} catch (error) {
						console.warn(`Error reading directory: ${error.message}`);
						return false;
					}
				},
				{
					timeout: TEST_CONSTANTS.DOWNLOAD_TIMEOUT,
					timeoutMsg: `Expected ${expectedFileName} to be downloaded within ${TEST_CONSTANTS.DOWNLOAD_TIMEOUT}ms`,
					interval: 500 // Check every 500ms
				}
			);
		} catch (error) {
			throw new Error(`Download failed: ${error.message}`);
		}

		const filePath = path.join(downloadDir, TEST_CONSTANTS.EXPECTED_FILE_NAME);
		expect(fs.existsSync(filePath)).toBeTruthy();

		const workbook = XLSX.readFile(filePath);
		expect(workbook.SheetNames.length).toBeGreaterThan(0);

		const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = XLSX.utils.sheet_to_json(firstSheet);
		expect(data.length).toBeGreaterThan(0);

		if (data[0]) {
			expect(data[0][TEST_CONSTANTS.EXPECTED_FIELDS.ID]).toBeDefined();
			expect(data[0][TEST_CONSTANTS.EXPECTED_FIELDS.ORDER_NUMBER]).toBe(TEST_CONSTANTS.EXPECTED_ORDER_NUMBER);
		}
	});

	it("Download spreadsheet and verify multiple sheets and OrderItems content", async () => {
		const expectedFileName = "Orders123.xlsx";

		// Wait until the specific file is downloaded
		await browser.waitUntil(
			() => {
				const files = fs.readdirSync(downloadDir);
				return files.includes(expectedFileName);
			},
			{
				timeout: 20000,
				timeoutMsg: `Expected ${expectedFileName} to be downloaded within 20s`
			}
		);

		const filePath = path.join(downloadDir, expectedFileName);
		expect(fs.existsSync(filePath)).toBeTruthy();

		const workbook = XLSX.readFile(filePath);
		expect(workbook.SheetNames.length).toBe(4);
		expect(workbook.SheetNames).toContain("OrderItems");

		const orderItemsSheet = workbook.Sheets["OrderItems"];
		const orderItemsData = XLSX.utils.sheet_to_json(orderItemsSheet);
		expect(orderItemsData.length).toBeGreaterThan(0);

		const orderItem = orderItemsData[0];
		expect(orderItem["ID[ID]"]).toBeDefined();
		expect(orderItem["IsActiveEntity[IsActiveEntity]"]).toBeDefined();
		expect(orderItem["Quantity[quantity]"]).toBeDefined();
		expect(orderItem["order_ID[order_ID]"]).toBeDefined();
	});

	after(async () => {
		// Clean up - only delete test files
		const testFiles = ['Orders12.xlsx', 'Orders123.xlsx'];
		testFiles.forEach(file => {
			const filePath = path.join(downloadDir, file);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		});
	});
});
