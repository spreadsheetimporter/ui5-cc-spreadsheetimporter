import Dialog from "sap/m/Dialog";
import type { MetadataOptions } from "sap/ui/core/Element";
import { AvailableOptions } from "../enums";
import SpreadsheetDialogRenderer from "./SpreadsheetDialogRenderer";
/**
 * Constructor for a new <code>cc.spreadsheetimporter.XXXnamespaceXXX.SpreadsheetDialog</code> control.
 *
 * Some class description goes here.
 * @extends Dialog
 *
 * @constructor
 * @public
 * @name cc.spreadsheetimporter.XXXnamespaceXXX.SpreadsheetDialog
 */
export default class SpreadsheetDialog extends Dialog {
	constructor(id?: string | $SpreadsheetDialogSettings);
	constructor(id?: string, settings?: $SpreadsheetDialogSettings);
	constructor(id?: string, settings?: $SpreadsheetDialogSettings) {
		super(id, settings);
	}

	static readonly metadata: MetadataOptions = {
		properties: {
			decimalSeparator: { type: "string" },
			availableOptions: { type: "string[]" },
			component: { type: "object" }
		},
		events: {
			decimalSeparatorChanged: {
				parameters: {
					decimalSeparator: { type: "string" }
				}
			},
			availableOptionsChanged: {
				parameters: {
					availableOptions: { type: "string[]" }
				}
			}
		}
	};

	public setDecimalSeparator(sDecimalSeparator: string) {
		if (sDecimalSeparator === "," || sDecimalSeparator === ".") {
			this.setProperty("decimalSeparator", sDecimalSeparator);
			this.fireDecimalSeparatorChanged({ decimalSeparator: sDecimalSeparator } as SpreadsheetDialog$DecimalSeparatorChangedEventParameters);
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
		this.fireAvailableOptionsChanged({ availableOptions: aAvailableOptions }) as SpreadsheetDialog$AvailableOptionsChangedEventParameters;
		return this;
	}

	//static renderer: typeof sap.m.DialogRenderer = sap.m.DialogRenderer;

	//InputRenderer =  // Renderer is sap/ui/core/Renderer !

	static renderer: typeof SpreadsheetDialogRenderer = SpreadsheetDialogRenderer;
}
