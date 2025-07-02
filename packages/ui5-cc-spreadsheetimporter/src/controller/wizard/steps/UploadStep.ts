import VBox from "sap/m/VBox";
import MessageToast from "sap/m/MessageToast";
import Log from "sap/base/Log";
import WizardController from "../Wizard";
import Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import HeaderSelectionStep from "./HeaderSelectionStep";
import PreviewStep from "./PreviewStep";
import MessagesStep from "./MessagesStep";

/**
 * UploadStep – first wizard step where the user selects the spreadsheet file.
 *
 * This step handles file upload, processes the file, and manages wizard navigation.
 */
export default class UploadStep {
	public readonly stepName = "uploadStep";

	private wizardController: WizardController;
	public wizard: Wizard;
	private util: any; // Util instance for i18n

	constructor(wizardController: WizardController, wizard?: Wizard, util?: any) {
		this.wizardController = wizardController;
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
			const file = files && (files[0] as File);
			if (file) {
				await this.processFileAndNavigate(file);
			} else {
				const noFileMessage = this.util?.geti18nText?.("spreadsheetimporter.noFileSelected") || "No file selected";
				MessageToast.show(noFileMessage);
			}

			this.wizardController.getStep("uploadStep").setBusy(false);
		} catch (error) {
			Log.error("Error handling file upload", error as Error, "UploadStep");
			const errorMessage = this.util?.geti18nText?.("spreadsheetimporter.errorProcessingFileToast") || "Error processing file";
			MessageToast.show(errorMessage);
		}
	}

	/**
	 * Reset the wizard progress to avoid circular references when uploading a new file
	 */
	private resetWizardProgress(): void {
		try {
			if (this.wizard) {
				// Reset wizard progress back to the upload step (first step)
				const uploadStepControl = this.wizardController.getStep("uploadStep");
				if (uploadStepControl) {
					this.wizard.discardProgress(uploadStepControl, false);
					Log.debug("Wizard progress reset to upload step", undefined, "UploadStep");
				}

				// Clear any previous step configurations
				const uploadStep = this.wizardController.getStep("uploadStep");
				const headerStep = this.wizardController.getStep("headerSelectionStep");
				const previewStep = this.wizardController.getStep("previewDataStep");

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
			this.wizardController.setUploadButtonEnabled(false);
			this.wizardController.resetCurrentCoordinates();

			// Process the file using enhanced pipeline with centralized coordinates
			// Use current coordinates from the model (defaults to A1 if not set)
			const processedData = await this.wizardController.processFile(file, this.wizardController.getCurrentCoordinates(), true, false);
			// Update Wizard with the file data
			this.wizardController.setFileData(file, processedData);

			// create steps controllers
			this.createStepsControllers();

			// Check for header validation issues
			const headerValidationResult = processedData.validationMessages.find((message: any) => message.type.title === "EmptyHeaders");

			let navigateToStep: WizardStep;

			if (processedData.validationMessages.length > 0 && headerValidationResult) {
				// Wrong headers but other errors found - Navigate to MessagesStep
				const uploadStepControl = this.wizardController.getStep("uploadStep");
				const headerStepControl = this.wizardController.getStep("headerSelectionStep");
				const messagesStepControl = this.wizardController.getStep("messagesStep");
				if (uploadStepControl && messagesStepControl && uploadStepControl.getNextStep() !== messagesStepControl.getId()) {
					uploadStepControl.setNextStep(messagesStepControl);
				}
				if (headerStepControl && messagesStepControl && headerStepControl.getNextStep() !== messagesStepControl.getId()) {
					headerStepControl.setNextStep(messagesStepControl);
				}
				navigateToStep = headerStepControl;
				// if build already rebuild headerSelectionStep
				if (this.wizardController.stepsBuilt.has("headerSelectionStep")) {
					const headerSelectionController = this.wizardController.getStepControl("headerSelectionStep") as HeaderSelectionStep;
					headerSelectionController.build(this.wizardController.findStepContainer("headerSelectionStep"));
				} else {
					this.wizardController.activateStep("headerSelectionStep");
				}
			}
			if (headerValidationResult) {
				// Wrong header detected - Configure wizard flow
				const uploadStepControl = this.wizardController.getStep("uploadStep");
				const headerStepControl = this.wizardController.getStep("headerSelectionStep");
				if (uploadStepControl && headerStepControl && uploadStepControl.getNextStep() !== headerStepControl.getId()) {
					uploadStepControl.setNextStep(headerStepControl);
				}
				navigateToStep = headerStepControl;
				// if build already rebuild headerSelectionStep
				if (this.wizardController.stepsBuilt.has("headerSelectionStep")) {
					const headerSelectionController = this.wizardController.getStepControl("headerSelectionStep") as HeaderSelectionStep;
					headerSelectionController.build(this.wizardController.findStepContainer("headerSelectionStep"));
				} else {
					this.wizardController.activateStep("headerSelectionStep");
				}
			} else if (processedData.validationMessages.length > 0) {
				// Valid headers but other errors found - Navigate to MessagesStep
				const uploadStepControl = this.wizardController.getStep("uploadStep");
				const messagesStepControl = this.wizardController.getStep("messagesStep");
				if (uploadStepControl && messagesStepControl && uploadStepControl.getNextStep() !== messagesStepControl.getId()) {
					uploadStepControl.setNextStep(messagesStepControl);
				}

				// Store validation messages in the message handler for use in MessagesStep
				if (this.wizardController.getDialogController()?.messageHandler) {
					this.wizardController.getDialogController().messageHandler.setMessages(processedData.validationMessages);
				}

				navigateToStep = messagesStepControl;
				// Build or rebuild messagesStep
				if (this.wizardController.stepsBuilt.has("messagesStep")) {
					const messagesController = this.wizardController.getStepControl("messagesStep");
					messagesController.build(this.wizardController.findStepContainer("messagesStep"));
				} else {
					this.wizardController.activateStep("messagesStep");
				}
			} else {
				// Valid headers - Configure direct flow to preview
				const uploadStepControl = this.wizardController.getStep("uploadStep");
				const previewStepControl = this.wizardController.getStep("previewDataStep");
				if (uploadStepControl && previewStepControl && uploadStepControl.getNextStep() !== previewStepControl.getId()) {
					uploadStepControl.setNextStep(previewStepControl);
				}
				navigateToStep = previewStepControl;
				if (this.wizardController.stepsBuilt.has("previewDataStep")) {
					const previewStepController = this.wizardController.getStepControl("previewDataStep") as PreviewStep;
					previewStepController.build(this.wizardController.findStepContainer("previewDataStep"), this.wizardController.processedData);
				} else {
					this.wizardController.activateStep("previewDataStep");
				}

				this.wizardController.setUploadButtonEnabled(true);
			}

			this.wizard.goToStep(navigateToStep, true);
			this.wizard.nextStep();
		} catch (error) {
			Log.error("Error processing file", error as Error, "UploadStep");
			this.wizardController.getWizardModel().setProperty("/fileUploaded", false);

			const errorMessage = this.util?.geti18nText?.("spreadsheetimporter.errorProcessingFile") || "Error processing file";
			MessageToast.show(errorMessage);
		}
	}

	private createStepsControllers(): void {
		// init steps controllers creation and calling build method
		// both steps need the data from the upload step
		this.wizardController.activateStep("headerSelectionStep");
		// this.wizardController.activateStep("messagesStep");
		this.wizardController.activateStep("previewDataStep");
	}
}
