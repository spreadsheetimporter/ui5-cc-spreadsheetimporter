const FEBase = require("./FEBase");

/**
 * Page object for the OData V4 Fiori Elements app. Shared helpers and constants live in
 * FEBase; this class holds the V4-specific selectors (incl. the grid-table variant) and the
 * field/date/routing getters that depend on them.
 */
class FEV4 extends FEBase {
	constructor() {
		super();
		this.rootId = "ui.v4.ordersv4fe::";
		this.listReportId = this.rootId + "OrdersList--fe::";
		this.objectPageId = this.rootId + "OrdersObjectPage--fe::";
		this.listReportGoButton = this.listReportId + "FilterBar::Orders-btnSearch";
		this.listReportSpreadsheetuploadButton = this.listReportId + "table::Orders::LineItem::CustomAction::test";
		this.listReportDynamicPageTitle = this.listReportId + "ListReport-header";
		this.listReportTable = this.listReportId + "table::Orders::LineItem-innerTable";
		this.objectPageEditButton = this.objectPageId + "StandardAction::Edit";
		this.objectPageSpreadsheetuploadButton = this.objectPageId + "table::Items::LineItem::CustomAction::ObjectPageExtController";
		this.objectPageSaveButton = this.objectPageId + "FooterBar::StandardAction::Save";
		this.objectPageOrderItems = this.objectPageId + "table::Items::LineItem-innerTable";
		// grid table
		this.gridTablePageId = this.rootId + "OrdersListGridTable--fe::";
		this.listReportGridTable = this.gridTablePageId + "table::Orders::LineItem-innerTable";
		this.gridTablePageGoButton = this.gridTablePageId + "FilterBar::Orders-btnSearch";
		this.gridTablePageDynamicPageTitle = this.gridTablePageId + "ListReport-header";
		this.gridTablePageSpreadsheetuploadButton = this.gridTablePageId + "CustomAction::spreadsheetUploadListReport";

		this.overflowButton = "__toolbar0-overflowButton";

		this.entitySet = "Orders";
		this.entityObjectPage = "ID=64e718c9-ff99-47f1-8ca3-950c850777d4,IsActiveEntity=true";
		this.entityObjectPageTestError = "ID=64e718c9-ff99-47f1-8ca3-950c850777d5,IsActiveEntity=true";
		this.entityObjectPageCSV = "ID=64e718c9-ff99-47f1-8ca3-950c850777d8,IsActiveEntity=true";
		this.entityObjectPageComma = "ID=64e718c9-ff99-47f1-8ca3-950c850777d6,IsActiveEntity=true";
		this.entityObjectPageDot = "ID=64e718c9-ff99-47f1-8ca3-950c850777d7,IsActiveEntity=true";
		this.entityObjectPageFormat = "ID=64e718c9-ff99-47f1-8ca3-950c850777da,IsActiveEntity=true";
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
		valueText = valueText.replace(this.unicodeSpaceRegex, " ");
		return valueText.toString();
	}

	async getDateFields(attribute, options) {
		const field = await browser.asControl({
			selector: {
				id: `ui.v4.ordersv4fe::Orders_ItemsObjectPage--fe::FormContainer::Identification::FormElement::DataField::${attribute}::Field`
			}
		});
		const binding = await field.getBindingContext();
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
}
module.exports = FEV4;
