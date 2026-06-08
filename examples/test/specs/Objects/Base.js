class Base {
	constructor() {}
	async getControlById(id) {
		const table = await browser.asControl({
			selector: {
				interaction: "root",
				id: id
			}
		});
		return table;
	}
	async pressById(id) {
		const object = await browser.asControl({
			forceSelect: true,
			selector: {
				id: id
			}
		});
		if (object._domId) {
			await object.press();
		} else {
			throw "Object not found";
		}
	}
	async dummyWait(timeout) {
		try {
			await $("filtekuzfutkfk424214").waitForExist({ timeout: timeout });
		} catch (error) {}
	}
	// FE busy overlays (sap-ui-blocklayer-popup) can linger under load and intercept the next
	// click (Save/Upload). Remove a lingering one before pressing; no-op if none is present.
	async removeBlockLayer() {
		try {
			await browser.execute(() => {
				const blockLayerPopup = document.getElementById("sap-ui-blocklayer-popup");
				if (blockLayerPopup) {
					blockLayerPopup.remove();
				}
			});
		} catch (error) {}
	}
}
module.exports = Base;
