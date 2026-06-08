const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const Base = require("../Objects/Base");

let BaseClass = undefined;
const FILE = "FeatureDeepDownload.xlsx";

/**
 * Freestyle harness feature test: deep download / export.
 *
 * Deep-links to #/feature/download and triggers a deepLevel-2 export (Orders + Items +
 * Shipping) straight from the backend — no Fiori Elements list-report/object-page navigation.
 * Verifies the generated workbook contains the child "OrderItems" sheet with rows.
 *
 * App-agnostic (id-suffix regex), so it runs against both the V2 and V4 harness apps.
 */
describe("Feature: Deep Download (export)", () => {
	let downloadDir;

	before(async () => {
		BaseClass = new Base();
		downloadDir = path.resolve(__dirname, "../../downloads");
		if (!fs.existsSync(downloadDir)) {
			fs.mkdirSync(downloadDir, { recursive: true });
		}
		// start from a clean slate so we assert on a fresh export
		const stale = path.join(downloadDir, FILE);
		if (fs.existsSync(stale)) {
			fs.unlinkSync(stale);
		}
		await browser.goTo({ sHash: "#/feature/download" });
		await BaseClass.dummyWait(1000);
	});

	it("deep-exports Orders + child Items into a multi-sheet spreadsheet", async () => {
		await browser.asControl({ forceSelect: true, selector: { id: new RegExp("downloadOpenButton$") } }).press();

		await browser.waitUntil(() => fs.existsSync(path.join(downloadDir, FILE)), {
			timeout: 20000,
			interval: 500,
			timeoutMsg: `${FILE} was not downloaded within 20s`
		});

		const workbook = XLSX.readFile(path.join(downloadDir, FILE));
		// the child entity is exported on its own sheet
		expect(workbook.SheetNames).toContain("OrderItems");
		const orderItems = XLSX.utils.sheet_to_json(workbook.Sheets["OrderItems"]);
		expect(orderItems.length).toBeGreaterThan(0);
	});

	after(() => {
		const f = path.join(downloadDir, FILE);
		if (fs.existsSync(f)) {
			fs.unlinkSync(f);
		}
	});
});
