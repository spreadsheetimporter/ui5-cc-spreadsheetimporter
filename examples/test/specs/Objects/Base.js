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
}
module.exports = Base;
