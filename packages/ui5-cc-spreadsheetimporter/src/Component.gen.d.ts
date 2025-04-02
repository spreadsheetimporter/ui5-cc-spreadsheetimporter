import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $UIComponentSettings } from "sap/ui/core/UIComponent";

declare module "./Component" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $ComponentSettings extends $UIComponentSettings {
        spreadsheetFileName?: string | PropertyBindingInfo;
        action?: string | PropertyBindingInfo;
        context?: object | PropertyBindingInfo | `{${string}}`;
        columns?: string[] | PropertyBindingInfo | `{${string}}`;
        excludeColumns?: string[] | PropertyBindingInfo | `{${string}}`;
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
        previewColumns?: string[] | PropertyBindingInfo | `{${string}}`;
        skipMandatoryFieldCheck?: boolean | PropertyBindingInfo | `{${string}}`;
        skipColumnsCheck?: boolean | PropertyBindingInfo | `{${string}}`;
        skipMaxLengthCheck?: boolean | PropertyBindingInfo | `{${string}}`;
        showBackendErrorMessages?: boolean | PropertyBindingInfo | `{${string}}`;
        showOptions?: boolean | PropertyBindingInfo | `{${string}}`;
        availableOptions?: string[] | PropertyBindingInfo | `{${string}}`;
        hideSampleData?: boolean | PropertyBindingInfo | `{${string}}`;
        sampleData?: object | PropertyBindingInfo | `{${string}}`;
        spreadsheetTemplateFile?: any | PropertyBindingInfo | `{${string}}`;
        useTableSelector?: boolean | PropertyBindingInfo | `{${string}}`;
        readAllSheets?: boolean | PropertyBindingInfo | `{${string}}`;
        readSheet?: any | PropertyBindingInfo | `{${string}}`;
        spreadsheetRowPropertyName?: string | PropertyBindingInfo;
        continueOnError?: boolean | PropertyBindingInfo | `{${string}}`;
        createActiveEntity?: boolean | PropertyBindingInfo | `{${string}}`;
        i18nModel?: object | PropertyBindingInfo | `{${string}}`;
        debug?: boolean | PropertyBindingInfo | `{${string}}`;
        componentContainerData?: object | PropertyBindingInfo | `{${string}}`;
        bindingCustom?: object | PropertyBindingInfo | `{${string}}`;
        showDownloadButton?: boolean | PropertyBindingInfo | `{${string}}`;
        deepDownloadConfig?: object | PropertyBindingInfo | `{${string}}`;
        readSheetCoordinates?: string | PropertyBindingInfo;
        updateConfig?: object | PropertyBindingInfo | `{${string}}`;
        preFileProcessing?: (event: Component$PreFileProcessingEvent) => void;
        checkBeforeRead?: (event: Component$CheckBeforeReadEvent) => void;
        changeBeforeCreate?: (event: Component$ChangeBeforeCreateEvent) => void;
        requestCompleted?: (event: Component$RequestCompletedEvent) => void;
        uploadButtonPress?: (event: Component$UploadButtonPressEvent) => void;
        beforeDownloadFileProcessing?: (event: Component$BeforeDownloadFileProcessingEvent) => void;
        beforeDownloadFileExport?: (event: Component$BeforeDownloadFileExportEvent) => void;
    }

    export default interface Component {

        // property: spreadsheetFileName
        getSpreadsheetFileName(): string;
        setSpreadsheetFileName(spreadsheetFileName: string): this;

        // property: action
        getAction(): string;
        setAction(action: string): this;

        // property: context
        getContext(): object;
        setContext(context: object): this;

        // property: columns
        getColumns(): string[];
        setColumns(columns: string[]): this;

        // property: excludeColumns
        getExcludeColumns(): string[];
        setExcludeColumns(excludeColumns: string[]): this;

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

        // property: previewColumns
        getPreviewColumns(): string[];
        setPreviewColumns(previewColumns: string[]): this;

        // property: skipMandatoryFieldCheck
        getSkipMandatoryFieldCheck(): boolean;
        setSkipMandatoryFieldCheck(skipMandatoryFieldCheck: boolean): this;

        // property: skipColumnsCheck
        getSkipColumnsCheck(): boolean;
        setSkipColumnsCheck(skipColumnsCheck: boolean): this;

        // property: skipMaxLengthCheck
        getSkipMaxLengthCheck(): boolean;
        setSkipMaxLengthCheck(skipMaxLengthCheck: boolean): this;

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

        // property: spreadsheetTemplateFile
        getSpreadsheetTemplateFile(): any;
        setSpreadsheetTemplateFile(spreadsheetTemplateFile: any): this;

        // property: useTableSelector
        getUseTableSelector(): boolean;
        setUseTableSelector(useTableSelector: boolean): this;

        // property: readAllSheets
        getReadAllSheets(): boolean;
        setReadAllSheets(readAllSheets: boolean): this;

        // property: readSheet
        getReadSheet(): any;
        setReadSheet(readSheet: any): this;

        // property: spreadsheetRowPropertyName
        getSpreadsheetRowPropertyName(): string;
        setSpreadsheetRowPropertyName(spreadsheetRowPropertyName: string): this;

        // property: continueOnError
        getContinueOnError(): boolean;
        setContinueOnError(continueOnError: boolean): this;

        // property: createActiveEntity
        getCreateActiveEntity(): boolean;
        setCreateActiveEntity(createActiveEntity: boolean): this;

        // property: i18nModel
        getI18nModel(): object;
        setI18nModel(i18nModel: object): this;

        // property: debug
        getDebug(): boolean;
        setDebug(debug: boolean): this;

        // property: componentContainerData
        getComponentContainerData(): object;
        setComponentContainerData(componentContainerData: object): this;

        // property: bindingCustom
        getBindingCustom(): object;
        setBindingCustom(bindingCustom: object): this;

        // property: showDownloadButton
        getShowDownloadButton(): boolean;
        setShowDownloadButton(showDownloadButton: boolean): this;

        // property: deepDownloadConfig
        getDeepDownloadConfig(): object;
        setDeepDownloadConfig(deepDownloadConfig: object): this;

        // property: readSheetCoordinates
        getReadSheetCoordinates(): string;
        setReadSheetCoordinates(readSheetCoordinates: string): this;

        // property: updateConfig
        getUpdateConfig(): object;
        setUpdateConfig(updateConfig: object): this;

        // event: preFileProcessing
        attachPreFileProcessing(fn: (event: Component$PreFileProcessingEvent) => void, listener?: object): this;
        attachPreFileProcessing<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$PreFileProcessingEvent, data: CustomDataType) => void, listener?: object): this;
        detachPreFileProcessing(fn: (event: Component$PreFileProcessingEvent) => void, listener?: object): this;
        firePreFileProcessing(parameters?: Component$PreFileProcessingEventParameters): this;

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
        attachRequestCompleted(fn: (event: Component$RequestCompletedEvent) => void, listener?: object): this;
        attachRequestCompleted<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$RequestCompletedEvent, data: CustomDataType) => void, listener?: object): this;
        detachRequestCompleted(fn: (event: Component$RequestCompletedEvent) => void, listener?: object): this;
        fireRequestCompleted(parameters?: Component$RequestCompletedEventParameters): this;

        // event: uploadButtonPress
        attachUploadButtonPress(fn: (event: Component$UploadButtonPressEvent) => void, listener?: object): this;
        attachUploadButtonPress<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$UploadButtonPressEvent, data: CustomDataType) => void, listener?: object): this;
        detachUploadButtonPress(fn: (event: Component$UploadButtonPressEvent) => void, listener?: object): this;
        fireUploadButtonPress(parameters?: Component$UploadButtonPressEventParameters): boolean;

        // event: beforeDownloadFileProcessing
        attachBeforeDownloadFileProcessing(fn: (event: Component$BeforeDownloadFileProcessingEvent) => void, listener?: object): this;
        attachBeforeDownloadFileProcessing<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$BeforeDownloadFileProcessingEvent, data: CustomDataType) => void, listener?: object): this;
        detachBeforeDownloadFileProcessing(fn: (event: Component$BeforeDownloadFileProcessingEvent) => void, listener?: object): this;
        fireBeforeDownloadFileProcessing(parameters?: Component$BeforeDownloadFileProcessingEventParameters): this;

        // event: beforeDownloadFileExport
        attachBeforeDownloadFileExport(fn: (event: Component$BeforeDownloadFileExportEvent) => void, listener?: object): this;
        attachBeforeDownloadFileExport<CustomDataType extends object>(data: CustomDataType, fn: (event: Component$BeforeDownloadFileExportEvent, data: CustomDataType) => void, listener?: object): this;
        detachBeforeDownloadFileExport(fn: (event: Component$BeforeDownloadFileExportEvent) => void, listener?: object): this;
        fireBeforeDownloadFileExport(parameters?: Component$BeforeDownloadFileExportEventParameters): this;
    }

    /**
     * Interface describing the parameters of Component's 'preFileProcessing' event.
     */
    export interface Component$PreFileProcessingEventParameters {
        file?: object;
    }

    /**
     * Interface describing the parameters of Component's 'checkBeforeRead' event.
     */
    export interface Component$CheckBeforeReadEventParameters {
        sheetData?: object;
        parsedData?: object;
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
     * Interface describing the parameters of Component's 'beforeDownloadFileProcessing' event.
     */
    export interface Component$BeforeDownloadFileProcessingEventParameters {
        data?: object;
    }

    /**
     * Interface describing the parameters of Component's 'beforeDownloadFileExport' event.
     */
    export interface Component$BeforeDownloadFileExportEventParameters {
        workbook?: object;
        filename?: string;
    }

    /**
     * Type describing the Component's 'preFileProcessing' event.
     */
    export type Component$PreFileProcessingEvent = Event<Component$PreFileProcessingEventParameters>;

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

    /**
     * Type describing the Component's 'beforeDownloadFileProcessing' event.
     */
    export type Component$BeforeDownloadFileProcessingEvent = Event<Component$BeforeDownloadFileProcessingEventParameters>;

    /**
     * Type describing the Component's 'beforeDownloadFileExport' event.
     */
    export type Component$BeforeDownloadFileExportEvent = Event<Component$BeforeDownloadFileExportEventParameters>;
}
