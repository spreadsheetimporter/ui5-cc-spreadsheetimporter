const Base = require("../Objects/Base");

let BaseClass = undefined;

/**
 * Freestyle harness feature test: available options / options menu.
 *
 * Opens the upload dialog configured with availableOptions ['strict']. That makes the importer
 * surface its Options/Settings menu; pressing it reveals the options panel.
 */
describe("Feature: Options (available options)", () => {
	before(async () => {
		BaseClass = new Base();
		await browser.goTo({ sHash: "#/feature/options" });
		await BaseClass.dummyWait(1000);
	});

	it("shows the options/settings menu when availableOptions is set", async () => {
		await browser.asControl({ forceSelect: true, selector: { id: new RegExp("optionsOpenButton$") } }).press();
		await BaseClass.dummyWait(1000);
		try {
			await browser.execute(() => {
				const b = document.getElementById("sap-ui-blocklayer-popup");
				if (b) b.remove();
			});
		} catch (e) {
			/* nothing */
		}

		// availableOptions surfaces a settings button (action-settings icon) inside the open dialog;
		// its presence is the assertion (without availableOptions the options menu is not shown).
		const settingsButton = await browser.asControl({
			forceSelect: true,
			selector: {
				controlType: "sap.m.Button",
				properties: { icon: "sap-icon://action-settings" },
				searchOpenDialogs: true
			}
		});
		expect(await settingsButton.getProperty("icon")).toEqual("sap-icon://action-settings");
	});
});
