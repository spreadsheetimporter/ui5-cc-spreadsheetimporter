import Component, { Component$ChangeBeforeCreateEvent, Component$CheckBeforeReadEvent, Component$UploadButtonPressEvent } from "cc/spreadsheetimporter/v0_33_2/Component";
import BaseController from "sap/fe/core/BaseController";
import ExtensionAPI from "sap/fe/core/ExtensionAPI";
/**
 * Generated event handler.
 *
 * @param this reference to the 'this' that the event handler is bound to.
 * @param pageContext the context of the page on which the event was fired
 */
export async function openSpreadsheetUploadDialog(this: ExtensionAPI) {
	const view = this.getRouting().getView();
	const controller = view.getController() as BaseController;
	view.setBusyIndicatorDelay(0);
	view.setBusy(true);
	const spreadsheetUpload = (await controller.getAppComponent().createComponent({
		usage: "spreadsheetImporter",
		async: true,
		componentData: {
			context: this,
			activateDraft: true
		}
	})) as Component;
	// event to check before uploaded to app
	spreadsheetUpload.attachCheckBeforeRead(function (event: Component$CheckBeforeReadEvent) {
		// example
		const sheetData = event.getParameter("sheetData") as any;
		event.getParameters().messages;
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
	}, this);

	// event example to prevent uploading data to backend
	spreadsheetUpload.attachUploadButtonPress(function (event: Component$UploadButtonPressEvent) {
		//event.preventDefault();
		//event.getParameter("payload");
	}, this);

	// event to change data before send to backend
	spreadsheetUpload.attachChangeBeforeCreate(function (event: Component$ChangeBeforeCreateEvent) {
		let payload = event.getParameter("payload") as any;
		// round number from 12,56 to 12,6
		if (payload.price) {
			payload.price = Number(payload.price.toFixed(1));
		}
		(event.getSource() as Component).setPayload(payload);
	}, this);
	spreadsheetUpload.openSpreadsheetUploadDialog();
	view.setBusy(false);
}
