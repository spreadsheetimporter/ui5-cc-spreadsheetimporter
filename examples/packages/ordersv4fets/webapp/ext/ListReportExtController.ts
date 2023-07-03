import Component, { Component$CheckBeforeReadEventParameters } from "cc/spreadsheetimporter/v0_21_2/Component";
import ExtensionAPI from "sap/fe/core/ExtensionAPI";
import Event from "sap/ui/base/Event";
/**
 * Generated event handler.
 *
 * @param this reference to the 'this' that the event handler is bound to.
 * @param pageContext the context of the page on which the event was fired
 */
export async function openSpreadsheetUploadDialog(this: ExtensionAPI) {
	const view = this.getRouting().getView();
	const controller = view.getController();
	let spreadsheetUpload = controller.spreadsheetUpload as Component;
	view.setBusyIndicatorDelay(0);
	view.setBusy(true);
	if (!controller.spreadsheetUpload) {
		spreadsheetUpload = await this.getRouting()
			.getView()
			.getController()
			.getAppComponent()
			.createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this,
					activateDraft: true
				}
			});
		controller.spreadsheetUpload = spreadsheetUpload;
		// event to check before uploaded to app
		spreadsheetUpload.attachCheckBeforeRead(function (event: Event<Component$CheckBeforeReadEventParameters>) {
			// example
			const sheetData = event.getParameter("sheetData");
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
			event.getSource().addArrayToMessages(errorArray);
		}, this);

		// event example to prevent uploading data to backend
		spreadsheetUpload.attachUploadButtonPress(function (event: Event<Component$UploadButtonPressEventParameters>) {
			//event.preventDefault();
		}, this);

		// event to change data before send to backend
		spreadsheetUpload.attachChangeBeforeCreate(function (event: Event<Component$ChangeBeforeCreateEventParameters>) {
			let payload = event.getParameter("payload");
			// round number from 12,56 to 12,6
			if (payload.price) {
				payload.price = Number(payload.price.toFixed(1));
			}
			event.getSource().setPayload(payload);
		}, this);
	}
	spreadsheetUpload.openSpreadsheetUploadDialog();
	view.setBusy(false);
}
