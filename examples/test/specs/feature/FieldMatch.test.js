const Base = require("../Objects/Base");

let BaseClass = undefined;

/**
 * Freestyle harness feature test: fieldMatchType / column name validation (issue #58, refs #29).
 *
 * The feature page configures the component with fieldMatchType "label", which matches spreadsheet
 * columns against the plain OData field label instead of the default "[key]" bracket notation.
 * The uploaded file (TwoRowsNoErrors.xlsx) uses the bracket format and imports cleanly in the
 * default "labelTypeBrackets" mode (see UploadFileObjectPage). In "label" mode none of the bracket
 * headers ("UnitPrice[price]", "ID[product_ID]", …) match a field label, so the component raises a
 * "column does not match any data field" error for every column instead of writing — proving both
 * the column-name check (#29) and that the fieldMatchType drives the matching (#58).
 */
describe("Feature: Field Match (label / column names)", () => {
	before(async () => {
		BaseClass = new Base();
		await browser.goTo({ sHash: "#/feature/fieldmatch" });
		await BaseClass.dummyWait(1000);
	});

	it("reports the bracket columns as not found when fieldMatchType is 'label'", async () => {
		await browser.asControl({ forceSelect: true, selector: { id: new RegExp("fieldMatchOpenButton$") } }).press();
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
		// labelTypeBrackets-format file: imports cleanly in the default mode, but every header is a
		// "<label>[<key>]" string that cannot equal a plain label, so "label" mode rejects them all.
		const remoteFilePath = await browser.uploadFile("test/testFiles/TwoRowsNoErrors.xlsx");
		const $uploader = await uploader.getWebElement();
		const $fileInput = await $uploader.$("input[type=file]");
		await $fileInput.setValue(remoteFilePath);
		await BaseClass.dummyWait(1500);

		// the importer raises its "Upload Error" messages dialog because the columns did not match
		const errorDialog = await browser.asControl({
			forceSelect: true,
			selector: { controlType: "sap.m.Dialog", properties: { title: "Upload Error" }, searchOpenDialogs: true }
		});
		expect(await errorDialog.isOpen()).toBe(true);

		// and the messages are specifically "column not found" entries for the bracket headers
		const messagesModel = await errorDialog.getModel("messages");
		const messagesData = await messagesModel.getData();
		const messages = Object.values(messagesData._baseObject || messagesData);
		const bracketColumnsNotFound = messages.filter((message) => message && message.title && (message.title.includes("[product_ID]") || message.title.includes("[price]")));
		expect(bracketColumnsNotFound.length).toBeGreaterThan(0);
	});
});
