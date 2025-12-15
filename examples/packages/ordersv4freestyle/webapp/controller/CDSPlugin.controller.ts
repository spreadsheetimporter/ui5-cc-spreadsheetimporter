import Controller from "sap/ui/core/mvc/Controller";
import Component from "../Component";

/**
 * @namespace ordersv4freestyle.controller
 */
export default class CDSPluginController extends Controller {
	public onInit(): void {}

	public onNavBack(): void {
		(this.getOwnerComponent() as Component).getRouter().navTo("RouteMainView", {}, true);
	}
}
