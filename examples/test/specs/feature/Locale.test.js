const Base = require("../Objects/Base");

let BaseClass = undefined;

/**
 * Freestyle harness feature test: locale / decimal separator.
 *
 * Typed parse with decimalSeparator ",". The file stores German-format prices ("1.000,99"), which
 * must be coerced against the OrderItems price (Double) to 1000.99 ("." thousands, "," decimal).
 * The coerced value is captured via uploadButtonPress and shown in the localePrice text — no write.
 */
describe("Feature: Locale (decimal separator)", () => {
	before(async () => {
		BaseClass = new Base();
		await browser.goTo({ sHash: "#/feature/locale" });
		await BaseClass.dummyWait(1000);
	});

	it("coerces a decimal-comma value to the correct number", async () => {
		await browser.asControl({ forceSelect: true, selector: { id: new RegExp("localeOpenButton$") } }).press();
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
		const remoteFilePath = await browser.uploadFile("test/testFiles/TwoRowsNoErrorsNumberFormatsDecimalComma.xlsx");
		const $uploader = await uploader.getWebElement();
		const $fileInput = await $uploader.$("input[type=file]");
		await $fileInput.setValue(remoteFilePath);

		await browser.asControl({ selector: { controlType: "sap.m.Button", properties: { text: "Upload" }, searchOpenDialogs: true } }).press();
		await BaseClass.dummyWait(1500);

		// "1.000,99" must have been coerced to 1000.99
		await browser.waitUntil(
			async () => {
				const t = await browser.asControl({ forceSelect: true, selector: { id: new RegExp("localePrice$") } });
				return (await t.getProperty("text")) === "1000.99";
			},
			{ timeout: 10000, interval: 500, timeoutMsg: "decimal-comma value was not coerced to 1000.99" }
		);

		const priceText = await browser.asControl({ forceSelect: true, selector: { id: new RegExp("localePrice$") } });
		expect(await priceText.getProperty("text")).toEqual("1000.99");
	});
});
