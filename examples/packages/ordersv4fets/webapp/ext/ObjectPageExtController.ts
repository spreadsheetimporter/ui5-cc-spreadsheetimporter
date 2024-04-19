import Component, { Component$ChangeBeforeCreateEvent, Component$CheckBeforeReadEvent } from "cc/spreadsheetimporter/v0_33_3/Component";
import BaseController from "sap/fe/core/BaseController";
import ExtensionAPI from "sap/fe/core/ExtensionAPI";
/**
 * Generated event handler.
 *
 * @param this reference to the 'this' that the event handler is bound to.
 * @param pageContext the context of the page on which the event was fired
 */
export async function openSpreadsheetUploadDialogTable(this: ExtensionAPI) {
	const view = this.getRouting().getView();
	const controller = view.getController() as BaseController;
	view.setBusyIndicatorDelay(0);
	view.setBusy(true);
	const spreadsheetUpload = (await controller.getAppComponent().createComponent({
		usage: "spreadsheetImporter",
		async: true,
		componentData: {
			context: this,
			tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
			columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal"],
			mandatoryFields: ["product_ID", "quantity"],
			spreadsheetFileName: "Test.xlsx"
		}
	})) as Component;
	// event to check before uploaded to app
	spreadsheetUpload.attachCheckBeforeRead((event) => {
		const sheetData = event.getParameter("sheetData") as any;
		let errorArray = [];
		for (const [index, row] of sheetData.entries()) {
			//check for invalid price
			for (const key in row) {
				if (key.endsWith("[price]") && row[key].rawValue > 100) {
					const error = {
						title: "Price too high (max 100)",
						row: index + 2,
						group: true,
						rawValue: row[key].rawValue,
						ui5type: "Error"
					};
					errorArray.push(error);
				}
			}
		}
		(event.getSource() as Component).addArrayToMessages(errorArray);
	});
	// event to change data before send to backend
	spreadsheetUpload.attachChangeBeforeCreate((event) => {
		let payload = event.getParameter("payload");
		// round number from 12,56 to 12,6
		if (payload.price) {
			payload.price = Number(Number(payload.price).toFixed(1));
		}
		return payload;
	});

	spreadsheetUpload.openSpreadsheetUploadDialog();
	view.setBusy(false);
}
