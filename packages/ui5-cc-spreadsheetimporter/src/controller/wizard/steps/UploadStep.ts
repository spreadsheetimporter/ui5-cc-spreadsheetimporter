import VBox from "sap/m/VBox";
import StepBase from "./StepBase";
import FileUploader from "sap/ui/unified/FileUploader";
import Text from "sap/m/Text";
import MessageToast from "sap/m/MessageToast";
import Log from "sap/base/Log";
import MatchWizard from "../MatchWizard";

/**
 * UploadStep – first wizard step where the user selects the spreadsheet file.
 *
 * This step handles file upload, processes the file, and manages wizard navigation.
 * It reduces the logic burden on MatchWizardDialog by handling step-specific concerns.
 */
export default class UploadStep extends StepBase {
    public readonly stepName = "uploadStep";

    private fileSelectedCallback: (file: File) => Promise<void>;
    private matchWizard: MatchWizard;
    private wizard: any; // UI5 Wizard control
    private util: any; // Util instance for i18n

    constructor(
        onFileSelected: (file: File) => Promise<void>,
        matchWizard: MatchWizard,
        wizard?: any,
        util?: any
    ) {
        super();
        this.fileSelectedCallback = onFileSelected;
        this.matchWizard = matchWizard;
        this.wizard = wizard;
        this.util = util;
    }

    /**
     * Set wizard and util references after construction
     */
    public setWizardReferences(wizard: any, util: any): void {
        this.wizard = wizard;
        this.util = util;
    }

    /** @inheritdoc */
    public build(container: VBox): void {
        // The UI is already defined in the fragment
        // This step only needs to handle the logic
        // The fragment will call onFileUpload and onFileDrop methods
    }

    /**
     * Handle file upload from FileUploader
     */
    private async handleFileUpload(event: any): Promise<void> {
        try {
            const files = event.getParameter("files");
            const file = files && files[0] as File;
            if (file) {
                await this.processFileAndNavigate(file);
            } else {
                MessageToast.show("No file selected");
            }
        } catch (error) {
            Log.error("Error handling file upload", error as Error, "UploadStep");
            MessageToast.show("Error processing file");
        }
    }

    /**
     * Handle file drop from drag and drop
     */
    private async handleFileDrop(event: any): Promise<void> {
        try {
            const files = event.getParameter("files");
            const file = files && files[0] as File;
            if (file) {
                await this.processFileAndNavigate(file);
            } else {
                MessageToast.show("No file dropped");
            }
        } catch (error) {
            Log.error("Error handling file drop", error as Error, "UploadStep");
            MessageToast.show("Error processing dropped file");
        }
    }

    /**
     * Process the file and handle wizard navigation
     * This consolidates the logic that was previously in MatchWizardDialog.handleFileSelected
     */
    private async processFileAndNavigate(file: File): Promise<void> {
        try {
            // Process the file using enhanced pipeline
            const processedData = await this.matchWizard.processFile(file, undefined, true, false);

            // Check for header validation issues
            const headerValidationResult = processedData.validationMessages.find(
                (message: any) => message.type.title === "EmptyHeaders"
            );

            if (headerValidationResult) {
                // Wrong header detected - Configure wizard flow
                const uploadStepControl = this.matchWizard.getStepControl("uploadStep");
                const headerStepControl = this.matchWizard.getStepControl("headerSelectionStep");
                if (uploadStepControl && headerStepControl) {
                    uploadStepControl.setNextStep(headerStepControl);
                }
            }

            // Update MatchWizard with the file data
            this.matchWizard.setFileData(file, processedData);

            // Validate this step and navigate to next
            this.validateAndNavigate(headerValidationResult ? "headerSelectionStep" : undefined);

            // Call the original callback for any additional processing
            await this.fileSelectedCallback(file);
        } catch (error) {
            Log.error("Error processing file", error as Error, "UploadStep");
            this.matchWizard.getWizardModel().setProperty("/fileUploaded", false);

            const errorMessage = this.util?.geti18nText?.("spreadsheetimporter.errorProcessingFile") || "Error processing file";
            MessageToast.show(errorMessage);
        }
    }

    /**
     * Validate this step and navigate to the next step
     */
    private validateAndNavigate(targetStepName?: string): void {
        if (!this.wizard) return;

        try {
            // Get the current UI5 wizard step and enable it to proceed
            const wizardSteps = this.wizard.getSteps();
            if (wizardSteps.length > 0) {
                const currentStep = wizardSteps[0]; // Upload step is first
                currentStep.setValidated(true);

                // Automatically advance to the next step
                setTimeout(() => {
                    this.wizard.nextStep();

                    // If we have a specific target step (like headerSelectionStep),
                    // trigger its activation manually since the stepActivate event might not fire
                    if (targetStepName) {
                        setTimeout(() => {
                            // Get the dialog controller and trigger step activation
                            const dialogController = this.matchWizard.getDialogController();
                            if (dialogController && typeof dialogController.activateStepManually === "function") {
                                dialogController.activateStepManually(targetStepName);
                            }
                        }, 100);
                    }
                }, 500);
            }
        } catch (error) {
            Log.error("Error validating and navigating", error as Error, "UploadStep");
        }
    }

    /**
     * Public method to handle file upload - called from fragment
     */
    public async onFileUpload(event: any): Promise<void> {
        await this.handleFileUpload(event);
    }

    /**
     * Public method to handle file drop - called from fragment
     */
    public async onFileDrop(event: any): Promise<void> {
        await this.handleFileDrop(event);
    }
}
