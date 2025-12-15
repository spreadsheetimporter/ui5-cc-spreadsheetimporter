/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

import UIComponent from "sap/ui/core/UIComponent";
import Device from "sap/ui/Device";
import models from "ordersv4freestyle/model/models";

/**
 * @namespace ordersv4freestyle
 */
export default class Component extends UIComponent {
	public static metadata = {
		manifest: "json"
	};

	/**
	 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
	 * @public
	 * @override
	 */
	public init(): void {
		// call the base component's init function
		super.init();

		// enable routing
		this.getRouter().initialize();

		// set the device model
		this.setModel(models.createDeviceModel(), "device");
	}
}
