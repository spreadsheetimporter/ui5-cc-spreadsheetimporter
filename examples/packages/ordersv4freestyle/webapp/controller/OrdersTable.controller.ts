import Controller from "sap/ui/core/mvc/Controller";
import Component from "../Component";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class OrdersTableController extends Controller {
	private spreadsheetUpload: Component;

	public onInit(): void {}

	public async onDownload(): Promise<void> {
		this.spreadsheetUpload = await (this.getOwnerComponent() as Component).createComponent({
			usage: "spreadsheetImporter",
			async: true,
			componentData: {
				context: this,
				createActiveEntity: true,
				debug: false,
				deepDownloadConfig: {
					deepLevel: 2,
					deepExport: true,
					addKeysToExport: true,
					showOptions: false,
					filename: "Orders123",
					columns: {
						OrderNo: {
							order: 1
						},
						buyer: {
							order: 3
						},
						Items: {
							quantity: {
								order: 2
							},
							title: {
								order: 4
							}
						},
						Shipping: {
							address: {
								order: 5
							}
						}
					}
				}
			}
		});

		// this.spreadsheetUpload.attachBeforeDownloadFileProcessing(this.onBeforeDownloadFileProcessing, this);
		// this.spreadsheetUpload.attachBeforeDownloadFileExport(this.onBeforeDownloadFileExport, this);

		(this.spreadsheetUpload as any).triggerDownloadSpreadsheet();
	}

	public async onMassUpdate(): Promise<void> {
		this.spreadsheetUpload = await (this.getOwnerComponent() as Component).createComponent({
			usage: "spreadsheetImporter",
			async: true,
			componentData: {
				context: this,
				action: "UPDATE",
				updateConfig: {
					fullUpdate: false
				}
			}
		});
		(this.spreadsheetUpload as any).openSpreadsheetUploadDialog();
	}

	// onBeforeDownloadFileProcessing: function (event) {
	//     event.getParameters().data.$XYZData[0].buyer = "Customer 123";
	// },

	// onBeforeDownloadFileExport: function (event) {
	//     event.getParameters().filename = "Orders123_modified";
	// }
}
