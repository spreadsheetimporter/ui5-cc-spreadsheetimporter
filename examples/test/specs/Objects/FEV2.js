const Base = require("./Base");
const FE = require("./FE");

class FEV2 {
	constructor() {
		this.BaseClass = new Base();
	}
	async getFieldValue(fieldName) {
		let value = "";
		const field = await this.BaseClass.getControlById(
			`ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::${fieldName}::Field`
		);
		const dataType = await field.getDataType();
		value = await field.getValue();
		if (dataType === "Edm.Time" && value.ms) {
			value = this.getTimeValue(value.ms);
		} else {
		}

		return value.toString();
	}

	async getRoutingHash(tableId, objectAttribute, objectValue) {
		const table = await this.BaseClass.getControlById(tableId);
		const items = await table.getItems();
		const rootBinding = await table.getBindingContext();
		let rootPath = "";
		try {
			rootPath = await rootBinding.getPath();
		} catch (error) {}
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const binding = await element.getBindingContext();
			const object = await binding.getObject();
			if (object[objectAttribute] === objectValue) {
				const path = binding.sPath;
				return `#${rootPath}${path}`;
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
module.exports = FEV2;
