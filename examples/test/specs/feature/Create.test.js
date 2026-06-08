const Base = require("../Objects/Base");

let BaseClass = undefined;

// All harness apps create into the same CAP database (:4004), so a create from either the V2 or
// V4 app is verifiable through the V4 OData endpoint — keeping this spec app-agnostic. The DB is
// shared across specs/runs, so we assert the count INCREASED by 2 from a per-run baseline rather
// than absolute existence (which would pass trivially after a prior run).
const COUNT_URL = "http://localhost:4004/odata/v4/orders/Orders?$filter=buyer eq 'test@test.de'&$count=true&$top=0";

async function countTestOrders() {
	const res = await fetch(COUNT_URL, { headers: { Accept: "application/json" } });
	if (!res.ok) return -1;
	const json = await res.json();
	return json["@odata.count"];
}

/**
 * Freestyle harness feature test: backend create.
 *
 * Deep-links to #/feature/create, uploads a flat Orders spreadsheet (2 rows, buyer test@test.de),
 * and verifies the rows were actually created in the backend (the component resolves the bound
 * /Orders table from context).
 */
describe("Feature: Create (backend)", () => {
	let baseline;

	before(async () => {
		BaseClass = new Base();
		baseline = await countTestOrders();
		await browser.goTo({ sHash: "#/feature/create" });
		await BaseClass.dummyWait(1000);
	});

	it("creates the uploaded Orders in the backend", async () => {
		await browser.asControl({ forceSelect: true, selector: { id: new RegExp("createOpenButton$") } }).press();
		await BaseClass.dummyWait(1000);

		try {
			await browser.execute(() => {
				const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
				if (blockLayerPopup) {
					blockLayerPopup.remove();
				}
			});
		} catch (error) {
			/* nothing to remove */
		}

		const uploader = await browser.asControl({
			forceSelect: true,
			selector: { interaction: "root", controlType: "sap.ui.unified.FileUploader", searchOpenDialogs: true }
		});
		const remoteFilePath = await browser.uploadFile("test/testFiles/ListReportOrdersNoErros.xlsx");
		const $uploader = await uploader.getWebElement();
		const $fileInput = await $uploader.$("input[type=file]");
		await $fileInput.setValue(remoteFilePath);

		await browser.asControl({ selector: { controlType: "sap.m.Button", properties: { text: "Upload" }, searchOpenDialogs: true } }).press();

		// the file has 2 Orders (OrderNo 3 + 4) -> the test-order count must grow by 2
		await browser.waitUntil(async () => (await countTestOrders()) >= baseline + 2, {
			timeout: 20000,
			interval: 1000,
			timeoutMsg: `Expected the order count to grow by 2 from ${baseline} after the create upload`
		});

		expect(await countTestOrders()).toBeGreaterThanOrEqual(baseline + 2);
	});
});
