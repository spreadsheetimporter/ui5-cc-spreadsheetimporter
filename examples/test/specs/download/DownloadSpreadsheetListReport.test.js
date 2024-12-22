const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const Base = require("./../Objects/Base");

describe("Download Spreadsheet List Report", () => {
	let downloadDir;

	before(async () => {
		BaseClass = new Base();
		scenario = global.scenario;
		// If you need it globally, you can set it on browser.config, or just reuse the same path logic as in wdio.conf.js.
		downloadDir = path.resolve(__dirname, "../../downloads"); // Adjust the relative path if needed
	});

	it("should trigger download button", async () => {
		// Trigger the download
		await BaseClass.pressById("__component0---downloadButton");
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
		const expectedFileName = "Orders12.xlsx";

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
		expect(workbook.SheetNames.length).toBeGreaterThan(0);

		const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
		const data = XLSX.utils.sheet_to_json(firstSheet);
		expect(data.length).toBeGreaterThan(0);

		if (data[0]) {
			expect(data[0]["ID[ID]"]).toBeDefined();
			expect(data[0]["Order Number[OrderNo]"]).toBe("2");
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
		// Clean up
		let files = fs.readdirSync(downloadDir);
		const downloadedFile = files.find((file) => file.endsWith(".xlsx"));
		const filePath = path.join(downloadDir, downloadedFile);
		fs.unlinkSync(filePath);
		// remove content in download dir
		files = fs.readdirSync(downloadDir);
		files.forEach((file) => {
			fs.unlinkSync(path.join(downloadDir, file));
		});
	});
});
