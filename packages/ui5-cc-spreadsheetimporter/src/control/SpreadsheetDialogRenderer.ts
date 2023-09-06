import RenderManager from "sap/ui/core/RenderManager";
import SpreadsheetDialog from "./SpreadsheetDialog";
/**
 * @name cc.spreadsheetimporter.XXXnamespaceXXX.SpreadsheetDialog
 */
export default {
	// can´t use apiVersion: 2, because of support for 1.71, remove when out of support
	//apiVersion: 2,
	render: function (rm: RenderManager, control: SpreadsheetDialog) {
		// @ts-ignore
		sap.m.DialogRenderer.render.apply(this, arguments);
	}
};
