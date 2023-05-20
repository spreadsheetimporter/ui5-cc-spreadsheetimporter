import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $UIComponentSettings } from "sap/ui/core/UIComponent";

declare module "./Component" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $ComponentSettings extends $UIComponentSettings {
        excelFileName?: string | PropertyBindingInfo;
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
        checkBeforeRead?: (event: Event) => void;
        changeBeforeCreate?: (event: Event) => void;
        uploadButtonPress?: (event: Event) => void;
    }

    export default interface Component {

        // property: excelFileName
        getExcelFileName(): string;
        setExcelFileName(excelFileName: string): this;

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

        // event: checkBeforeRead
        attachCheckBeforeRead(fn: (event: Event) => void, listener?: object): this;
        attachCheckBeforeRead<CustomDataType extends object>(data: CustomDataType, fn: (event: Event, data: CustomDataType) => void, listener?: object): this;
        detachCheckBeforeRead(fn: (event: Event) => void, listener?: object): this;
        fireCheckBeforeRead(parameters?: object): this;

        // event: changeBeforeCreate
        attachChangeBeforeCreate(fn: (event: Event) => void, listener?: object): this;
        attachChangeBeforeCreate<CustomDataType extends object>(data: CustomDataType, fn: (event: Event, data: CustomDataType) => void, listener?: object): this;
        detachChangeBeforeCreate(fn: (event: Event) => void, listener?: object): this;
        fireChangeBeforeCreate(parameters?: object): this;

        // event: uploadButtonPress
        attachUploadButtonPress(fn: (event: Event) => void, listener?: object): this;
        attachUploadButtonPress<CustomDataType extends object>(data: CustomDataType, fn: (event: Event, data: CustomDataType) => void, listener?: object): this;
        detachUploadButtonPress(fn: (event: Event) => void, listener?: object): this;
        fireUploadButtonPress(parameters?: object): this;
    }
}
