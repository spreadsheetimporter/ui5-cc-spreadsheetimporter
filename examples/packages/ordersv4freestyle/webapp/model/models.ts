import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";

/**
 * provide app-view type models (as in the first "V" in MVVC)
 *
 * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
 */
const models = {
	createDeviceModel: function (): JSONModel {
		const oModel = new JSONModel(Device);
		oModel.setDefaultBindingMode("OneWay");
		return oModel;
	}
};

export default models;
