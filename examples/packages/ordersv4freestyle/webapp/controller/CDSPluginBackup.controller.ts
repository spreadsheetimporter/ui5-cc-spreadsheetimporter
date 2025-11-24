import Controller from "sap/ui/core/mvc/Controller";
import MessageToast from "sap/m/MessageToast";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import Component from "../Component";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class CDSPluginBackupController extends Controller {
	public onInit(): void {}

	public onNavBack(): void {
		(this.getOwnerComponent() as Component).getRouter().navTo("RouteMainView", {}, true);
	}
}
