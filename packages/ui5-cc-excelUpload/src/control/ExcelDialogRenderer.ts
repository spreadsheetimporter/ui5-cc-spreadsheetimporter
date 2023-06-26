import RenderManager from "sap/ui/core/RenderManager";
import ExcelDialog from "./ExcelDialog";
/**
 * @name cc.excelUpload.XXXnamespaceXXX.ExcelDialog
 */
export default {
	apiVersion: 2, // usage of DOM Patcher
	render: function (rm: RenderManager, control: ExcelDialog) {
		// @ts-ignore
		sap.m.DialogRenderer.render.apply(this, arguments);
	}
}
