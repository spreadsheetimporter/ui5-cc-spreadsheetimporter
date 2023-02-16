const Base = require("./Base");
const FE = require("./FE");

class FEV2ND {
	constructor() {
		this.BaseClass = new Base();
		this.rootId = "ui.v2.ordersv2fenondraft::sap.suite.ui.generic.template.";
		this.listReportId = this.rootId + "ListReport.view.ListReport::OrdersND--";
		this.objectPageId = this.rootId + "ObjectPage.view.Details::OrdersND--";
		this.listReportGoButton = this.listReportId + "listReportFilter-btnGo";
		this.listReportExceluploadButton = this.listReportId + "action::excelUploadButtonListReport";
		this.listReportDynamicPageTitle = this.listReportId + "template:::ListReportPage:::DynamicPageTitle";
		this.listReportTable = this.listReportId + "responsiveTable";
		this.objectPageEditButton = this.objectPageId + "edit";
		this.objectPageExceluploadButton = this.objectPageId + "action::excelUploadButton";
		this.objectPageSaveButton = this.objectPageId + "activate";
		this.objectPageOrderItems = this.objectPageId + "Items::com.sap.vocabularies.UI.v1.LineItem::responsiveTable";
		this.listReportUploadFilename = "test/testFiles/ListReportOrdersNoErrosV2.xlsx"
		// nav to sub object page
		this.navToObjectPageAttribute = "OrderNo";
		this.navToObjectPageValue = "2";
		// nav to sub object page
		this.navToSubObjectPageAttribute = "product_ID";
		this.navToSubObjectPageValue = "254";
		// check file upload list report
		this.checkFileuploadListreportAttribute = "OrderNo";
		this.checkFileuploadListreportValue = "4";

	}
	async getFieldValue(fieldName) {
		const field = await $(`//*[@id="ui.v2.ordersv2fenondraft::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItemsND--com.sap.vocabularies.UI.v1.Identification::${fieldName}::Field-text"]`)
		let value = await field.getText();
		value = value.replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,' ');
		return value
	}

	async getRoutingHash(tableId, objectAttribute, objectValue, rootPathBool) {
		const table = await this.BaseClass.getControlById(tableId);
		const items = await table.getItems();
		const rootBinding = await table.getBindingContext();
		let rootPath = "";
		if (rootPathBool) {
			rootPath = await rootBinding.getPath();
		}
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

	async getTableObject(tableId, objectAttribute, objectValue) {
		const table = await this.BaseClass.getControlById(tableId);
		const items = await table.getItems();
		const rootBinding = await table.getBindingContext();
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const binding = await element.getBindingContext();
			const object = await binding.getObject();
			if (object[objectAttribute] === objectValue) {
				return object
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
		formattedDate = formattedDate.replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,' ');
		let valueText = await field.getText();
		valueText = valueText.replace(/[\u00A0\u1680​\u180e\u2000-\u2009\u200a​\u200b​\u202f\u205f​\u3000]/g,' ');
		return { valueText: valueText, formattedDate: formattedDate };
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
module.exports = FEV2ND;
