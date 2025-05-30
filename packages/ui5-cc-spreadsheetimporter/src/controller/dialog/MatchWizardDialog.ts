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
import StepBase from "../wizard/steps/StepBase";
import WizardStep from "sap/m/WizardStep";
import { Wizard$StepChangeEvent } from "sap/ui/webc/fiori/Wizard";

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

	// Track which steps have been built
	private stepsBuilt: Set<string> = new Set();

	// Map of step controls for quick access
	private wizardStepControls: { [key: string]: WizardStep } = {};

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
		this.matchWizard = new MatchWizard(component, componentI18n.getResourceBundle() as ResourceBundle, messageHandler);
		this.matchWizard.setSpreadsheetUploadController(spreadsheetUploadController);

		this.importService = new ImportService(spreadsheetUploadController, component, componentI18n.getResourceBundle() as ResourceBundle, messageHandler);

		// Initialize the step controllers
		this.initializeStepControllers();

		// Set dialog controller reference in MatchWizard for step activation
		this.matchWizard.setDialogController(this);
	}

	/**
	 * Initialize all step controllers that will be used in the wizard
	 */
	private initializeStepControllers(): void {
		this.matchWizard.initializeStepControllers(this.handleFileSelected.bind(this), this.handleHeaderSelected.bind(this));
	}

	/**
	 * Set OData handler reference (used for optional upload)
	 */
	setODataHandler(odataHandler: OData): void {
		this.odataHandler = odataHandler;
	}

	/**
	 * Returns the dialog control
	 */
	getDialog(): Dialog {
		return this.dialog;
	}

	/**
	 * Opens the match wizard dialog
	 * @param workbook Optional XLSX workbook (can be provided if file is already loaded)
	 * @param sheetName Optional sheet name (can be provided if file is already loaded)
	 * @param startStep Optional step to start with (if not provided, determined automatically)
	 * @returns Promise that resolves when wizard completes or rejects when canceled
	 */
	openWizard(): Promise<{ coordinates: any; canceled: boolean; workbook?: XLSX.WorkBook; sheetName?: string; sheetData?: any }> {
		return new Promise(async (resolve, reject) => {
			try {
				this.resolvePromise = resolve;
				this.rejectPromise = reject;

				this.matchWizard.configureWizardSteps({});

				await this.createDialog();

				// Open the dialog first - don't try to navigate to steps yet
				this.dialog.open();

				try {
					// Collect step references
					this.collectStepReferences();

					// Configure the step sequence based on visibility
					this.matchWizard.configureStepSequence(this.wizard, this.wizardStepControls);

					// Set start step - either provided or first step from configuration
					if (this.wizard) {
						this.navigateToStep(this.matchWizard.getFirstStep());
					}
				} catch (error) {
					Log.error("Error initializing wizard steps", error as Error, "MatchWizardDialog");
				}
			} catch (error) {
				Log.error("Error opening match wizard", error as Error, "MatchWizardDialog");
				reject(error);
			}
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

		// Set wizard and util references in step controllers after dialog creation
		this.setStepReferences();
	}

	/**
	 * Collects references to all wizard steps for easy access
	 */
	private collectStepReferences(): void {
		if (!this.wizard) return;

		this.wizardStepControls = {};

		const wizardSteps = this.wizard.getSteps();
		for (const step of wizardSteps) {
			const customData = step.getCustomData();
			if (customData && customData.length > 0) {
				const stepName = customData[0].getValue();
				if (stepName) {
					// Store in local map
					this.wizardStepControls[stepName] = step;

					// Also store in MatchWizard's steps map
					this.matchWizard.setStepControl(stepName, step);

					Log.debug(`Collected step reference: ${stepName}`, undefined, "MatchWizardDialog");
				}
			}
		}
	}

	/**
	 * Activate a step by building its UI if needed
	 */
	private async activateStep(stepName: string): Promise<void> {
		// Find the step controller
		const stepController = this.matchWizard.getOrCreateStepController(stepName, this.handleHeaderSelected.bind(this));

		if (!stepController) {
			Log.error(`Step controller for '${stepName}' not found`, undefined, "MatchWizardDialog");
			return;
		}

		// Find step container in the DOM
		const container = this.findStepContainer(stepName);
		if (!container) {
			Log.error(`Container for step '${stepName}' not found`, undefined, "MatchWizardDialog");
			return;
		}

		// Build the step UI if not already built
		if (!this.stepsBuilt.has(stepName)) {
			try {
				// Handle both async and sync build methods
				const buildResult = stepController.build(container);

				// If build returns a Promise, wait for it
				if (buildResult instanceof Promise) {
					await buildResult;
				}

				this.stepsBuilt.add(stepName);
			} catch (error) {
				Log.error(`Error building step '${stepName}'`, error as Error, "MatchWizardDialog");
			}
		}

		// Activate the step
		stepController.activate();
	}

	/**
	 * Find the container for a specific step
	 */
	private findStepContainer(stepName: string): VBox | null {
		try {
			// Use the step reference to get the container
			const step = this.wizardStepControls[stepName];
			if (!step) return null;

			// Get the container within the step
			const content = step.getContent();
			if (content && content.length > 0) {
				const vbox = content[0] as any;
				if (vbox && vbox.getItems && vbox.getItems().length > 1) {
					return vbox.getItems()[1] as VBox;
				}
			}
		} catch (error) {
			Log.error(`Error finding container for step ${stepName}`, error as Error, "MatchWizardDialog");
		}
		return null;
	}

	/**
	 * Navigate to a specific step in the wizard
	 * @param stepName The name of the step to navigate to
	 */
	private navigateToStep(stepName: string): void {
		if (!this.wizard) return;

		try {
			// Get step control from our map
			const step = this.wizardStepControls[stepName];
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
	 * Handler for when a file is selected
	 * Most logic is now handled by UploadStep, this is just a simplified callback
	 */
	private async handleFileSelected(file: File): Promise<void> {
		try {
			Log.debug(`File selected: ${file.name}`, undefined, "MatchWizardDialog");
			// Most processing is now handled by UploadStep.processFileAndNavigate
			// This method is kept for any dialog-specific logic if needed in the future
		} catch (error) {
			Log.error("Error in file selected callback", error as Error, "MatchWizardDialog");
		}
	}

	/**
	 * Handler for when a header row is selected
	 */
	private handleHeaderSelected(rowIndex: number, coordinates: any): void {
		try {
			// Update wizard model via the MatchWizard
			this.matchWizard.setHeaderSelection(rowIndex, coordinates);

			// Process data again with the selected coordinates to get validated data
			// This is done asynchronously to avoid blocking the UI
			this.matchWizard.reprocessWithCoordinates(coordinates.a1Coordinates);

			Log.debug(`Header row selected: ${rowIndex}`, undefined, "MatchWizardDialog");
		} catch (error) {
			Log.error("Error handling header selection", error as Error, "MatchWizardDialog");
		}
	}

	/**
	 * Handler for wizard step change
	 */
	async onWizardStepChanged (event: Wizard$StepActivateEvent): Promise<void> {
		try {
			const stepIndex = event.getParameter("index") as number;
			const wizardSteps = this.wizard.getSteps();
			if (stepIndex < 0 || stepIndex >= wizardSteps.length) return;

			const step = wizardSteps[stepIndex];
			if (!step) return;

			const customData = step.getCustomData();
			if (!customData || customData.length === 0) return;

			const stepName = customData[0].getValue();
			if (!stepName) return;

			// Update current step in the model
			this.matchWizard.getWizardModel().setProperty("/currentStep", stepName);

			Log.debug(`Step changed to: ${stepName}`, undefined, "MatchWizardDialog");

			try {
				await this.activateStep(stepName);
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

			// Reset built steps
			this.stepsBuilt.clear();

			// Clear step controls references
			this.wizardStepControls = {};

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
	onFileUpload(event: any): void {
		try {
			const uploadStep = this.matchWizard.getOrCreateStepController("uploadStep");
			if (uploadStep && typeof uploadStep.onFileUpload === "function") {
				uploadStep.onFileUpload(event);
			} else {
				Log.error("UploadStep controller not found or onFileUpload method missing", undefined, "MatchWizardDialog");
			}
		} catch (error) {
			Log.error("Error delegating file upload to step", error as Error, "MatchWizardDialog");
		}
	}

	/**
	 * Handler for file drop event from the fragment
	 * Delegates to the UploadStep controller
	 */
	onFileDrop(event: any): void {
		try {
			const uploadStep = this.matchWizard.getOrCreateStepController("uploadStep");
			if (uploadStep && typeof uploadStep.onFileDrop === "function") {
				uploadStep.onFileDrop(event);
			} else {
				Log.error("UploadStep controller not found or onFileDrop method missing", undefined, "MatchWizardDialog");
			}
		} catch (error) {
			Log.error("Error delegating file drop to step", error as Error, "MatchWizardDialog");
		}
	}

	/**
	 * Set wizard and util references in step controllers after dialog creation
	 */
	private setStepReferences(): void {
		try {
			const uploadStep = this.matchWizard.getOrCreateStepController("uploadStep");
			if (uploadStep && typeof uploadStep.setWizardReferences === "function") {
				uploadStep.setWizardReferences(this.wizard, this.util);
			}
		} catch (error) {
			Log.error("Error setting step references", error as Error, "MatchWizardDialog");
		}
	}

	/**
	 * Manually activate a step - used when automatic step change events don't fire
	 * @param stepName The name of the step to activate
	 */
	public async activateStepManually(stepName: string): Promise<void> {
		try {
			Log.debug(`Manually activating step: ${stepName}`, undefined, "MatchWizardDialog");
			await this.activateStep(stepName);
		} catch (error) {
			Log.error(`Error manually activating step '${stepName}'`, error as Error, "MatchWizardDialog");
		}
	}
}
