import ExtensionAPI from "sap/fe/core/ExtensionAPI";
import { ExcelUploadComponent } from "ui5-cc-excelupload";
/**
 * Generated event handler.
 *
 * @param this reference to the 'this' that the event handler is bound to.
 * @param pageContext the context of the page on which the event was fired
 */
export async function openExcelUploadDialog(this: ExtensionAPI) {
	let excelUpload = this.getRouting().getView().getController().excelUpload as ExcelUploadComponent;
	this.getRouting().getView().setBusyIndicatorDelay(0);
	this.getRouting().getView().setBusy(true);
	if (!this.getRouting().getView().getController().excelUpload) {
		excelUpload = await this.getRouting()
			.getView()
			.getController()
			.getAppComponent()
			.createComponent({
				usage: "excelUpload",
				async: true,
				componentData: {
					context: this,
					activateDraft: true
				}
			});
		this.getRouting().getView().getController().excelUpload = excelUpload;
		// event to check before uploaded to app
		excelUpload.attachCheckBeforeRead(function (oEvent) {
			// example
			const sheetData = oEvent.getParameter("sheetData");
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
			oEvent.getSource().addArrayToMessages(errorArray);
		}, this);

		// event example to prevent uploading data to backend
		excelUpload.attachUploadButtonPress(function (event) {
			//event.preventDefault();
		}, this);

		// event to change data before send to backend
		excelUpload.attachChangeBeforeCreate(function (oEvent) {
			let payload = oEvent.getParameter("payload");
			// round number from 12,56 to 12,6
			if (payload.price) {
				payload.price = Number(payload.price.toFixed(1));
			}
			oEvent.getSource().setPayload(payload);
		}, this);
	}
	excelUpload.openExcelUploadDialog();
	this.getRouting().getView().setBusy(false);
}
