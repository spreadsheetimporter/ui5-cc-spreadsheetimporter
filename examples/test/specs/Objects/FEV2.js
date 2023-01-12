const Base = require("./Base");
const FE = require("./FE");

class FEV2 {
	constructor() {
		this.BaseClass = new Base();
	}
	async getFieldValue(fieldName) {
		const field = await this.BaseClass.getControlById(
			`ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::${fieldName}::Field`
		);
		const value = await field.getValue();
		return value;
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
}
module.exports = FEV2;
