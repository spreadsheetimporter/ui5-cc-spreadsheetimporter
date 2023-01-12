const Base = require("./Base");
const FE = require("./FE");

class FEV4 {
	constructor() {}
	async getFieldValue(fieldName) {
		const field = await Base.getControlById(`ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::${fieldName}::Field-content`);
		const contentDisplay = await field.getContentDisplay();
		const value = await contentDisplay.getText();
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
module.exports = FEV4;
