const FEBase = require("./FEBase");

/**
 * Page object for the OData V2 non-draft Fiori Elements app (SUGE template). Shared helpers
 * and constants live in FEBase; this class holds the non-draft template-specific selectors
 * (save button is "save"; entity keys have no IsActiveEntity) and the dependent getters.
 */
class FEV2ND extends FEBase {
	constructor() {
		super();
		this.rootId = "ui.v2.ordersv2fenondraft::sap.suite.ui.generic.template.";
		this.listReportId = this.rootId + "ListReport.view.ListReport::OrdersND--";
		this.objectPageId = this.rootId + "ObjectPage.view.Details::OrdersND--";
		this.listReportGoButton = this.listReportId + "listReportFilter-btnGo";
		this.listReportSpreadsheetuploadButton = this.listReportId + "spreadsheetUploadButtonListReport";
		this.listReportDynamicPageTitle = this.listReportId + "template:::ListReportPage:::DynamicPageTitle";
		this.listReportTable = this.listReportId + "responsiveTable";
		this.objectPageEditButton = this.objectPageId + "edit";
		this.objectPageSpreadsheetuploadButton = this.objectPageId + "spreadsheetUploadButton";
		this.objectPageSaveButton = this.objectPageId + "save";
		this.objectPageOrderItems = this.objectPageId + "Items::com.sap.vocabularies.UI.v1.LineItem::responsiveTable";

		this.overflowButton = "__toolbar2-overflowButton";
		this.entitySet = "OrdersND";
		this.entityObjectPage = "ID=64e718c9-ff99-47f1-8ca3-950c850777d4";
		this.entityObjectPageTestError = "ID=64e718c9-ff99-47f1-8ca3-950c850777d5";
		this.entityObjectPageCSV = "ID=64e718c9-ff99-47f1-8ca3-950c850777d8";
		this.entityObjectPageComma = "ID=64e718c9-ff99-47f1-8ca3-950c850777d6";
		this.entityObjectPageDot = "ID=64e718c9-ff99-47f1-8ca3-950c850777d7";
	}

	async getFieldValue(fieldName) {
		const field = await $(
			`//*[@id="ui.v2.ordersv2fenondraft::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItemsND--com.sap.vocabularies.UI.v1.Identification::${fieldName}::Field-text"]`
		);
		let value = await field.getText();
		value = value.replace(this.unicodeSpaceRegex, " ");
		return value;
	}

	async getRoutingHash(tableId, objectAttribute, objectValue, rootPathBool) {
		const table = await this.BaseClass.getControlById(tableId);
		const items = await table.exec(() => this.getItems());
		const rootBinding = await table.exec(() => this.getBindingContext());
		let rootPath = "";
		if (rootPathBool) {
			rootPath = await rootBinding.getPath();
		}
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const item = await this.BaseClass.getControlById(element.id);
			const binding = await item.exec(() => this.getBindingContext());
			const object = await binding.getObject();
			if (object[objectAttribute] === objectValue) {
				const path = binding.sPath;
				return `#${rootPath}${path}`;
			}
		}
	}

	async getDateFields(attribute, options) {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: attribute
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		let formattedDate = await date.toLocaleString("en-US", options);
		let valueText = await field.getText();
		valueText = valueText.replace(this.unicodeSpaceRegex, " ");
		formattedDate = formattedDate.replace(this.unicodeSpaceRegex, " ");
		return { valueText: valueText, formattedDate: formattedDate };
	}
}
module.exports = FEV2ND;
