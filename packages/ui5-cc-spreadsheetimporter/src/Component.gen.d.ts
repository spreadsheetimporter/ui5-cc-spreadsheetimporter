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
        sampleData?: object | PropertyBindingInfo | `{${string}}`;
        useTableSelector?: boolean | PropertyBindingInfo | `{${string}}`;
        readAllSheets?: boolean | PropertyBindingInfo | `{${string}}`;
        readSheet?: any | PropertyBindingInfo | `{${string}}`;
        debug?: boolean | PropertyBindingInfo | `{${string}}`;
        componentContainerData?: object | PropertyBindingInfo | `{${string}}`;
        checkBeforeRead?: (event: Component$CheckBeforeReadEvent) => void;
        changeBeforeCreate?: (event: Component$ChangeBeforeCreateEvent) => void;
        requestCompleted?: (event: Component$RequestCompletedEvent) => void;
        uploadButtonPress?: (event: Component$UploadButtonPressEvent) => void;
    }

    export default interface Component {

        // property: spreadsheetFileName
        getSpreadsheetFileName(): string;
        setSpreadsheetFileName(spreadsheetFileName: string): this;

        // property: context
        getContext(): object;
        setContext(context: object): this;

        // property: columns
        getColumns(): string[];
        setColumns(columns: string[]): this;

        // property: tableId
        getTableId(): string;
        setTableId(tableId: string): this;

        // property: odataType
        getOdataType(): string;
        setOdataType(odataType: string): this;

        // property: mandatoryFields
        getMandatoryFields(): string[];
        setMandatoryFields(mandatoryFields: string[]): this;

        // property: fieldMatchType
        getFieldMatchType(): string;
        setFieldMatchType(fieldMatchType: string): this;

        // property: activateDraft
        getActivateDraft(): boolean;
        setActivateDraft(activateDraft: boolean): this;

        // property: batchSize
        getBatchSize(): number;
        setBatchSize(batchSize: number): this;

        // property: standalone
        getStandalone(): boolean;
        setStandalone(standalone: boolean): this;

        // property: strict
        getStrict(): boolean;
        setStrict(strict: boolean): this;

        // property: decimalSeparator
        getDecimalSeparator(): string;
        setDecimalSeparator(decimalSeparator: string): this;

        // property: hidePreview
        getHidePreview(): boolean;
        setHidePreview(hidePreview: boolean): this;

        // property: skipMandatoryFieldCheck
        getSkipMandatoryFieldCheck(): boolean;
        setSkipMandatoryFieldCheck(skipMandatoryFieldCheck: boolean): this;

        // property: showBackendErrorMessages
        getShowBackendErrorMessages(): boolean;
        setShowBackendErrorMessages(showBackendErrorMessages: boolean): this;

        // property: showOptions
        getShowOptions(): boolean;
        setShowOptions(showOptions: boolean): this;

        // property: availableOptions
        getAvailableOptions(): string[];
        setAvailableOptions(availableOptions: string[]): this;

        // property: hideSampleData
        getHideSampleData(): boolean;
        setHideSampleData(hideSampleData: boolean): this;

        // property: sampleData
        getSampleData(): object;
        setSampleData(sampleData: object): this;

        // property: useTableSelector
        getUseTableSelector(): boolean;
        setUseTableSelector(useTableSelector: boolean): this;

        // property: readAllSheets
        getReadAllSheets(): boolean;
        setReadAllSheets(readAllSheets: boolean): this;

        // property: readSheet
        getReadSheet(): any;
        setReadSheet(readSheet: any): this;

        // property: debug
        getDebug(): boolean;
        setDebug(debug: boolean): this;

        // property: componentContainerData
        getComponentContainerData(): object;
        setComponentContainerData(componentContainerData: object): this;

        // event: checkBeforeRead
        attachCheckBeforeRead(fn: (event: Component$CheckBeforeReadEvent) => void, listener?: object): this;
        attachCheckBeforeRead<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$CheckBeforeReadEvent, data: CustomDataType) => void, listener?: object): this;
        detachCheckBeforeRead(fn: (event: Component$CheckBeforeReadEvent) => void, listener?: object): this;
        fireCheckBeforeRead(parameters?: Component$CheckBeforeReadEventParameters): this;

        // event: changeBeforeCreate
        attachChangeBeforeCreate(fn: (event: Component$ChangeBeforeCreateEvent) => void, listener?: object): this;
        attachChangeBeforeCreate<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$ChangeBeforeCreateEvent, data: CustomDataType) => void, listener?: object): this;
        detachChangeBeforeCreate(fn: (event: Component$ChangeBeforeCreateEvent) => void, listener?: object): this;
        fireChangeBeforeCreate(parameters?: Component$ChangeBeforeCreateEventParameters): this;

        // event: requestCompleted

        /**
         * Attaches event handler "fn" to the "requestCompleted" event of this "Component".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "Component" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "Component" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachRequestCompleted(fn: (event: Component$RequestCompletedEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "requestCompleted" event of this "Component".
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
        attachRequestCompleted<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$RequestCompletedEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "requestCompleted" event of this "Component".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachRequestCompleted(fn: (event: Component$RequestCompletedEvent) => void, listener?: object): this;

        /**
         * Fires event "requestCompleted" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @param [mParameters.success]
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        fireRequestCompleted(parameters?: Component$RequestCompletedEventParameters): this;

        // event: uploadButtonPress
        attachUploadButtonPress(fn: (event: Component$UploadButtonPressEvent) => void, listener?: object): this;
        attachUploadButtonPress<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$UploadButtonPressEvent, data: CustomDataType) => void, listener?: object): this;
        detachUploadButtonPress(fn: (event: Component$UploadButtonPressEvent) => void, listener?: object): this;
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
     * Interface describing the parameters of Component's 'requestCompleted' event.
     */
    export interface Component$RequestCompletedEventParameters {
        success?: boolean;
    }

    /**
     * Interface describing the parameters of Component's 'uploadButtonPress' event.
     */
    export interface Component$UploadButtonPressEventParameters {
        payload?: object;
        rawData?: object;
        parsedData?: object;
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
     * Type describing the Component's 'requestCompleted' event.
     */
    export type Component$RequestCompletedEvent = Event<Component$RequestCompletedEventParameters>;

    /**
     * Type describing the Component's 'uploadButtonPress' event.
     */
    export type Component$UploadButtonPressEvent = Event<Component$UploadButtonPressEventParameters>;
}
