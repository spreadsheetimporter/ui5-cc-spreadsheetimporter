import VBox from "sap/m/VBox";
import MessageToast from "sap/m/MessageToast";
import Log from "sap/base/Log";
import MatchWizard from "../MatchWizard";
import Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import HeaderSelectionStep from "./HeaderSelectionStep";
import PreviewStep from "./PreviewStep";

/**
 * UploadStep – first wizard step where the user selects the spreadsheet file.
 *
 * This step handles file upload, processes the file, and manages wizard navigation.
 */
export default class UploadStep {
    public readonly stepName = "uploadStep";

    private matchWizard: MatchWizard;
    public wizard: Wizard;
    private util: any; // Util instance for i18n

    constructor(matchWizard: MatchWizard, wizard?: Wizard, util?: any) {
        this.matchWizard = matchWizard;
        this.wizard = wizard;
        this.util = util;
    }

    /** Build method - The UI is already defined in the fragment */
    public build(container: VBox): void {
        // The UI is already defined in the fragment
        // This step only needs to handle the logic
        // The fragment will call onFileUpload and onFileDrop methods
    }

    public validate(): boolean {
        return true;
    }

    /**
     * Handle file upload from FileUploader
     */
    public async onFileUpload(event: any): Promise<void> {
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
     * Reset the wizard progress to avoid circular references when uploading a new file
     */
    private resetWizardProgress(): void {
        try {
            if (this.wizard) {
                // Reset wizard progress back to the upload step (first step)
                const uploadStepControl = this.matchWizard.getStep("uploadStep");
                if (uploadStepControl) {
                    this.wizard.discardProgress(uploadStepControl);
                    Log.debug("Wizard progress reset to upload step", undefined, "UploadStep");
                }

                // Clear any previous step configurations
                const uploadStep = this.matchWizard.getStep("uploadStep");
                const headerStep = this.matchWizard.getStep("headerSelectionStep");
                const previewStep = this.matchWizard.getStep("previewDataStep");

                // Reset step flow configurations
                if (uploadStep) {
                    uploadStep.setSubsequentSteps([]);
                    uploadStep.setNextStep(null);
                }
                if (headerStep) {
                    headerStep.setValidated(false);
                }
                if (previewStep) {
                    previewStep.setValidated(false);
                }
            }
        } catch (error) {
            Log.warning("Error resetting wizard progress", error as Error, "UploadStep");
        }
    }

    /**
     * Process the file and handle wizard navigation
     */
    private async processFileAndNavigate(file: File): Promise<void> {
        try {
            // Process the file using enhanced pipeline
            const processedData = await this.matchWizard.processFile(file, undefined, true, false);
			// Update MatchWizard with the file data
            this.matchWizard.setFileData(file, processedData);

			// create steps controllers
			this.createStepsControllers();

            // Check for header validation issues
            const headerValidationResult = processedData.validationMessages.find(
                (message: any) => message.type.title === "EmptyHeaders"
            );

            let navigateToStep: WizardStep;

            if (headerValidationResult) {
                // Wrong header detected - Configure wizard flow
                const uploadStepControl = this.matchWizard.getStep("uploadStep");
                const headerStepControl = this.matchWizard.getStep("headerSelectionStep");
                if (uploadStepControl && headerStepControl && uploadStepControl.getNextStep() !== headerStepControl.getId()) {
                    uploadStepControl.setNextStep(headerStepControl);
                }
                navigateToStep = headerStepControl;
				// if build already rebuild headerSelectionStep
				if (this.matchWizard.stepsBuilt.has("headerSelectionStep")) {
					const headerSelectionController = this.matchWizard.getStepControl("headerSelectionStep") as HeaderSelectionStep;
					headerSelectionController.build(this.matchWizard.findStepContainer("headerSelectionStep"));
				} else {
					this.matchWizard.activateStep("headerSelectionStep");
				}
            } else {
                // Valid headers - Configure direct flow to preview
                const uploadStepControl = this.matchWizard.getStep("uploadStep");
                const previewStepControl = this.matchWizard.getStep("previewDataStep");
                if (uploadStepControl && previewStepControl && uploadStepControl.getNextStep() !== previewStepControl.getId()) {
                    uploadStepControl.setNextStep(previewStepControl);
                }
                navigateToStep = previewStepControl;
				if (this.matchWizard.stepsBuilt.has("previewDataStep")) {
					const previewStepController = this.matchWizard.getStepControl("previewDataStep") as PreviewStep;
					previewStepController.build(this.matchWizard.findStepContainer("previewDataStep"), this.matchWizard.processedData );
				} else {
					this.matchWizard.activateStep("previewDataStep");
				}
            }

            this.wizard.goToStep(navigateToStep, true);
			this.wizard.nextStep();
        } catch (error) {
            Log.error("Error processing file", error as Error, "UploadStep");
            this.matchWizard.getWizardModel().setProperty("/fileUploaded", false);

            const errorMessage = this.util?.geti18nText?.("spreadsheetimporter.errorProcessingFile") || "Error processing file";
            MessageToast.show(errorMessage);
        }
    }

	private createStepsControllers(): void {
		// init steps controllers creation and calling build method
		// both steps need the data from the upload step
		this.matchWizard.activateStep("headerSelectionStep");
		this.matchWizard.activateStep("previewDataStep");
	}
}
