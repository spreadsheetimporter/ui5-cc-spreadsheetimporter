import ManagedObject from "sap/ui/base/ManagedObject";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Wizard, { Wizard$StepActivateEvent } from "sap/m/Wizard";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import * as XLSX from "xlsx";
import Log from "sap/base/Log";
import Component from "../../Component";
import Util from "../Util";
import VBox from "sap/m/VBox";
import MessageToast from "sap/m/MessageToast";
import MessageHandler from "../MessageHandler";
import SpreadsheetUpload from "../SpreadsheetUpload";
import ImportService from "../ImportService";
import OData from "../odata/OData";
import MatchWizard from "../wizard/MatchWizard";
import WizardStep from "sap/m/WizardStep";
import UploadStep from "../wizard/steps/UploadStep";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class MatchWizardDialog extends ManagedObject {
	/**
	 * MatchWizardDialog orchestrates the wizard steps for the import process.
	 * It manages the dialog lifecycle, step navigation, and coordination between steps.
	 */
	private dialog: Dialog;
	private component: Component;
	private spreadsheetUploadController: SpreadsheetUpload;
	private wizard: Wizard;
	private util: Util;
	private resolvePromise: (value: any) => void;
	private rejectPromise: (reason?: any) => void;
	private componentI18n: ResourceModel;
	private messageHandler: MessageHandler;
	private importService: ImportService;
	private odataHandler: OData;
	private matchWizard: MatchWizard;

	/**
	 * Creates a new instance of MatchWizardDialog
	 */
	constructor(spreadsheetUploadController: SpreadsheetUpload, component: Component, componentI18n: ResourceModel, messageHandler: MessageHandler) {
		super();
		this.spreadsheetUploadController = spreadsheetUploadController;
		this.component = component;
		this.componentI18n = componentI18n;
		this.messageHandler = messageHandler;
		this.util = new Util(componentI18n.getResourceBundle() as ResourceBundle);

		// Initialize the core components
		this.matchWizard = new MatchWizard(component, componentI18n.getResourceBundle() as ResourceBundle, messageHandler, spreadsheetUploadController, this);

		this.importService = new ImportService(spreadsheetUploadController, component, componentI18n.getResourceBundle() as ResourceBundle, messageHandler);
	}

	/**
	 * Opens the match wizard dialog
	 */
	openWizard(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.resolvePromise = resolve;
			this.rejectPromise = reject;

			this.createDialog()
				.then(() => {
					this.dialog.open();
					// Collect step references
					this.matchWizard.collectStepReferences(this.wizard);
					// Configure the step sequence based on visibility
					this.matchWizard.configureStepSequence(this.wizard);
					this.matchWizard.setWizardToSteps(this.wizard);
					this.navigateToStep("uploadStep");
				})
				.catch((error) => {
					Log.error("Error opening match wizard", error as Error, "MatchWizardDialog");
					reject(error);
				});
		});
	}

	/**
	 * Creates the wizard dialog
	 */
	private async createDialog(): Promise<void> {
		this.dialog = (await Fragment.load({
			name: "cc.spreadsheetimporter.XXXnamespaceXXX.fragment.MatchWizard",
			type: "XML",
			controller: this
		})) as Dialog;

		// Set models
		this.dialog.setModel(this.componentI18n, "i18n");
		this.dialog.setModel(this.matchWizard.getWizardModel(), "wizard");

		// Get wizard reference
		this.wizard = this.dialog.getContent()[0] as Wizard;
		this.matchWizard.wizard = this.wizard;
	}

	/**
	 * Navigate to a specific step in the wizard
	 */
	private navigateToStep(stepName: string): void {
		try {
			// Get step control from our map
			const step = this.matchWizard.getWizardStepControl(stepName);
			if (!step) {
				Log.warning(`Step ${stepName} not found`, undefined, "MatchWizardDialog");
				return;
			}

			// Navigate to the step - goToStep takes the step itself as the parameter and a boolean for focus
			this.wizard.goToStep(step, true);

			// Update the current step in the model
			this.matchWizard.getWizardModel().setProperty("/currentStep", stepName);

			Log.debug(`Navigated to step: ${stepName}`, undefined, "MatchWizardDialog");
		} catch (error) {
			Log.error(`Error navigating to step ${stepName}`, error as Error, "MatchWizardDialog");
		}
	}

	/**
	 * Handler for wizard step change
	 */
	async onWizardStepChanged(event: Wizard$StepActivateEvent): Promise<void> {
		try {
			const currentStepIndex = event.getParameter("index") as number;
			const wizardSteps = this.wizard.getSteps();
			// Note: stepIndex is 1-based, but array is 0-based
			if (currentStepIndex < 1 || currentStepIndex > wizardSteps.length) return;

			const currentStep = wizardSteps[currentStepIndex - 1]; // Convert to 0-based array index
			if (!currentStep) return;

			let customData;

			const nextStepId = currentStep.getNextStep();
			if (!nextStepId) {
				customData = currentStep.getCustomData();
			} else {
				const nextStep = wizardSteps.find((wizardStep) => wizardStep.getId() === nextStepId);
				customData = nextStep?.getCustomData();
			}

			if (!customData || customData.length === 0) return;

			const stepName = customData[0].getValue();
			if (!stepName) return;

			// Update current step in the model
			this.matchWizard.getWizardModel().setProperty("/currentStep", stepName);

			Log.debug(`Step changed to: ${stepName}`, undefined, "MatchWizardDialog");

			try {
				// await this.matchWizard.activateStep(stepName);
			} catch (error) {
				Log.error(`Error activating step '${stepName}'`, error as Error, "MatchWizardDialog");
			}
		} catch (error) {
			Log.error("Error in wizard step change", error as Error, "MatchWizardDialog");
		}
	}

	/**
	 * Handler for wizard completion
	 */
	onWizardComplete(): void {
		this.matchWizard.getWizardModel().setProperty("/currentStep", "previewDataStep");
	}

	/**
	 * Handler for wizard finish button
	 */
	async onWizardFinish(): Promise<void> {
		this.setBusy(true);
		try {
			// Get data from the MatchWizard model and state
			const wizardModel = this.matchWizard.getWizardModel();
			const a1Coordinates = wizardModel.getProperty("/readSheetCoordinates");
			const workbookData = this.matchWizard.getWorkbookData();
			const currentFile = this.matchWizard.getCurrentFile();

			if (!a1Coordinates || !workbookData) {
				Log.error("Missing data for finish operation", undefined, "MatchWizardDialog");
				this.resolvePromise({ coordinates: null, canceled: true });
				this.dialog.close();
				return;
			}

			const { workbook, sheetName } = workbookData;

			// Use the already processed data if available, or process again if needed
			let result;
			const processedData = this.matchWizard.getProcessedData();
			if (processedData && processedData.coordinates === a1Coordinates) {
				// We already have processed data with validation
				result = processedData;
			} else {
				// Process the data using the import service
				result = await this.importService.processAndValidate(workbook, sheetName, a1Coordinates, {
					resetMessages: false,
					validate: true,
					showMessages: false
				});

				// Show messages if validation failed
				if (result.canceled) {
					this.messageHandler.displayMessages();
				}
			}

			if (result.canceled) {
				MessageToast.show(this.util.geti18nText("spreadsheetimporter.validationFailed"));
				this.resolvePromise({ coordinates: a1Coordinates, canceled: true });
			} else {
				// Execute upload with appropriate method
				const uploadSuccess = await this.importService.executeUpload(result.payloadArray, currentFile);

				if (uploadSuccess) {
					MessageToast.show(this.util.geti18nText("spreadsheetimporter.uploadSuccessful"));
					this.resolvePromise({
						coordinates: a1Coordinates,
						canceled: false,
						workbook: workbook,
						sheetName: sheetName,
						sheetData: result.payloadArray || result.payload
					});
				} else {
					MessageToast.show(this.util.geti18nText("spreadsheetimporter.uploadFailed"));
					this.resolvePromise({ coordinates: a1Coordinates, canceled: true });
				}
			}
		} catch (error) {
			Log.error("Error in wizard finish", error as Error, "MatchWizardDialog");
			this.resolvePromise({ coordinates: null, canceled: true });
		} finally {
			this.setBusy(false);
			this.dialog.close();
		}
	}

	/**
	 * Handler for wizard cancel button
	 */
	onWizardCancel(): void {
		this.resolvePromise({ coordinates: null, canceled: true });
		this.dialog.close();
	}

	/**
	 * Handler for wizard dialog close
	 */
	onWizardClose(): void {
		this.resetContent();
	}

	/**
	 * Reset dialog content and resources
	 */
	resetContent(): void {
		try {
			// Clean up the dialog
			if (this.dialog) {
				// Clean up wizard steps
				const wizard = this.dialog.getContent()[0] as Wizard;
				if (wizard) {
					const steps = wizard.getSteps();
					for (const step of steps) {
						step.destroyContent();
						step.destroyCustomData();
					}
					wizard.destroySteps();
				}

				this.dialog.destroyContent();
				this.dialog.destroyButtons();
				this.dialog.detachAfterClose(this.onWizardClose, this);
				this.dialog.destroy();
			}

			// Reset the wizard data
			this.matchWizard.reset();

			// Clear dialog references
			this.dialog = null;

			Log.debug("Dialog and resources fully destroyed", undefined, "MatchWizardDialog");
		} catch (error) {
			Log.error("Error during dialog cleanup", error as Error, "MatchWizardDialog");
		}
	}

	/**
	 * Set busy state on dialog
	 */
	setBusy(state: boolean): void {
		if (this.dialog) {
			this.dialog.setBusy(state);
		}
	}

	/**
	 * Gets the wizard control instance
	 */
	getWizard(): Wizard {
		return this.wizard;
	}

	/**
	 * Properly destroy this controller instance
	 */
	public destroy(): void {
		if (this.dialog) {
			if (this.dialog.isOpen()) {
				this.dialog.close();
			} else {
				this.onWizardClose();
			}
		}
		super.destroy();
	}

	/**
	 * Handler for file upload event from the fragment
	 * Delegates to the UploadStep controller
	 */
	async onFileUpload(event: any): Promise<void> {
		try {
			const uploadStep = await this.matchWizard.activateStep("uploadStep") as UploadStep;
			uploadStep.onFileUpload(event);
			if(this.matchWizard.getStep("uploadStep")){
				this.wizard.setCurrentStep(this.matchWizard.getStep("uploadStep"));
			}
		} catch (error) {
			Log.error("Error delegating file upload to step", error as Error, "MatchWizardDialog");
		}
	}

	setODataHandler(odataHandler: OData): void {
		this.odataHandler = odataHandler;
	}
	getDialog(): Dialog {
		return this.dialog;
	}
}
