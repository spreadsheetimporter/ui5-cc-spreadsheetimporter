import Controller from "sap/ui/core/mvc/Controller";
import Component from "../Component";
import UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class MainViewController extends Controller {
	private spreadsheetUpload: UIComponent & { triggerDownloadSpreadsheet: () => void };

	public onInit(): void {}

	public goToSampleApp(): void {
		// open https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv4freestyle
		window.open("https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/tree/main/examples/packages/ordersv4freestyle", "_blank");
	}

	public async onDownload(): Promise<void> {
		this.spreadsheetUpload = (await (this.getOwnerComponent() as Component).createComponent({
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
		})) as UIComponent & { triggerDownloadSpreadsheet: () => void };

		// this.spreadsheetUpload.attachBeforeDownloadFileProcessing(this.onBeforeDownloadFileProcessing, this);
		// this.spreadsheetUpload.attachBeforeDownloadFileExport(this.onBeforeDownloadFileExport, this);

		this.spreadsheetUpload.triggerDownloadSpreadsheet();
	}

	public onNavToCDSPlugin(): void {
		const oRouter = (this.getOwnerComponent() as Component).getRouter();
		oRouter.navTo("RouteCDSPlugin");
	}

	public onNavToOrders(): void {
		const oRouter = (this.getOwnerComponent() as Component).getRouter();
		oRouter.navTo("RouteOrdersTable");
	}

	public onNavToWizard(): void {
		const oRouter = (this.getOwnerComponent() as Component).getRouter();
		oRouter.navTo("RouteWizard");
	}
}
