import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $DialogSettings } from "sap/m/Dialog";

declare module "./ExcelDialog" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $ExcelDialogSettings extends $DialogSettings {
        decimalSeparator?: string | PropertyBindingInfo;
        decimalSeparatorChanged?: (event: Event) => void;
    }

    export default interface ExcelDialog {

        // property: decimalSeparator
        getDecimalSeparator(): string;
        setDecimalSeparator(decimalSeparator: string): this;

        // event: decimalSeparatorChanged
        attachDecimalSeparatorChanged(fn: (event: Event) => void, listener?: object): this;
        attachDecimalSeparatorChanged<CustomDataType extends object>(data: CustomDataType, fn: (event: Event, data: CustomDataType) => void, listener?: object): this;
        detachDecimalSeparatorChanged(fn: (event: Event) => void, listener?: object): this;
        fireDecimalSeparatorChanged(parameters?: object): this;
    }
}
