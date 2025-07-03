import ManagedObject from 'sap/ui/base/ManagedObject';
import Fragment from 'sap/ui/core/Fragment';
import SpreadsheetDialog from '../../control/SpreadsheetDialog';
import { SpreadsheetDialog$FileDropEvent } from '../../control/SpreadsheetDialog';
import Wizard, { Wizard$StepActivateEvent } from 'sap/m/Wizard';
import JSONModel from 'sap/ui/model/json/JSONModel';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import Log from 'sap/base/Log';
import Component from '../../Component';
import Util from '../Util';
import VBox from 'sap/m/VBox';
import MessageToast from 'sap/m/MessageToast';
import MessageHandler from '../MessageHandler';
import SpreadsheetUpload from '../SpreadsheetUpload';
import ImportService from '../ImportService';
import OData from '../odata/OData';
import WizardController from '../wizard/Wizard';
import WizardStep from 'sap/m/WizardStep';
import UploadStep from '../wizard/steps/UploadStep';
import { Action } from '../../enums';
import TemplateService from '../services/TemplateService';

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class WizardDialog extends ManagedObject {
  /**
   * WizardDialog orchestrates the wizard steps for the import process.
   * It manages the dialog lifecycle, step navigation, and coordination between steps.
   */
  private dialog: SpreadsheetDialog;
  private component: Component;
  private spreadsheetUploadController: SpreadsheetUpload;
  private wizard: Wizard;
  private wizardController: WizardController;
  private util: Util;
  private resolvePromise: (value: any) => void;
  private rejectPromise: (reason?: any) => void;
  private componentI18n: ResourceModel;
  private messageHandler: MessageHandler;
  private importService: ImportService;
  private odataHandler: OData;
  private templateService: TemplateService;

  /**
   * Creates a new instance of WizardDialog
   */
  constructor(spreadsheetUploadController: SpreadsheetUpload, component: Component, componentI18n: ResourceModel, messageHandler: MessageHandler) {
    super();
    this.spreadsheetUploadController = spreadsheetUploadController;
    this.component = component;
    this.componentI18n = componentI18n;
    this.messageHandler = messageHandler;
    this.util = new Util(componentI18n.getResourceBundle() as ResourceBundle);

    // Initialize the core components
    this.wizardController = new WizardController(
      component,
      componentI18n.getResourceBundle() as ResourceBundle,
      messageHandler,
      spreadsheetUploadController,
      this
    );

    this.importService = new ImportService(
      spreadsheetUploadController,
      component,
      componentI18n.getResourceBundle() as ResourceBundle,
      messageHandler
    );

    // Initialize template service
    this.templateService = new TemplateService(component, spreadsheetUploadController, componentI18n.getResourceBundle() as ResourceBundle);
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
          this.wizardController.collectStepReferences(this.wizard);
          // Configure the step sequence based on visibility
          this.wizardController.configureStepSequence(this.wizard);
          this.wizardController.setWizardToSteps(this.wizard);
          this.navigateToStep('uploadStep');
        })
        .catch(error => {
          Log.error('Error opening match wizard', error as Error, 'WizardDialog');
          reject(error);
        });
    });
  }

  /**
   * Creates the wizard dialog
   */
  private async createDialog(): Promise<void> {
    this.dialog = (await Fragment.load({
      name: 'cc.spreadsheetimporter.XXXnamespaceXXX.fragment.Wizard',
      type: 'XML',
      controller: this
    })) as SpreadsheetDialog;

    // Set models
    this.dialog.setModel(this.componentI18n, 'i18n');

    // Create info model similar to SpreadsheetUploadDialog
    const infoModel = new JSONModel({
      dataRows: 0,
      strict: this.component.getStrict(),
      hidePreview: this.component.getHidePreview(),
      showOptions: this.component.getShowOptions(),
      showDownloadButton: this.component.getShowDownloadButton(),
      hideGenerateTemplateButton: false,
      fileUploadValue: '',
      densityClass: this.component._densityClass,
      action: this.component.getAction()
    });

    // Control hideGenerateTemplateButton logic
    if (this.component.getStandalone() && this.component.getColumns().length === 0 && !this.component.getSpreadsheetTemplateFile()) {
      infoModel.setProperty('/hideGenerateTemplateButton', true);
    }

    this.dialog.setModel(infoModel, 'info');

    // Add action to wizard model
    const wizardModel = this.wizardController.getWizardModel();
    wizardModel.setProperty('/action', this.component.getAction());
    this.dialog.setModel(wizardModel, 'wizard');

    // Set up drag and drop
    this.dialog.setComponent(this.component);
    this.dialog.attachFileDrop(this.onFileDrop.bind(this));

    // Get wizard reference - adjusted index due to added VBox
    this.wizard = this.dialog.getContent()[1] as Wizard;
    this.wizardController.wizard = this.wizard;
  }

  /**
   * Navigate to a specific step in the wizard
   */
  private navigateToStep(stepName: string): void {
    try {
      // Get step control from our map
      const step = this.wizardController.getWizardStepControl(stepName);
      if (!step) {
        Log.warning(`Step ${stepName} not found`, undefined, 'WizardDialog');
        return;
      }

      // Navigate to the step - goToStep takes the step itself as the parameter and a boolean for focus
      this.wizard.goToStep(step, true);

      // Update the current step in the model
      this.wizardController.getWizardModel().setProperty('/currentStep', stepName);

      Log.debug(`Navigated to step: ${stepName}`, undefined, 'WizardDialog');
    } catch (error) {
      Log.error(`Error navigating to step ${stepName}`, error as Error, 'WizardDialog');
    }
  }

  /**
   * Handler for wizard step change
   */
  async onWizardStepChanged(event: Wizard$StepActivateEvent): Promise<void> {
    try {
      const currentStepIndex = event.getParameter('index') as number;
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
        const nextStep = wizardSteps.find(wizardStep => wizardStep.getId() === nextStepId);
        customData = nextStep?.getCustomData();
      }

      if (!customData || customData.length === 0) return;

      const stepName = customData[0].getValue();
      if (!stepName) return;

      // Update current step in the model
      this.wizardController.getWizardModel().setProperty('/currentStep', stepName);

      Log.debug(`Step changed to: ${stepName}`, undefined, 'WizardDialog');

      try {
        // await this.wizardController.activateStep(stepName);
      } catch (error) {
        Log.error(`Error activating step '${stepName}'`, error as Error, 'WizardDialog');
      }
    } catch (error) {
      Log.error('Error in wizard step change', error as Error, 'WizardDialog');
    }
  }

  /**
   * Handler for wizard completion
   */
  onWizardComplete(): void {
    this.wizardController.getWizardModel().setProperty('/currentStep', 'previewDataStep');
  }

  /**
   * Handler for wizard finish button
   */
  async onWizardFinish(): Promise<void> {
    this.setBusy(true);
    try {
      // Get data from the Wizard model and state
      const wizardModel = this.wizardController.getWizardModel();
      const a1Coordinates = wizardModel.getProperty('/readSheetCoordinates');
      const workbookData = this.wizardController.getWorkbookData();
      const currentFile = this.wizardController.getCurrentFile();

      if (!a1Coordinates || !workbookData) {
        Log.error('Missing data for finish operation', undefined, 'WizardDialog');
        this.resolvePromise({ coordinates: null, canceled: true });
        this.dialog.close();
        return;
      }

      const { workbook, sheetName } = workbookData;

      // Use the already processed data if available, or process again if needed
      let result;
      const processedData = this.wizardController.getProcessedData();
      if (processedData && processedData.coordinates === a1Coordinates) {
        // We already have processed data with validation
        result = processedData;
        if (this.wizardController.getWizardModel().getProperty('/forceUpload')) {
          result.canceled = false;
        }
      } else {
        // Process the data using the import service
        result = await this.importService.processAndValidate(workbook, sheetName, a1Coordinates, {
          resetMessages: false,
          validate: false,
          showMessages: false
        });
      }

      if (result.canceled) {
        MessageToast.show(this.util.geti18nText('spreadsheetimporter.validationFailed'));
        this.resolvePromise({ coordinates: a1Coordinates, canceled: true });
      } else {
        // Execute upload with appropriate method
        const uploadSuccess = await this.importService.executeUpload(result.payloadArray, currentFile);

        if (uploadSuccess) {
          MessageToast.show(this.util.geti18nText('spreadsheetimporter.uploadSuccessful'));
          this.resolvePromise({
            coordinates: a1Coordinates,
            canceled: false,
            workbook: workbook,
            sheetName: sheetName,
            sheetData: result.payloadArray || result.payload
          });
        } else {
          MessageToast.show(this.util.geti18nText('spreadsheetimporter.uploadFailed'));
          this.resolvePromise({ coordinates: a1Coordinates, canceled: true });
        }
      }
    } catch (error) {
      Log.error('Error in wizard finish', error as Error, 'WizardDialog');
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
      this.wizardController.reset();

      // Clear dialog references
      this.dialog = null;

      Log.debug('Dialog and resources fully destroyed', undefined, 'WizardDialog');
    } catch (error) {
      Log.error('Error during dialog cleanup', error as Error, 'WizardDialog');
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
   * Handler for file drop event from drag and drop
   */
  onFileDrop(event: SpreadsheetDialog$FileDropEvent): void {
    const files = event.getParameter('files');
    if (files && files.length > 0) {
      const file = files[0] as File;
      // Update the wizard model with the file name
      this.wizardController.getWizardModel().setProperty('/fileUploadValue', file.name);
      // Handle the file as if it was uploaded normally
      this.handleFileFromDrop(file);
    }
  }

  /**
   * Handle file from drag and drop
   */
  private async handleFileFromDrop(file: File): Promise<void> {
    try {
      this.wizardController.getStep('uploadStep').setBusyIndicatorDelay(0);
      this.wizardController.getStep('uploadStep').setBusy(true);
      const uploadStep = (await this.wizardController.activateStep('uploadStep')) as UploadStep;
      // Create a mock event object with the file
      const mockEvent = {
        getParameter: (paramName: string) => {
          if (paramName === 'files') {
            return [file];
          }
          return null;
        }
      };
      uploadStep.onFileUpload(mockEvent);
      if (this.wizardController.getStep('uploadStep')) {
        this.wizard.setCurrentStep(this.wizardController.getStep('uploadStep'));
      }
    } catch (error) {
      Log.error('Error handling dropped file', error as Error, 'WizardDialog');
      this.wizardController.getStep('uploadStep').setBusy(false);
    }
  }

  /**
   * Handler for file upload event from the fragment
   * Delegates to the UploadStep controller
   */
  async onFileUpload(event: any): Promise<void> {
    try {
      this.wizardController.getStep('uploadStep').setBusyIndicatorDelay(0);
      this.wizardController.getStep('uploadStep').setBusy(true);
      const uploadStep = (await this.wizardController.activateStep('uploadStep')) as UploadStep;
      uploadStep.onFileUpload(event);
      if (this.wizardController.getStep('uploadStep')) {
        this.wizard.setCurrentStep(this.wizardController.getStep('uploadStep'));
      }
      // this.wizardController.getStep("uploadStep").setBusy(false);
    } catch (error) {
      Log.error('Error delegating file upload to step', error as Error, 'WizardDialog');
      this.wizardController.getStep('uploadStep').setBusy(false);
    }
  }

  setODataHandler(odataHandler: OData): void {
    this.odataHandler = odataHandler;
  }
  getDialog(): SpreadsheetDialog {
    return this.dialog;
  }

  /**
   * Formatter for simple action text display
   * @param {string} action - The current action (CREATE, UPDATE, DELETE, UPSERT)
   * @param {string} createText - i18n text for create action
   * @param {string} updateText - i18n text for update action
   * @param {string} deleteText - i18n text for delete action
   * @param {string} upsertText - i18n text for upsert action
   * @returns {string} Simple action title
   */
  formatSimpleActionText(action: string, createText: string, updateText: string, deleteText: string, upsertText: string): string {
    switch (action) {
      case Action.Create:
        return createText;
      case Action.Update:
        return updateText;
      case Action.Delete:
        return deleteText;
      case Action.Upsert:
        return upsertText;
      default:
        return createText;
    }
  }

  /**
   * Template download handler using TemplateService
   */
  async onTempDownload(): Promise<void> {
    try {
      await this.templateService.downloadTemplate();
    } catch (error) {
      Log.error('Error downloading template', error as Error, 'WizardDialog');
      MessageToast.show(this.util.geti18nText('spreadsheetimporter.errorDownloadingTemplate'));
    }
  }

  /**
   * Formatter for action text display with title and description
   * @param {string} action - The current action (CREATE, UPDATE, DELETE, UPSERT)
   * @param {string} createText - i18n text for create action
   * @param {string} updateText - i18n text for update action
   * @param {string} deleteText - i18n text for delete action
   * @param {string} upsertText - i18n text for upsert action
   * @param {string} createDesc - i18n description for create action
   * @param {string} updateDesc - i18n description for update action
   * @param {string} deleteDesc - i18n description for delete action
   * @param {string} upsertDesc - i18n description for upsert action
   * @returns {string} Formatted text with title and description
   */
  formatActionText(
    action: string,
    createText: string,
    updateText: string,
    deleteText: string,
    upsertText: string,
    createDesc: string,
    updateDesc: string,
    deleteDesc: string,
    upsertDesc: string
  ): string {
    let title = '';
    let description = '';

    switch (action) {
      case Action.Create:
        title = createText;
        description = createDesc;
        break;
      case Action.Update:
        title = updateText;
        description = updateDesc;
        break;
      case Action.Delete:
        title = deleteText;
        description = deleteDesc;
        break;
      case Action.Upsert:
        title = upsertText;
        description = upsertDesc;
        break;
      default:
        title = createText;
        description = createDesc;
    }

    return `<strong>${title}</strong><br/>${description}`;
  }
}
