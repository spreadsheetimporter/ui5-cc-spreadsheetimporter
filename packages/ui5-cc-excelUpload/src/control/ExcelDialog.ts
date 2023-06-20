import Dialog from "sap/m/Dialog";
import { AvailableOptions, AvailableOptionsType } from "../types";
import type { MetadataOptions } from "sap/ui/core/Element";
/**
 * Constructor for a new <code>cc.excelUpload.XXXnamespaceXXX.ExcelDialog</code> control.
 *
 * Some class description goes here.
 * @extends Dialog
 *
 * @constructor
 * @public
 * @name cc.excelUpload.XXXnamespaceXXX.ExcelDialog
 */
export default class ExcelDialog extends Dialog {
	constructor(id?: string | $ExcelDialogSettings);
	constructor(id?: string, settings?: $ExcelDialogSettings);
	constructor(id?: string, settings?: $ExcelDialogSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		properties: {
			decimalSeparator: { type: "string" },
			availableOptions: { type: "string[]" },
			component: { type: "object" },
		},
		events: {
			decimalSeparatorChanged: {},
			availableOptionsChanged: {},
		},
	};

	public setDecimalSeparator(sDecimalSeparator: string) {
		if (sDecimalSeparator === "," || sDecimalSeparator === ".") {
			this.setProperty("decimalSeparator", sDecimalSeparator);
			this.fireDecimalSeparatorChanged({ decimalSeparator: sDecimalSeparator });
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
		this.setProperty("availableOptions", aAvailableOptions);
		this.fireAvailableOptionsChanged({ availableOptions: aAvailableOptions });
		return this;
	}

	static renderer: typeof sap.m.DialogRenderer = sap.m.DialogRenderer;
}
