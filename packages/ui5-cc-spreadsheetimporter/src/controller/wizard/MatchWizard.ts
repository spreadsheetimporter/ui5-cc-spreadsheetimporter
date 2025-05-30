import ManagedObject from "sap/ui/base/ManagedObject";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import JSONModel from "sap/ui/model/json/JSONModel";
import * as XLSX from "xlsx";
import Log from "sap/base/Log";
import Util from "../Util";
import SheetHandler from "../SheetHandler";
import Preview from "../Preview";
import Component from "../../Component";
import ImportService from "../ImportService";
import MessageHandler from "../MessageHandler";
import SpreadsheetUpload from "../SpreadsheetUpload";
import StepBase from "./steps/StepBase";
import UploadStep from "./steps/UploadStep";
import HeaderSelectionStep from "./steps/HeaderSelectionStep";
import PreviewStep from "./steps/PreviewStep";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class MatchWizard extends ManagedObject {
    /**
     * MatchWizard contains utility methods for the wizard functionality,
     * extracted from MatchWizardDialog to separate data processing from UI.
     *
     * This class handles:
     * - Step management (creation, configuration, visibility)
     * - Table data preparation
     * - Header row selection
     * - File processing
     * - Workbook and sheet handling
     */
    private component: Component;
    private util: Util;
    public previewHandler: Preview;
    private messageHandler: MessageHandler;
    private importService: ImportService;
    protected resourceBundle: ResourceBundle;
    private spreadsheetUploadController: SpreadsheetUpload;

    // Registry of step controllers - StepBase instances for logic
    private stepControllers: { [key: string]: StepBase } = {};
    // Registry of WizardStep UI controls from fragment
    private steps: { [key: string]: any } = {}; // WizardStep controls
    private stepsBuilt: Set<string> = new Set();

    // Current wizard state
    private wizardModel: JSONModel;
    private stepDefinitions: Array<{stepName: string, index: number}> = [];

    // Data storage
    private workbook: XLSX.WorkBook;
    private sheetName: string;
    private rawSheetData: any[][] = null;
    private processedData: any = null;
    private currentFile: File | null = null;

    // Dialog controller reference for step activation
    private dialogController: any = null;

    /**
     * Creates a new instance of MatchWizard
     * @param component UI5 Component instance
     * @param resourceBundle The i18n resource bundle
     * @param messageHandler The message handler instance for validation messages
     */
    constructor(
        component: Component,
        resourceBundle: ResourceBundle,
        messageHandler: MessageHandler
    ) {
        super();
        this.component = component;
        this.resourceBundle = resourceBundle;
        this.messageHandler = messageHandler;
        this.util = new Util(resourceBundle);
        this.previewHandler = new Preview(this.util);

        // Initialize import service
        this.importService = new ImportService(
            null, // Will be set later when needed
            component,
            resourceBundle,
            messageHandler
        );

        // Initialize wizard model
        this.wizardModel = new JSONModel({
            currentStep: "uploadStep",
            headerSelected: false,
            readSheetCoordinates: this.component.getReadSheetCoordinates() || "A1",
            fileUploadValue: "",
            fileUploaded: false,
            // Visibility flags for steps
            stepUploadVisible: true,
            stepHeaderSelectionVisible: true,
            stepPreviewDataVisible: true
        });

        // Define the wizard step sequence
        this.stepDefinitions = [
            { stepName: "uploadStep", index: 1 },
            { stepName: "headerSelectionStep", index: 2 },
            { stepName: "previewDataStep", index: 3 }
        ];
    }

    /**
     * Sets the SpreadsheetUpload controller reference
     * @param spreadsheetUploadController The controller reference
     */
    setSpreadsheetUploadController(spreadsheetUploadController: any) {
        this.spreadsheetUploadController = spreadsheetUploadController;

        // Update the import service with the controller reference
        this.importService = new ImportService(
            spreadsheetUploadController,
            this.component,
            this.resourceBundle,
            this.messageHandler
        );
    }

    /**
     * Gets the wizard model
     * @returns JSONModel for the wizard state
     */
    getWizardModel(): JSONModel {
        return this.wizardModel;
    }

    /**
     * Gets step definitions
     * @returns Array of step definitions with index information
     */
    getStepDefinitions(): Array<{stepName: string, index: number}> {
        return this.stepDefinitions;
    }

    /**
     * Initializes the step controllers - creates all needed step controllers
     * @param fileSelectedCallback Callback for when a file is selected
     * @param headerSelectedCallback Callback for when a header row is selected
     */
    initializeStepControllers(
        fileSelectedCallback: (file: File) => Promise<void>,
        headerSelectedCallback: (row: number, coords: any) => void
    ): void {
        // Create the upload step with MatchWizard reference
        this.stepControllers.uploadStep = new UploadStep(
            fileSelectedCallback,
            this // Pass MatchWizard instance
        );

        // Other steps will be created on demand based on data availability
    }

    /**
     * Get or create a specific step controller
     * @param stepName The name of the step
     * @param headerSelectedCallback Callback for header selection (only needed for that step)
     * @returns The step controller instance
     */
    getOrCreateStepController(
        stepName: string,
        headerSelectedCallback?: (row: number, coords: any) => void
    ): StepBase | null {
        // Return existing controller if available
        if (this.stepControllers[stepName]) {
            return this.stepControllers[stepName];
        }

        // Create controller if needed
        if (stepName === "uploadStep") {
            // Recreate UploadStep if it doesn't exist (e.g., after dialog reset)
            this.stepControllers[stepName] = new UploadStep(
                async (file: File) => {
                    // This callback might be empty or minimal since most logic is in the step itself
                },
                this // Pass MatchWizard instance
            );
            return this.stepControllers[stepName];
        }
        else if (stepName === "headerSelectionStep" && this.rawSheetData) {
            this.stepControllers[stepName] = new HeaderSelectionStep(
                this,
                this.rawSheetData,
                headerSelectedCallback
            );
            return this.stepControllers[stepName];
        }
        else if (stepName === "previewDataStep" && this.workbook && this.sheetName) {
            const coords = this.wizardModel.getProperty("/readSheetCoordinates") || "A1";

            // Use processedData if available, which includes validation results
            if (this.processedData && this.processedData.payloadArray) {
                this.stepControllers[stepName] = new PreviewStep(
                    this,
                    this.workbook,
                    this.sheetName,
                    coords,
                    this.processedData // Pass the complete processed data to the preview step
                );
            } else {
                this.stepControllers[stepName] = new PreviewStep(
                    this,
                    this.workbook,
                    this.sheetName,
                    coords
                );
            }
            return this.stepControllers[stepName];
        }

        return null;
    }

    /**
     * Configure wizard steps based on state
     * @param initialData Information about available data to configure steps
     */
    configureWizardSteps(initialData: {
        workbook?: XLSX.WorkBook,
        sheetName?: string,
        coordinates?: string,
        headerValid?: boolean
    }): void {
        // Store the workbook and sheetName if provided
        if (initialData.workbook && initialData.sheetName) {
            this.workbook = initialData.workbook;
            this.sheetName = initialData.sheetName;

            // Load raw sheet data if workbook and sheetName are provided and we don't have it yet
            if (!this.rawSheetData) {
                this.rawSheetData = XLSX.utils.sheet_to_json(
                    this.workbook.Sheets[this.sheetName],
                    { header: 1, raw: false, dateNF: "yyyy-mm-dd" }
                ) as any[][];
            }

            // Set fileUploaded property since we have workbook data
            this.wizardModel.setProperty("/fileUploaded", true);
        }

        // Store information about header validity
        this.wizardModel.setProperty("/headerValid", initialData.headerValid !== false);

        // Store the first step to navigate to
        if (!initialData.workbook || !initialData.sheetName) {
            this.wizardModel.setProperty("/firstStep", "uploadStep");
        } else if (initialData.headerValid === false || !initialData.coordinates) {
            this.wizardModel.setProperty("/firstStep", "headerSelectionStep");
        } else {
            this.wizardModel.setProperty("/firstStep", "previewDataStep");
        }

        Log.debug(`Configured wizard with first step: ${this.wizardModel.getProperty("/firstStep")}`,
            undefined, "MatchWizard");
    }

    /**
     * Configures the step sequence in the wizard using the setNextStep approach
     * @param wizard The UI5 Wizard control instance with enableBranching=true
     * @param wizardSteps Map of step objects with the step control instances from the fragment
     */
    configureStepSequence(wizard: any, wizardSteps: {[key: string]: any}): void {
        // Store the WizardStep controls for later use
        for (const [stepName, stepControl] of Object.entries(wizardSteps)) {
            this.setStepControl(stepName, stepControl);
        }

        // Get references to the step controls
        const uploadStep = this.steps["uploadStep"];
        const headerSelectionStep = this.steps["headerSelectionStep"];
        const previewDataStep = this.steps["previewDataStep"];

        if (!uploadStep || !headerSelectionStep || !previewDataStep) {
            Log.error("Missing step controls", undefined, "MatchWizard");
            return;
        }

        // Default flow: Upload -> Preview (when headers are valid)
        uploadStep.setNextStep(previewDataStep);

        // Alternative flow: Upload -> Header Selection -> Preview (when headers are invalid)
        // This will be set dynamically when header issues are detected
        headerSelectionStep.setNextStep(previewDataStep);

        Log.debug("Configured wizard step sequence", undefined, "MatchWizard");
    }

    /**
     * Gets the first step in the sequence based on configuration
     */
    getFirstStep(): string {
        return this.wizardModel.getProperty("/firstStep") || "uploadStep";
    }

	getStep(stepName: string): StepBase {
		return this.stepControllers[stepName];
	}

	/**
	 * Sets a UI5 WizardStep control reference
	 * @param stepName The name of the step
	 * @param stepControl The WizardStep control from the fragment
	 */
	setStepControl(stepName: string, stepControl: any): void {
		this.steps[stepName] = stepControl;
	}

	/**
	 * Gets a UI5 WizardStep control reference
	 * @param stepName The name of the step
	 * @returns The WizardStep control or null if not found
	 */
	getStepControl(stepName: string): any {
		return this.steps[stepName];
	}

    /**
     * Gets the step index in the sequence
     * @param stepName The name of the step
     * @returns The index of the step or -1 if not found
     */
    getStepIndex(stepName: string): number {
        const step = this.stepDefinitions.find(s => s.stepName === stepName);
        return step ? step.index : -1;
    }

    /**
     * Sets data from a file upload
     */
    setFileData(file: File, processedData: any): void {
        this.currentFile = file;
        this.processedData = processedData;
        this.workbook = processedData.workbook;
        this.sheetName = processedData.sheetName;
        this.rawSheetData = processedData.rawSheetData;

        // Update wizard model
        this.wizardModel.setProperty("/fileUploaded", true);
        this.wizardModel.setProperty("/fileUploadValue", file.name);
    }

    /**
     * Updates header selection information
     */
    setHeaderSelection(rowIndex: number, coordinates: any): void {
        this.wizardModel.setProperty("/headerSelected", true);
        this.wizardModel.setProperty("/readSheetCoordinates", coordinates.a1Coordinates);
        this.wizardModel.setProperty("/readSheetObjectCoordinates", coordinates.objectCoordinates);
    }

    /**
     * Reprocesses the file data with the selected coordinates
     * This updates the processed data with validation
     */
    async reprocessWithCoordinates(coordinates: string): Promise<any> {
        try {
            if (!this.currentFile && !this.workbook) {
                return null;
            }

            // If we have a file, use that. Otherwise use the workbook.
            if (this.currentFile) {
                this.processedData = await this.processFile(
                    this.currentFile,
                    coordinates,
                    true // Validate now that we have coordinates
                );
            } else if (this.workbook && this.sheetName) {
                // Re-process with the workbook instead of file
                this.processedData = await this.importService.processAndValidate(
                    this.workbook,
                    this.sheetName,
                    coordinates,
                    {
                        resetMessages: true,
                        validate: true
                    }
                );
            }

            return this.processedData;
        } catch (error) {
            Log.error("Error reprocessing with coordinates", error as Error, "MatchWizard");
            throw error;
        }
    }

    /**
     * Checks if headers are valid using the given coordinates
     */
    async checkHeaderValidityWithCoordinates(coordinates: string): Promise<{ isValid: boolean, messages?: any[] }> {
        try {
            if (!this.workbook || !this.sheetName) {
                return { isValid: false };
            }

            // Use ImportService to validate the data with the given coordinates
            const result = await this.importService.processAndValidate(
                this.workbook,
                this.sheetName,
                coordinates,
                {
                    resetMessages: true,
                    validate: true
                }
            );

            // If validation produced messages, headers might be invalid
            const validationMessages = result.validationMessages || [];
            const isValid = !result.canceled && validationMessages.length === 0;

            return {
                isValid,
                messages: validationMessages
            };
        } catch (error) {
            Log.error("Error checking header validity", error as Error, "MatchWizard");
            return { isValid: false };
        }
    }

    /**
     * Gets workbook data
     */
    getWorkbookData(): { workbook: XLSX.WorkBook, sheetName: string, rawSheetData: any[][] } | null {
        if (!this.workbook || !this.sheetName) {
            return null;
        }

        return {
            workbook: this.workbook,
            sheetName: this.sheetName,
            rawSheetData: this.rawSheetData
        };
    }

    /**
     * Gets processed data
     */
    getProcessedData(): any {
        return this.processedData;
    }

    /**
     * Gets the current file
     */
    getCurrentFile(): File | null {
        return this.currentFile;
    }

    /**
     * Resets all wizard data
     */
    reset(): void {
        this.stepControllers = {};
        this.steps = {};
        this.stepsBuilt.clear();
        this.workbook = null;
        this.sheetName = null;
        this.rawSheetData = null;
        this.processedData = null;
        this.currentFile = null;

        // Reset wizard model
        this.wizardModel.setProperty("/currentStep", "uploadStep");
        this.wizardModel.setProperty("/headerSelected", false);
        this.wizardModel.setProperty("/readSheetCoordinates", this.component.getReadSheetCoordinates() || "A1");
        this.wizardModel.setProperty("/fileUploadValue", "");
        this.wizardModel.setProperty("/fileUploaded", false);
        this.wizardModel.setProperty("/headerValid", true);
        this.wizardModel.setProperty("/firstStep", "uploadStep");
    }

    /**
     * Prepares data for a table by transforming the raw data into a structured format
     * @param rawData The raw data rows to transform
     * @param startIndex The start index for slicing the data (optional)
     * @param endIndex The end index for slicing the data (optional)
     * @returns An object with the prepared data and column information
     */
    prepareTableData(rawData: any[][], startIndex?: number, endIndex?: number) {
        try {
            // Slice the data if start and end indices are provided
            const dataToProcess = (startIndex !== undefined && endIndex !== undefined)
                ? rawData.slice(startIndex, endIndex)
                : rawData;

            // Create array to hold transformed data
            const tableData = dataToProcess.map((row, index) => {
                const rowData: any = {
                    __metadata__: {
                        rowNumber: startIndex !== undefined ? index + startIndex : index,
                        originalRow: row
                    }
                };

                // Convert array of values to object with column indexes as keys
                row.forEach((cellValue, cellIndex) => {
                    // Ensure cell value is a primitive and not an object
                    const formattedValue = (cellValue !== null && typeof cellValue === 'object')
                        ? JSON.stringify(cellValue)
                        : cellValue;

                    rowData[`col_${cellIndex}`] = formattedValue;
                });

                return rowData;
            });

            // Find the maximum number of columns
            const maxCols = Math.max(...dataToProcess.map(row => row.length));

            // Create column definitions
            const columns = [];
            for (let i = 0; i < maxCols; i++) {
                columns.push({
                    index: i,
                    key: `col_${i}`,
                    title: `Column ${i + 1}`
                });
            }

            return {
                data: tableData,
                columns: columns,
                maxColumns: maxCols
            };
        } catch (error) {
            Log.error("Error preparing table data", error as Error, "MatchWizard");
            return {
                data: [],
                columns: [],
                maxColumns: 0
            };
        }
    }

    /**
     * Calculates the read coordinates when a header row is selected
     * @param selectedRowIndex The selected row index
     * @param rowData The data for the selected row
     * @param totalRows Total rows in the sheet
     * @returns Object with A1 notation and object coordinates
     */
    calculateReadCoordinates(selectedRowIndex: number, rowData: any, totalRows: number) {
        try {
            // Calculate the read coordinates for future use
            // Assuming header row + 1 for data
            const objectCoordinates = {
                s: { r: selectedRowIndex, c: 0 },  // Start (header row)
                e: { r: totalRows - 1, c: Object.keys(rowData).length - 1 }  // End (last row, last column)
            };

            // Convert to A1 notation for use with SheetHandler.sheet_to_json
            const a1Coordinates = Util.convertCoordinatesToA1Notation(objectCoordinates);
            if (!a1Coordinates) {
                Log.error("Failed to convert coordinates to A1 notation", undefined, "MatchWizard");
                return null;
            }

            return {
                a1Coordinates,
                objectCoordinates
            };
        } catch (error) {
            Log.error("Error calculating read coordinates", error as Error, "MatchWizard");
            return null;
        }
    }

    /**
     * Processes a file using ImportService's enhanced methods
     * Returns comprehensive data for header selection, column matching, and preview
     *
     * @param file The uploaded file
     * @param coordinates Optional A1 coordinates if header row is already selected
     * @param validate Whether to perform validation (default: false for initial wizard step)
     * @returns Promise with all processed data
     */
    async processFile(file: Blob, coordinates?: string, validate = false, showMessages = false): Promise<any> {
        try {
            // Use ImportService's processAndValidate method
            // This provides all data needed for wizard steps in one call
            const result = await this.importService.processAndValidate(
                file,
                this.component.getReadSheet(),
                coordinates,
                {
                    resetMessages: true,    // Clear previous messages
                    validate: validate,      // Only validate if requested (typically after header selection)
                    showMessages: showMessages // Show messages if requested
                }
            );

            return result;
        } catch (error) {
            Log.error("Error processing file", error as Error, "MatchWizard");
            throw error;
        }
    }

    /**
     * Processes a file and extracts workbook and sheet data
     * @deprecated Use processFile instead which leverages ImportService
     * @param file The uploaded file
     * @returns Promise resolving to an object with workbook, sheet name, and raw data
     */
    async handleFile(file: Blob): Promise<{
        workbook: XLSX.WorkBook,
        sheetName: string,
        rawSheetData: any[][]
    }> {
        try {
            // Use the enhanced processFile method
            const result = await this.processFile(file);

            return {
                workbook: result.workbook,
                sheetName: result.sheetName,
                rawSheetData: result.rawSheetData
            };
        } catch (error) {
            Log.error("Error processing file", error as Error, "MatchWizard");
            throw error;
        }
    }

    /**
     * Gets the import service instance
     * @returns The ImportService instance
     */
    getImportService(): ImportService {
        return this.importService;
    }

    /**
     * Gets the util instance
     * @returns The Util instance
     */
    getUtil(): Util {
        return this.util;
    }

    /**
     * Sets the dialog controller reference
     * @param dialogController The dialog controller instance
     */
    setDialogController(dialogController: any): void {
        this.dialogController = dialogController;
    }

    /**
     * Gets the dialog controller reference
     * @returns The dialog controller instance
     */
    getDialogController(): any {
        return this.dialogController;
    }
}
