import RenderManager from "sap/ui/core/RenderManager";
import ExcelDialog from "./ExcelDialog";
/**
 * @name cc.excelUpload.XXXnamespaceXXX.ExcelDialog
 */
export default {
	// can´t use apiVersion: 2, because of support for 1.71, remove when out of support
	//apiVersion: 2,
	render: function (rm: RenderManager, control: ExcelDialog) {
		// @ts-ignore
		sap.m.DialogRenderer.render.apply(this, arguments);
	}
}
