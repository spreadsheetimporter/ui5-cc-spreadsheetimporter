const Base = require("../Objects/Base");

let BaseClass = undefined;

/**
 * Freestyle harness feature test: validation errors.
 *
 * Backend upload of a file with malformed numbers (price "13,56 EUR", etc.). The component
 * validates against the OrderItems metadata (price is a Double) and raises its messages dialog
 * instead of writing — the upload must NOT succeed silently.
 */
describe("Feature: Errors (validation)", () => {
	before(async () => {
		BaseClass = new Base();
		await browser.goTo({ sHash: "#/feature/errors" });
		await BaseClass.dummyWait(1000);
	});

	it("raises the messages dialog for a file with invalid values", async () => {
		await browser.asControl({ forceSelect: true, selector: { id: new RegExp("errorsOpenButton$") } }).press();
		await BaseClass.dummyWait(1000);
		try {
			await browser.execute(() => {
				const b = document.getElementById("sap-ui-blocklayer-popup");
				if (b) b.remove();
			});
		} catch (e) {
			/* nothing */
		}

		const uploader = await browser.asControl({
			forceSelect: true,
			selector: { interaction: "root", controlType: "sap.ui.unified.FileUploader", searchOpenDialogs: true }
		});
		const remoteFilePath = await browser.uploadFile("test/testFiles/TwoRowsErrors.xlsx");
		const $uploader = await uploader.getWebElement();
		const $fileInput = await $uploader.$("input[type=file]");
		await $fileInput.setValue(remoteFilePath);

		await browser.asControl({ selector: { controlType: "sap.m.Button", properties: { text: "Upload" }, searchOpenDialogs: true } }).press();
		await BaseClass.dummyWait(1500);

		// the importer raises its "Upload Error" messages dialog — it only opens when the validation
		// found errors, so its presence is the assertion (the upload did not proceed silently).
		const errorDialog = await browser.asControl({
			forceSelect: true,
			selector: { controlType: "sap.m.Dialog", properties: { title: "Upload Error" }, searchOpenDialogs: true }
		});
		expect(await errorDialog.isOpen()).toBe(true);
	});
});
