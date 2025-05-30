import VBox from "sap/m/VBox";
import StepBase from "./StepBase";
import MatchWizard from "../MatchWizard";
import * as XLSX from "xlsx";
import Label from "sap/m/Label";
import MessageStrip from "sap/m/MessageStrip";
import List from "sap/m/List";
import StandardListItem from "sap/m/StandardListItem";
import { Messages } from "../../../types";
import Log from "sap/base/Log";

/**
 * PreviewStep – shows a preview table with the parsed data.
 */
export default class PreviewStep extends StepBase {
    public readonly stepName = "previewDataStep";

    private matchWizard: MatchWizard;
    private workbook: XLSX.WorkBook;
    private sheetName: string;
    private a1Coordinates: string;
    private processedData: any;

    constructor(
        matchWizard: MatchWizard,
        workbook: XLSX.WorkBook,
        sheetName: string,
        a1Coordinates: string,
        processedData?: any
    ) {
        super();
        this.matchWizard = matchWizard;
        this.workbook = workbook;
        this.sheetName = sheetName;
        this.a1Coordinates = a1Coordinates;
        this.processedData = processedData;
    }

    public async build(container: VBox): Promise<void> {
        container.removeAllItems();

        // If we have processed data with validation messages, show them first
        if (this.processedData &&
            this.processedData.validationMessages &&
            this.processedData.validationMessages.length > 0) {
            this.addValidationMessages(container, this.processedData.validationMessages);
        }

        try {
            // Show either the comprehensive data or basic preview
            let previewContent;
            if (this.processedData && this.processedData.payloadArray) {
                // Create preview from processed data
                previewContent = this.createProcessedDataPreview();
            } else {
                // Fallback to basic preview - now using local method
                previewContent = await this.createDataPreviewTable(
                    this.workbook,
                    this.sheetName,
                    this.a1Coordinates,
                    true // Enable validation
                );
            }

            if (previewContent) {
                container.addItem(previewContent);
            }
        } catch (error) {
            // Add an error message to the container
            const errorMessage = error instanceof Error ? error.message : String(error);
            container.addItem(new MessageStrip({
                text: "Error creating preview: " + errorMessage,
                type: "Error",
                showIcon: true
            }));
        }
    }

    /**
     * Create preview table from processed data with enriched information
     */
    private createProcessedDataPreview(): any {
        // Get processed data from ImportService
        const data = this.processedData.payloadArray || this.processedData.payload;

        // Use the processed data to create a table with advanced features
        // The data here is already parsed according to field types and validated
        return this.matchWizard.previewHandler.createDynamicTable(
            data,
            new Map(),
            []
        );
    }

    /**
     * Creates a preview table for data with the selected header row
     * Moved from MatchWizard to reduce its complexity
     */
    private async createDataPreviewTable(
        workbook: XLSX.WorkBook,
        sheetName: string,
        coordinates: string,
        validate = false
    ) {
        try {
            if (!workbook || !sheetName || !coordinates) {
                Log.error("Missing parameters for data preview", undefined, "PreviewStep");
                return null;
            }

            // Use ImportService's pipeline to get consistent data processing
            const result = await this.matchWizard.getImportService().processAndValidate(
                workbook,
                sheetName,
                coordinates,
                {
                    resetMessages: false,
                    validate: validate
                }
            );

            // Get the appropriate data from result
            // If validation ran, use payloadArray (processed data)
            // Otherwise use the raw data
            const data = validate && result.payloadArray ?
                result.payloadArray :
                result.spreadsheetSheetsData;

            // Use the Preview's createDynamicTable to create a table
            return this.matchWizard.previewHandler.createDynamicTable(data, new Map(), []);
        } catch (error) {
            Log.error("Error creating data preview", error as Error, "PreviewStep");
            return null;
        }
    }

    /**
     * Add validation messages to the container
     */
    private addValidationMessages(container: VBox, messages: Messages[]): void {
        // Only show if there are messages
        if (!messages || messages.length === 0) {
            return;
        }

        // Add a header
        container.addItem(new Label({
            text: "Validation Results",
            design: "Bold"
        }));

        // Add a message strip for warning
        container.addItem(new MessageStrip({
            text: `There are ${messages.length} validation messages. Review before uploading.`,
            type: "Warning",
            showIcon: true
        }));

        // Create a list of validation messages (limit to first 5)
        const messageList = new List();
        const displayMessages = messages.slice(0, 5);

        for (const msg of displayMessages) {
            messageList.addItem(new StandardListItem({
                title: msg.title,
                info: `Row: ${msg.row || 'N/A'}, Column: ${msg.description || 'N/A'}`,
                type: "Active"
            }));
        }

        // Show count of remaining messages if any
        if (messages.length > 5) {
            messageList.addItem(new StandardListItem({
                title: `+ ${messages.length - 5} more messages...`,
                type: "Inactive"
            }));
        }

        container.addItem(messageList);
    }
}
