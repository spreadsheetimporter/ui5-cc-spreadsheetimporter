import Dialog from "sap/m/Dialog";
import RenderManager from "sap/ui/core/RenderManager";
import { AvailableOptions, AvailableOptionsType } from "../types";
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
			decimalSeparator: { type: "string" },
			availableOptions: { type: "string[]"},
			component  : { type: "object" }
		},
		events: {
			decimalSeparatorChanged: {},
			availableOptionsChanged: {},
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

	public setAvailableOptions(aAvailableOptions: AvailableOptions[]) {
		for (let option of aAvailableOptions) {
			if (!Object.values(AvailableOptions).includes(option as AvailableOptions)) {
				throw new Error("Invalid option: " + option);
			}
		}
		this.fireAvailableOptionsChanged({availableOptions : aAvailableOptions});
		return this;
	}

	static renderer = {
		apiVersion: 2,
		render(oRm: RenderManager, oControl: ExcelDialog) {
			sap.m.DialogRenderer.render(oRm, oControl);
		}
	};
}