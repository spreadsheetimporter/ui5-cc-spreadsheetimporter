import VBox from "sap/m/VBox";
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
export default class PreviewStep {
	public readonly stepName = "previewDataStep";

	private matchWizard: MatchWizard;
	private workbook: XLSX.WorkBook;
	private sheetName: string;
	private a1Coordinates: string;
	private processedData: any;
	private container: VBox; // Store container reference for rebuilding

	constructor(matchWizard: MatchWizard, workbook: XLSX.WorkBook, sheetName: string, a1Coordinates: string, processedData?: any) {
		this.matchWizard = matchWizard;
		this.workbook = workbook;
		this.sheetName = sheetName;
		this.a1Coordinates = a1Coordinates;
		this.processedData = processedData;
	}

	public async build(container: VBox, processedData?: any): Promise<void> {
		// Store container reference and optionally update data
		this.container = container;

		if (processedData) {
			this.a1Coordinates = processedData.coordinates || this.a1Coordinates;
			this.workbook = processedData.workbook;
			this.sheetName = processedData.sheetName;
			this.processedData = processedData;
		}

		Log.debug("Building/rebuilding preview step", undefined, "PreviewStep");

		// Clear existing content
		container.removeAllItems();

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

			Log.debug("Preview step built/rebuilt successfully", undefined, "PreviewStep");
		} catch (error) {
			// Add an error message to the container
			const errorMessage = error instanceof Error ? error.message : String(error);
			container.addItem(
				new MessageStrip({
					text: "Error creating preview: " + errorMessage,
					type: "Error",
					showIcon: true
				})
			);

			Log.error("Error building/rebuilding preview step", error as Error, "PreviewStep");
		}
	}

	/**
	 * Rebuilds the preview table with optional new data
	 * This is now just a convenience method that calls build()
	 */
	public async rebuildTable(newProcessedData?: any): Promise<void> {
		if (!this.container) {
			Log.warning("Container not available for table rebuild", undefined, "PreviewStep");
			return;
		}

		await this.build(this.container, newProcessedData);
	}

	/**
	 * Updates the step with new data and rebuilds the table
	 */
	public async updateData(workbook?: XLSX.WorkBook, sheetName?: string, a1Coordinates?: string, processedData?: any): Promise<void> {
		// Update properties if provided
		if (workbook) this.workbook = workbook;
		if (sheetName) this.sheetName = sheetName;
		if (a1Coordinates) this.a1Coordinates = a1Coordinates;
		if (processedData) this.processedData = processedData;
	}

	/**
	 * Create preview table from processed data with enriched information
	 */
	private createProcessedDataPreview(): any {
		// Get processed data from ImportService
		const data = this.processedData.payloadArray || this.processedData.payload;

		// Use the processed data to create a table with advanced features
		// The data here is already parsed according to field types and validated
		return this.matchWizard.previewHandler.createDynamicTable(data, new Map(), []);
	}

	/**
	 * Creates a preview table for data with the selected header row
	 * Moved from MatchWizard to reduce its complexity
	 */
	private async createDataPreviewTable(workbook: XLSX.WorkBook, sheetName: string, coordinates: string, validate = false) {
		try {
			if (!workbook || !sheetName || !coordinates) {
				Log.error("Missing parameters for data preview", undefined, "PreviewStep");
				return null;
			}

			// Use ImportService's pipeline to get consistent data processing
			const result = await this.matchWizard.getImportService().processAndValidate(workbook, sheetName, coordinates, {
				resetMessages: false,
				validate: validate
			});

			// Get the appropriate data from result
			// If validation ran, use payloadArray (processed data)
			// Otherwise use the raw data
			const data = validate && result.payloadArray ? result.payloadArray : result.spreadsheetSheetsData;

			// Use the Preview's createDynamicTable to create a table
			return this.matchWizard.previewHandler.createDynamicTable(data, new Map(), []);
		} catch (error) {
			Log.error("Error creating data preview", error as Error, "PreviewStep");
			return null;
		}
	}
}
