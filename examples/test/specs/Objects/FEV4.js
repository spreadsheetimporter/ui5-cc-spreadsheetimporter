const Base = require("./Base");
const FE = require("./FE");

class FEV4 {
	constructor() {
		this.BaseClass = new Base();
		this.rootId = "ui.v4.ordersv4fe::";
		this.listReportId = this.rootId + "OrdersList--fe::";
		this.objectPageId = this.rootId + "OrdersObjectPage--fe::";
		this.listReportGoButton = this.listReportId + "FilterBar::Orders-btnSearch";
		this.listReportDynamicPageTitle = this.listReportId + "ListReport-header";
		this.listReportTable = this.listReportId + "table::Orders::LineItem-innerTable";
		this.objectPageEditButton = this.objectPageId + "StandardAction::Edit";
		this.objectPageExceluploadButton = this.objectPageId + "CustomAction::excelUpload";
		this.objectPageSaveButton = this.objectPageId + "FooterBar::StandardAction::Save";
		this.objectPageOrderItems = this.objectPageId + "table::Items::LineItem-innerTable";
		// nav to sub object page
		this.navToObjectPageAttribute = "OrderNo";
		this.navToObjectPageValue = "2";
		// nav to sub object page
		this.navToSubObjectPageAttribute = "product_ID";
		this.navToSubObjectPageValue = "254";
	}
	async getFieldValue(fieldName) {
		const field = await this.BaseClass.getControlById(`ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::${fieldName}::Field-content`);
		const contentDisplay = await field.getContentDisplay();
		const value = await contentDisplay.getText();
		return value.toString();
	}

	async getDateFields(attribute, options) {
		const field = await browser.asControl({
			selector: {
				id: `ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::${attribute}::Field-content`
			}
		});
		const binding = await field.getBindingContext();
		const object = await binding.getObject();
		const date = new Date(object.validFrom);
		const formattedDate = await date.toLocaleString("en-US", options);
		// check printend value
		const contentDisplay = await field.getContentDisplay();
		const valueText = await contentDisplay.getText();
		return { valueText: valueText, formattedDate: formattedDate };
	}

	async getRoutingHash(tableId, objectAttribute, objectValue, rootPath) {
		const table = await this.BaseClass.getControlById(tableId);
		const items = await table.getItems();
		const rootBinding = await table.getBindingContext();
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const binding = await element.getBindingContext();
			const object = await binding.getObject();
			if (object[objectAttribute] === objectValue) {
				const path = binding.sPath;
				return `#${path}`;
			}
		}
	}
}
module.exports = FEV4;
