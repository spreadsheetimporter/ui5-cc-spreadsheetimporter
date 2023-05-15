import Dialog from "sap/m/Dialog";
import RenderManager from "sap/ui/core/RenderManager";
/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class ExcelDialog extends Dialog {

	constructor(idOrSettings?: string | $ExcelDialogSettings);
	constructor(id?: string, settings?: $ExcelDialogSettings);
	constructor(id?: string, settings?: $ExcelDialogSettings) {
		super(id, settings);
	}

	public static metadata = {
		interfaces: ["sap.ui.core.IAsyncContentCreation"],
		manifest: "json",
		properties: {
			decimalSeparator: { type: "string" }
		},
		events: {
			decimalSeparatorChanged: {}
		  }
	};

	public setDecimalSeparator(sDecimalSeparator: string) {
		if (sDecimalSeparator === "," || sDecimalSeparator === ".") {
			this.setProperty("decimalSeparator", sDecimalSeparator);
		this.fireDecimalSeparatorChanged({decimalSeparator: sDecimalSeparator});
			return this;
		} else {
			throw new Error("Decimal separator must be either ',' or '.'");
		}
	}

	static renderer = {
		apiVersion: 2,
		render(oRm: RenderManager, oControl: ExcelDialog) {
			sap.m.DialogRenderer.render(oRm, oControl);
		}
	};
}