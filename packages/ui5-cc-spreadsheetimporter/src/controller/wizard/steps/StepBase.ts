import ManagedObject from "sap/ui/base/ManagedObject";

/**
 * Base class for a wizard step controller. Each concrete step class should extend this
 * and implement its specific UI-build and validation logic.
 *
 * All steps follow the same life-cycle:
 * 1. build(container)   – creates/updates the UI inside the given container (VBox)
 * 2. activate()         – called when the step becomes active (optional)
 * 3. validate()         – returns `true` when the step is considered complete/valid
 *
 * Using a common base interface makes it easy to plug a new step into the wizard or
 * reuse it in other wizards.
 */
export default abstract class StepBase extends ManagedObject {
    /** A technical name used to reference this step inside the wizard. */
    public abstract readonly stepName: string;

    /**
     * Builds or updates the UI for this step inside the given container.
     * Can be synchronous or asynchronous (returning a Promise).
     * @param container VBox (or any layout) that belongs to this wizard step
     */
    public abstract build(container: any): void | Promise<void>;

    /**
     * Called when the wizard navigates to this step. Sub-classes can override for activation logic.
     */
    public activate(): void {
        // default: no-op
    }

    /**
     * Returns whether the step is currently completed / validated.
     */
    public validate(): boolean {
        return true;
    }

    /**
     * Optional method for handling file upload events (only implemented by UploadStep)
     */
    public onFileUpload?(event: any): Promise<void> | void;

    /**
     * Optional method for handling file drop events (only implemented by UploadStep)
     */
    public onFileDrop?(event: any): Promise<void> | void;

    /**
     * Optional method for setting wizard and util references (only implemented by UploadStep)
     */
    public setWizardReferences?(wizard: any, util: any): void;
}
