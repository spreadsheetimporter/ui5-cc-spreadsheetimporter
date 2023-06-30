import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $UIComponentSettings } from "sap/ui/core/UIComponent";

declare module "./Component" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $ComponentSettings extends $UIComponentSettings {
        spreadsheetFileName?: string | PropertyBindingInfo;
        context?: object | PropertyBindingInfo | `{${string}}`;
        columns?: string[] | PropertyBindingInfo | `{${string}}`;
        tableId?: string | PropertyBindingInfo;
        odataType?: string | PropertyBindingInfo;
        mandatoryFields?: string[] | PropertyBindingInfo | `{${string}}`;
        fieldMatchType?: string | PropertyBindingInfo;
        activateDraft?: boolean | PropertyBindingInfo | `{${string}}`;
        batchSize?: number | PropertyBindingInfo | `{${string}}`;
        standalone?: boolean | PropertyBindingInfo | `{${string}}`;
        strict?: boolean | PropertyBindingInfo | `{${string}}`;
        decimalSeparator?: string | PropertyBindingInfo;
        hidePreview?: boolean | PropertyBindingInfo | `{${string}}`;
        skipMandatoryFieldCheck?: boolean | PropertyBindingInfo | `{${string}}`;
        showBackendErrorMessages?: boolean | PropertyBindingInfo | `{${string}}`;
        showOptions?: boolean | PropertyBindingInfo | `{${string}}`;
        availableOptions?: string[] | PropertyBindingInfo | `{${string}}`;
        hideSampleData?: boolean | PropertyBindingInfo | `{${string}}`;
        debug?: boolean | PropertyBindingInfo | `{${string}}`;
        checkBeforeRead?: (event: Component$CheckBeforeReadEvent) => void;
        changeBeforeCreate?: (event: Component$ChangeBeforeCreateEvent) => void;
        uploadButtonPress?: (event: Component$UploadButtonPressEvent) => void;
    }

    export default interface Component {

        // property: spreadsheetFileName

        /**
         * Gets current value of property "spreadsheetFileName".
         *
         * Default value is: "Template.xlsx"
         * @returns Value of property "spreadsheetFileName"
         */
        getSpreadsheetFileName(): string;

        /**
         * Sets a new value for property "spreadsheetFileName".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: "Template.xlsx"
         * @param [spreadsheetFileName="Template.xlsx"] New value for property "spreadsheetFileName"
         * @returns Reference to "this" in order to allow method chaining
         */
        setSpreadsheetFileName(spreadsheetFileName: string): this;

        // property: context

        /**
         * Gets current value of property "context".
         *
         * @returns Value of property "context"
         */
        getContext(): object;

        /**
         * Sets a new value for property "context".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param context New value for property "context"
         * @returns Reference to "this" in order to allow method chaining
         */
        setContext(context: object): this;

        // property: columns

        /**
         * Gets current value of property "columns".
         *
         * Default value is: []
         * @returns Value of property "columns"
         */
        getColumns(): string[];

        /**
         * Sets a new value for property "columns".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: []
         * @param [columns=[]] New value for property "columns"
         * @returns Reference to "this" in order to allow method chaining
         */
        setColumns(columns: string[]): this;

        // property: tableId

        /**
         * Gets current value of property "tableId".
         *
         * @returns Value of property "tableId"
         */
        getTableId(): string;

        /**
         * Sets a new value for property "tableId".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param tableId New value for property "tableId"
         * @returns Reference to "this" in order to allow method chaining
         */
        setTableId(tableId: string): this;

        // property: odataType

        /**
         * Gets current value of property "odataType".
         *
         * @returns Value of property "odataType"
         */
        getOdataType(): string;

        /**
         * Sets a new value for property "odataType".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param odataType New value for property "odataType"
         * @returns Reference to "this" in order to allow method chaining
         */
        setOdataType(odataType: string): this;

        // property: mandatoryFields

        /**
         * Gets current value of property "mandatoryFields".
         *
         * Default value is: []
         * @returns Value of property "mandatoryFields"
         */
        getMandatoryFields(): string[];

        /**
         * Sets a new value for property "mandatoryFields".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: []
         * @param [mandatoryFields=[]] New value for property "mandatoryFields"
         * @returns Reference to "this" in order to allow method chaining
         */
        setMandatoryFields(mandatoryFields: string[]): this;

        // property: fieldMatchType

        /**
         * Gets current value of property "fieldMatchType".
         *
         * Default value is: "labelTypeBrackets"
         * @returns Value of property "fieldMatchType"
         */
        getFieldMatchType(): string;

        /**
         * Sets a new value for property "fieldMatchType".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: "labelTypeBrackets"
         * @param [fieldMatchType="labelTypeBrackets"] New value for property "fieldMatchType"
         * @returns Reference to "this" in order to allow method chaining
         */
        setFieldMatchType(fieldMatchType: string): this;

        // property: activateDraft

        /**
         * Gets current value of property "activateDraft".
         *
         * Default value is: false
         * @returns Value of property "activateDraft"
         */
        getActivateDraft(): boolean;

        /**
         * Sets a new value for property "activateDraft".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: false
         * @param [activateDraft=false] New value for property "activateDraft"
         * @returns Reference to "this" in order to allow method chaining
         */
        setActivateDraft(activateDraft: boolean): this;

        // property: batchSize

        /**
         * Gets current value of property "batchSize".
         *
         * Default value is: 1000
         * @returns Value of property "batchSize"
         */
        getBatchSize(): number;

        /**
         * Sets a new value for property "batchSize".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: 1000
         * @param [batchSize=1000] New value for property "batchSize"
         * @returns Reference to "this" in order to allow method chaining
         */
        setBatchSize(batchSize: number): this;

        // property: standalone

        /**
         * Gets current value of property "standalone".
         *
         * Default value is: false
         * @returns Value of property "standalone"
         */
        getStandalone(): boolean;

        /**
         * Sets a new value for property "standalone".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: false
         * @param [standalone=false] New value for property "standalone"
         * @returns Reference to "this" in order to allow method chaining
         */
        setStandalone(standalone: boolean): this;

        // property: strict

        /**
         * Gets current value of property "strict".
         *
         * Default value is: false
         * @returns Value of property "strict"
         */
        getStrict(): boolean;

        /**
         * Sets a new value for property "strict".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: false
         * @param [strict=false] New value for property "strict"
         * @returns Reference to "this" in order to allow method chaining
         */
        setStrict(strict: boolean): this;

        // property: decimalSeparator

        /**
         * Gets current value of property "decimalSeparator".
         *
         * Default value is: ""
         * @returns Value of property "decimalSeparator"
         */
        getDecimalSeparator(): string;

        /**
         * Sets a new value for property "decimalSeparator".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [decimalSeparator=""] New value for property "decimalSeparator"
         * @returns Reference to "this" in order to allow method chaining
         */
        setDecimalSeparator(decimalSeparator: string): this;

        // property: hidePreview

        /**
         * Gets current value of property "hidePreview".
         *
         * Default value is: false
         * @returns Value of property "hidePreview"
         */
        getHidePreview(): boolean;

        /**
         * Sets a new value for property "hidePreview".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: false
         * @param [hidePreview=false] New value for property "hidePreview"
         * @returns Reference to "this" in order to allow method chaining
         */
        setHidePreview(hidePreview: boolean): this;

        // property: skipMandatoryFieldCheck

        /**
         * Gets current value of property "skipMandatoryFieldCheck".
         *
         * Default value is: false
         * @returns Value of property "skipMandatoryFieldCheck"
         */
        getSkipMandatoryFieldCheck(): boolean;

        /**
         * Sets a new value for property "skipMandatoryFieldCheck".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: false
         * @param [skipMandatoryFieldCheck=false] New value for property "skipMandatoryFieldCheck"
         * @returns Reference to "this" in order to allow method chaining
         */
        setSkipMandatoryFieldCheck(skipMandatoryFieldCheck: boolean): this;

        // property: showBackendErrorMessages

        /**
         * Gets current value of property "showBackendErrorMessages".
         *
         * Default value is: false
         * @returns Value of property "showBackendErrorMessages"
         */
        getShowBackendErrorMessages(): boolean;

        /**
         * Sets a new value for property "showBackendErrorMessages".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: false
         * @param [showBackendErrorMessages=false] New value for property "showBackendErrorMessages"
         * @returns Reference to "this" in order to allow method chaining
         */
        setShowBackendErrorMessages(showBackendErrorMessages: boolean): this;

        // property: showOptions

        /**
         * Gets current value of property "showOptions".
         *
         * Default value is: false
         * @returns Value of property "showOptions"
         */
        getShowOptions(): boolean;

        /**
         * Sets a new value for property "showOptions".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: false
         * @param [showOptions=false] New value for property "showOptions"
         * @returns Reference to "this" in order to allow method chaining
         */
        setShowOptions(showOptions: boolean): this;

        // property: availableOptions

        /**
         * Gets current value of property "availableOptions".
         *
         * Default value is: []
         * @returns Value of property "availableOptions"
         */
        getAvailableOptions(): string[];

        /**
         * Sets a new value for property "availableOptions".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: []
         * @param [availableOptions=[]] New value for property "availableOptions"
         * @returns Reference to "this" in order to allow method chaining
         */
        setAvailableOptions(availableOptions: string[]): this;

        // property: hideSampleData

        /**
         * Gets current value of property "hideSampleData".
         *
         * Default value is: false
         * @returns Value of property "hideSampleData"
         */
        getHideSampleData(): boolean;

        /**
         * Sets a new value for property "hideSampleData".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: false
         * @param [hideSampleData=false] New value for property "hideSampleData"
         * @returns Reference to "this" in order to allow method chaining
         */
        setHideSampleData(hideSampleData: boolean): this;

        // property: debug

        /**
         * Gets current value of property "debug".
         *
         * Default value is: false
         * @returns Value of property "debug"
         */
        getDebug(): boolean;

        /**
         * Sets a new value for property "debug".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: false
         * @param [debug=false] New value for property "debug"
         * @returns Reference to "this" in order to allow method chaining
         */
        setDebug(debug: boolean): this;

        // event: checkBeforeRead

        /**
         * Attaches event handler "fn" to the "checkBeforeRead" event of this "Component".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "Component" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "Component" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachCheckBeforeRead(fn: (event: Component$CheckBeforeReadEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "checkBeforeRead" event of this "Component".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "Component" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "Component" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachCheckBeforeRead<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$CheckBeforeReadEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "checkBeforeRead" event of this "Component".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachCheckBeforeRead(fn: (event: Component$CheckBeforeReadEvent) => void, listener?: object): this;

        /**
         * Fires event "checkBeforeRead" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @param [mParameters.sheetData]
         * @param [mParameters.messages]
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        fireCheckBeforeRead(parameters?: Component$CheckBeforeReadEventParameters): this;

        // event: changeBeforeCreate

        /**
         * Attaches event handler "fn" to the "changeBeforeCreate" event of this "Component".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "Component" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "Component" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachChangeBeforeCreate(fn: (event: Component$ChangeBeforeCreateEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "changeBeforeCreate" event of this "Component".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "Component" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "Component" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachChangeBeforeCreate<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$ChangeBeforeCreateEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "changeBeforeCreate" event of this "Component".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachChangeBeforeCreate(fn: (event: Component$ChangeBeforeCreateEvent) => void, listener?: object): this;

        /**
         * Fires event "changeBeforeCreate" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @param [mParameters.payload]
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        fireChangeBeforeCreate(parameters?: Component$ChangeBeforeCreateEventParameters): this;

        // event: uploadButtonPress

        /**
         * Attaches event handler "fn" to the "uploadButtonPress" event of this "Component".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "Component" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "Component" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachUploadButtonPress(fn: (event: Component$UploadButtonPressEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "uploadButtonPress" event of this "Component".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "Component" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "Component" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachUploadButtonPress<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$UploadButtonPressEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "uploadButtonPress" event of this "Component".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachUploadButtonPress(fn: (event: Component$UploadButtonPressEvent) => void, listener?: object): this;

        /**
         * Fires event "uploadButtonPress" to attached listeners.
         *
         * Listeners may prevent the default action of this event by calling the "preventDefault" method on the event object.
         * The return value of this method indicates whether the default action should be executed.
         *
         * @param parameters Parameters to pass along with the event
         * @param [mParameters.payload]
         *
         * @returns Whether or not to prevent the default action
         */
        fireUploadButtonPress(parameters?: Component$UploadButtonPressEventParameters): boolean;
    }

    /**
     * Interface describing the parameters of Component's 'checkBeforeRead' event.
     */
    export interface Component$CheckBeforeReadEventParameters {
        sheetData?: object;
        messages?: object;
    }

    /**
     * Interface describing the parameters of Component's 'changeBeforeCreate' event.
     */
    export interface Component$ChangeBeforeCreateEventParameters {
        payload?: object;
    }

    /**
     * Interface describing the parameters of Component's 'uploadButtonPress' event.
     */
    export interface Component$UploadButtonPressEventParameters {
        payload?: object;
    }

    /**
     * Type describing the Component's 'checkBeforeRead' event.
     */
    export type Component$CheckBeforeReadEvent = Event<Component$CheckBeforeReadEventParameters>;

    /**
     * Type describing the Component's 'changeBeforeCreate' event.
     */
    export type Component$ChangeBeforeCreateEvent = Event<Component$ChangeBeforeCreateEventParameters>;

    /**
     * Type describing the Component's 'uploadButtonPress' event.
     */
    export type Component$UploadButtonPressEvent = Event<Component$UploadButtonPressEventParameters>;
}
