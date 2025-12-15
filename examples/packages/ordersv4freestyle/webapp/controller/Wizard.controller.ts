import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import Component from "../Component";
import ComponentContainer from "sap/ui/core/ComponentContainer";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class WizardController extends Controller {
	public onInit(): void {
		// Controller initialization
	}

	/**
	 * Navigate back to main view
	 */
	public onNavBack(): void {
		const oRouter = (this.getOwnerComponent() as Component).getRouter();
		oRouter.navTo("RouteMainView");
	}

	/**
	 * Open wizard programmatically
	 */
	public openWizard(): void {
		// Get the spreadsheet importer component
		const oSpreadsheetUpload = this.byId("wizardSpreadsheetImporter") as ComponentContainer;

		if (oSpreadsheetUpload) {
			// Get the component instance
			const oComponent = oSpreadsheetUpload.getComponentInstance();

			if (oComponent) {
				// Open the wizard
				(oComponent as any)
					.openWizard()
					.then(function (result: { canceled: boolean }) {
						if (!result.canceled) {
							MessageToast.show("Wizard completed successfully!");
						} else {
							MessageToast.show("Wizard was canceled");
						}
					})
					.catch(function (error: Error) {
						MessageToast.show("Error opening wizard: " + error.message);
					});
			} else {
				MessageToast.show("Component not ready yet");
			}
		} else {
			MessageToast.show("Spreadsheet importer not found");
		}
	}
}
