const Base = require("./Base");
const FE = require("./FE");

class FEV4 {
	constructor() {
		this.unicodeSpaceRegex = /[\u0020\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\u202F]/g;

		this.BaseClass = new Base();
		this.rootId = "ui.v4.ordersv4fe::";
		this.listReportId = this.rootId + "OrdersList--fe::";
		this.objectPageId = this.rootId + "OrdersObjectPage--fe::";
		this.listReportGoButton = this.listReportId + "FilterBar::Orders-btnSearch";
		this.listReportSpreadsheetuploadButton = this.listReportId + "CustomAction::test";
		this.listReportDynamicPageTitle = this.listReportId + "ListReport-header";
		this.listReportTable = this.listReportId + "table::Orders::LineItem-innerTable";
		this.objectPageEditButton = this.objectPageId + "StandardAction::Edit";
		this.objectPageSpreadsheetuploadButton = this.objectPageId + "CustomAction::ObjectPageExtController";
		this.objectPageSaveButton = this.objectPageId + "FooterBar::StandardAction::Save";
		this.objectPageOrderItems = this.objectPageId + "table::Items::LineItem-innerTable";
		this.listReportUploadFilename = "test/testFiles/ListReportOrdersNoErros.xlsx";
		// nav to sub object page
		this.navToObjectPageAttribute = "OrderNo";
		this.navToObjectPageValue = "2";
		// nav to sub object page
		this.navToSubObjectPageAttribute = "product_ID";
		this.navToSubObjectPageValue = "254";
		// check file upload list report
		this.checkFileuploadListreportAttribute = "OrderNo";
		this.checkFileuploadListreportValue = "4";
		// grid table
		this.gridTablePageId = this.rootId + "OrdersListGridTable--fe::";
		this.listReportGridTable = this.gridTablePageId + "table::Orders::LineItem-innerTable";
		this.gridTablePageGoButton = this.gridTablePageId + "FilterBar::Orders-btnSearch";
		this.gridTablePageDynamicPageTitle = this.gridTablePageId + "ListReport-header";
		this.gridTablePageSpreadsheetuploadButton = this.gridTablePageId + "CustomAction::spreadsheetUploadListReport";

		this.overflowButton = "__toolbar0-overflowButton";
	}
	async getFieldValue(fieldName) {
		const field = await this.BaseClass.getControlById(`ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::${fieldName}::Field`);
		let valueText = "";
		try {
			// const content = await field.getContent()
			const contentDisplay = await field.exec(() => this.getContentDisplay());
			valueText = await contentDisplay.getText();
		} catch (error) {
			// only for version 84
			valueText = await field.getText();
		}
		return valueText.toString();
	}

	async getDateFields(attribute, options) {
		const field = await browser.asControl({
			selector: {
				id: `ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::${attribute}::Field`
			}
		});
		const binding = await field.exec(() => this.getBindingContext());
		const object = await binding.getObject();
		const date = new Date(object[attribute]);
		let formattedDate = await date.toLocaleString("en-US", options);
		// check printend value
		let valueText = "";
		try {
			// const content = await field.getContent()
			const contentDisplay = await field.exec(() => this.getContentDisplay());
			valueText = await contentDisplay.getText();
		} catch (error) {
			// only for version 84
			valueText = await field.getText();
		}
		// Replace unicode space characters with normal space
		valueText = valueText.replace(this.unicodeSpaceRegex, " ");
		formattedDate = formattedDate.replace(this.unicodeSpaceRegex, " ");
		return { valueText: valueText, formattedDate: formattedDate };
	}

	async getRoutingHash(tableId, objectAttribute, objectValue, rootPath) {
		const table = await this.BaseClass.getControlById(tableId);
		const items = await table.exec(() => this.getItems());
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const item = await this.BaseClass.getControlById(element.id);
			const binding = await item.exec(() => this.getBindingContext());
			const object = await binding.getObject();
			if (object[objectAttribute] === objectValue) {
				const path = binding.sPath;
				return `#${path}`;
			}
		}
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
}
module.exports = FEV4;
