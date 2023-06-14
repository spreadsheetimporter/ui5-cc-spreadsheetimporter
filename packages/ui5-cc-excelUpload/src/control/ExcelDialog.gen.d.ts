import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $DialogSettings } from "sap/m/Dialog";

declare module "./ExcelDialog" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $ExcelDialogSettings extends $DialogSettings {
        decimalSeparator?: string | PropertyBindingInfo;
        component?: object | PropertyBindingInfo | `{${string}}`;
        decimalSeparatorChanged?: (event: Event) => void;
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
        attachDecimalSeparatorChanged(fn: (event: Event) => void, listener?: object): this;

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
        attachDecimalSeparatorChanged<CustomDataType extends object>(data: CustomDataType, fn: (event: Event, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "decimalSeparatorChanged" event of this "ExcelDialog".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachDecimalSeparatorChanged(fn: (event: Event) => void, listener?: object): this;

        /**
         * Fires event "decimalSeparatorChanged" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        fireDecimalSeparatorChanged(parameters?: object): this;
    }
}
