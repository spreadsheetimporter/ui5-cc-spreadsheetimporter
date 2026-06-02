const Base = require("./Base");

/**
 * Shared base for the Fiori Elements page objects (FEV2, FEV4, FEV2ND).
 *
 * Holds only what is genuinely identical across the variants: the unicode-space regex, the
 * Base helper, the navigation/lookup constants, and the table helpers + time formatter.
 * Template/version-specific selectors (rootId, button/table ids, entity keys) and the
 * field/date/routing getters that depend on them live in the subclasses.
 */
class FEBase {
	constructor() {
		this.unicodeSpaceRegex = /[\u0020\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\u202F]/g;
		this.BaseClass = new Base();

		// nav to sub object page
		this.navToObjectPageAttribute = "OrderNo";
		this.navToObjectPageValue = "2";
		this.navToSubObjectPageAttribute = "product_ID";
		this.navToSubObjectPageValue = "254";
		// check file upload list report
		this.checkFileuploadListreportAttribute = "OrderNo";
		this.checkFileuploadListreportValue = "4";
		this.listReportUploadFilename = "test/testFiles/ListReportOrdersNoErros.xlsx";
	}

	async getTableItems(tableId) {
		const table = await this.BaseClass.getControlById(tableId);
		const metadata = await table.exec(() => this.getMetadata());
		const type = await metadata.getName();
		let items = undefined;
		if (type === "sap.m.Table") {
			items = await table.exec(() => this.getItems());
		} else {
			items = await table.exec(() => this.getRows());
		}
		return items;
	}

	async getTableObject(tableId, objectAttribute, objectValue) {
		const items = await this.getTableItems(tableId);
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const item = await this.BaseClass.getControlById(element.id);
			const binding = await item.exec(() => this.getBindingContext());
			const object = await binding.getObject();
			if (object[objectAttribute] === objectValue) {
				return object;
			}
		}
	}

	getTimeValue(ms) {
		var date = new Date(ms);
		var hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
		var minutes = Math.floor(ms / (1000 * 60)) % 60;
		var seconds = Math.floor(ms / 1000) % 60;
		var ampm = hours >= 12 ? "PM" : "AM";
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? "0" + minutes : minutes;
		seconds = seconds < 10 ? "0" + seconds : seconds;
		return hours + ":" + minutes + ":" + seconds + " " + ampm;
	}
}

module.exports = FEBase;
