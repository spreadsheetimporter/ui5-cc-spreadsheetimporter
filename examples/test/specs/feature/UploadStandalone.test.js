const Base = require("../Objects/Base");

let BaseClass = undefined;

/**
 * Freestyle harness feature test: standalone upload.
 *
 * Deep-links to the dedicated #/upload feature view (no Fiori Elements shell, no draft,
 * no list->object-page navigation), uploads a spreadsheet, and asserts the component
 * parsed the rows. `standalone: true` means the component hands the parsed rows back via
 * uploadButtonPress instead of writing to a backend, so this exercises the pure
 * parse/coercion path with zero backend round-trips.
 *
 * App-agnostic: selects controls by id-suffix regex + control type, so the same spec runs
 * against every harness app (V2 + V4, all UI5 versions).
 */
describe("Feature: Upload (standalone)", () => {
	before(async () => {
		BaseClass = new Base();
		await browser.goTo({ sHash: "#/feature/upload" });
		await BaseClass.dummyWait(1000);
	});

	it("parses an uploaded spreadsheet and lists the rows without a backend write", async () => {
		// open the upload dialog (button id ends with `uploadOpenButton` on every harness app)
		await browser.asControl({ forceSelect: true, selector: { id: new RegExp("uploadOpenButton$") } }).press();
		await BaseClass.dummyWait(1000);

		// remove the UI5 block layer if it lingers (parallel-load flake guard)
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

		// locate the FileUploader inside the dialog and set the test file
		const uploader = await browser.asControl({
			forceSelect: true,
			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader",
				searchOpenDialogs: true
			}
		});
		const remoteFilePath = await browser.uploadFile("test/testFiles/ListReportOrdersNoErros.xlsx");
		const $uploader = await uploader.getWebElement();
		const $fileInput = await $uploader.$("input[type=file]");
		await $fileInput.setValue(remoteFilePath);

		// press the dialog's Upload button
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: { text: "Upload" },
					searchOpenDialogs: true
				}
			})
			.press();
		await BaseClass.dummyWait(1000);

		// assert: the local result table received the two parsed rows (OrderNo 3 + 4)
		const table = await browser.asControl({ forceSelect: true, selector: { id: new RegExp("uploadResultTable$") } });
		const items = await table.getAggregation("items");
		expect(items.length).toEqual(2);
	});
});
