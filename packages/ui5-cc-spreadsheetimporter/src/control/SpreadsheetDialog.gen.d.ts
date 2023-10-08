import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $DialogSettings } from "sap/m/Dialog";

declare module "./SpreadsheetDialog" {
	/**
	 * Interface defining the settings object used in constructor calls
	 */
	interface $SpreadsheetDialogSettings extends $DialogSettings {
		decimalSeparator?: string | PropertyBindingInfo;
		availableOptions?: string[] | PropertyBindingInfo | `{${string}}`;
		component?: object | PropertyBindingInfo | `{${string}}`;
		decimalSeparatorChanged?: (event: SpreadsheetDialog$DecimalSeparatorChangedEvent) => void;
		availableOptionsChanged?: (event: SpreadsheetDialog$AvailableOptionsChangedEvent) => void;
	}

	export default interface SpreadsheetDialog {
		// property: decimalSeparator
		getDecimalSeparator(): string;
		setDecimalSeparator(decimalSeparator: string): this;

		// property: availableOptions
		getAvailableOptions(): string[];
		setAvailableOptions(availableOptions: string[]): this;

		// property: component
		getComponent(): object;
		setComponent(component: object): this;

		// event: decimalSeparatorChanged
		attachDecimalSeparatorChanged(fn: (event: SpreadsheetDialog$DecimalSeparatorChangedEvent) => void, listener?: object): this;
		attachDecimalSeparatorChanged<CustomDataType extends object>(
			data: CustomDataType,
			fn: (event: SpreadsheetDialog$DecimalSeparatorChangedEvent, data: CustomDataType) => void,
			listener?: object
		): this;
		detachDecimalSeparatorChanged(fn: (event: SpreadsheetDialog$DecimalSeparatorChangedEvent) => void, listener?: object): this;
		fireDecimalSeparatorChanged(parameters?: SpreadsheetDialog$DecimalSeparatorChangedEventParameters): this;

		// event: availableOptionsChanged
		attachAvailableOptionsChanged(fn: (event: SpreadsheetDialog$AvailableOptionsChangedEvent) => void, listener?: object): this;
		attachAvailableOptionsChanged<CustomDataType extends object>(
			data: CustomDataType,
			fn: (event: SpreadsheetDialog$AvailableOptionsChangedEvent, data: CustomDataType) => void,
			listener?: object
		): this;
		detachAvailableOptionsChanged(fn: (event: SpreadsheetDialog$AvailableOptionsChangedEvent) => void, listener?: object): this;
		fireAvailableOptionsChanged(parameters?: SpreadsheetDialog$AvailableOptionsChangedEventParameters): this;
	}

	/**
	 * Interface describing the parameters of SpreadsheetDialog's 'decimalSeparatorChanged' event.
	 */
	export interface SpreadsheetDialog$DecimalSeparatorChangedEventParameters {
		decimalSeparator?: string;
	}

	/**
	 * Interface describing the parameters of SpreadsheetDialog's 'availableOptionsChanged' event.
	 */
	export interface SpreadsheetDialog$AvailableOptionsChangedEventParameters {
		availableOptions?: string[];
	}

	/**
	 * Type describing the SpreadsheetDialog's 'decimalSeparatorChanged' event.
	 */
	export type SpreadsheetDialog$DecimalSeparatorChangedEvent = Event<SpreadsheetDialog$DecimalSeparatorChangedEventParameters>;

	/**
	 * Type describing the SpreadsheetDialog's 'availableOptionsChanged' event.
	 */
	export type SpreadsheetDialog$AvailableOptionsChangedEvent = Event<SpreadsheetDialog$AvailableOptionsChangedEventParameters>;
}
