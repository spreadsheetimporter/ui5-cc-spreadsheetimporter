import EventProvider from "sap/ui/base/EventProvider";
import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $DialogSettings } from "sap/m/Dialog";

declare module "./ExcelDialog" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $ExcelDialogSettings extends $DialogSettings {
        decimalSeparator?: string | PropertyBindingInfo;
        availableOptions?: string[] | PropertyBindingInfo | `{${string}}`;
        component?: object | PropertyBindingInfo | `{${string}}`;
        decimalSeparatorChanged?: (event: ExcelDialog$DecimalSeparatorChangedEvent) => void;
        availableOptionsChanged?: (event: ExcelDialog$AvailableOptionsChangedEvent) => void;
    }

    export default interface ExcelDialog {

        // property: decimalSeparator

        /**
         * Gets current value of property "decimalSeparator".
         *
         * @returns Value of property "decimalSeparator"
         */
        getDecimalSeparator(): string;

        /**
         * Sets a new value for property "decimalSeparator".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param decimalSeparator New value for property "decimalSeparator"
         * @returns Reference to "this" in order to allow method chaining
         */
        setDecimalSeparator(decimalSeparator: string): this;

        // property: availableOptions

        /**
         * Gets current value of property "availableOptions".
         *
         * @returns Value of property "availableOptions"
         */
        getAvailableOptions(): string[];

        /**
         * Sets a new value for property "availableOptions".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param availableOptions New value for property "availableOptions"
         * @returns Reference to "this" in order to allow method chaining
         */
        setAvailableOptions(availableOptions: string[]): this;

        // property: component

        /**
         * Gets current value of property "component".
         *
         * @returns Value of property "component"
         */
        getComponent(): object;

        /**
         * Sets a new value for property "component".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param component New value for property "component"
         * @returns Reference to "this" in order to allow method chaining
         */
        setComponent(component: object): this;

        // event: decimalSeparatorChanged

        /**
         * Attaches event handler "fn" to the "decimalSeparatorChanged" event of this "ExcelDialog".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "ExcelDialog" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "ExcelDialog" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachDecimalSeparatorChanged(fn: (event: ExcelDialog$DecimalSeparatorChangedEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "decimalSeparatorChanged" event of this "ExcelDialog".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "ExcelDialog" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "ExcelDialog" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachDecimalSeparatorChanged<CustomDataType extends object>(data: CustomDataType, fn: (event: ExcelDialog$DecimalSeparatorChangedEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "decimalSeparatorChanged" event of this "ExcelDialog".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachDecimalSeparatorChanged(fn: (event: ExcelDialog$DecimalSeparatorChangedEvent) => void, listener?: object): this;

        /**
         * Fires event "decimalSeparatorChanged" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @param [mParameters.decimalSeparator]
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        fireDecimalSeparatorChanged(parameters?: ExcelDialog$DecimalSeparatorChangedEventParameters): this;

        // event: availableOptionsChanged

        /**
         * Attaches event handler "fn" to the "availableOptionsChanged" event of this "ExcelDialog".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "ExcelDialog" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "ExcelDialog" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachAvailableOptionsChanged(fn: (event: ExcelDialog$AvailableOptionsChangedEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "availableOptionsChanged" event of this "ExcelDialog".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "ExcelDialog" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "ExcelDialog" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachAvailableOptionsChanged<CustomDataType extends object>(data: CustomDataType, fn: (event: ExcelDialog$AvailableOptionsChangedEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "availableOptionsChanged" event of this "ExcelDialog".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachAvailableOptionsChanged(fn: (event: ExcelDialog$AvailableOptionsChangedEvent) => void, listener?: object): this;

        /**
         * Fires event "availableOptionsChanged" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @param [mParameters.availableOptions]
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        fireAvailableOptionsChanged(parameters?: ExcelDialog$AvailableOptionsChangedEventParameters): this;
    }

    /**
     * Interface describing the parameters of ExcelDialog's 'decimalSeparatorChanged' event.
     */
    export interface ExcelDialog$DecimalSeparatorChangedEventParameters {
        decimalSeparator?: string;
    }

    /**
     * Interface describing the parameters of ExcelDialog's 'availableOptionsChanged' event.
     */
    export interface ExcelDialog$AvailableOptionsChangedEventParameters {
        availableOptions?: string[];
    }

    /**
     * Type describing the ExcelDialog's 'decimalSeparatorChanged' event.
     */
    export type ExcelDialog$DecimalSeparatorChangedEvent = Event<ExcelDialog$DecimalSeparatorChangedEventParameters>;

    /**
     * Type describing the ExcelDialog's 'availableOptionsChanged' event.
     */
    export type ExcelDialog$AvailableOptionsChangedEvent = Event<ExcelDialog$AvailableOptionsChangedEventParameters>;
}
// This module enhances sap.ui.base.Event with Generics, which is needed in UI5 type definition versions below 1.115
declare module "sap/ui/base/Event" {
    export default interface Event<ParamsType extends Record<string, any> = object> {
        constructor(id: string, oSource: EventProvider, parameters: ParamsType);
        getParameters(): ParamsType;
        getParameter<ParamName extends keyof ParamsType>(name: ParamName): ParamsType[ParamName];
    }
}
