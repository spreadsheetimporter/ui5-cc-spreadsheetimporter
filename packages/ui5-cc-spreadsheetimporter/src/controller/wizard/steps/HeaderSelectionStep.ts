import VBox from "sap/m/VBox";
import MatchWizard from "../MatchWizard";
import ColumnListItem from "sap/m/ColumnListItem";
import Table from "sap/m/Table";
import Column from "sap/m/Column";
import Text from "sap/m/Text";
import JSONModel from "sap/ui/model/json/JSONModel";
import Log from "sap/base/Log";
import MessageToast from "sap/m/MessageToast";
import PreviewStep from "./PreviewStep";

/**
 * HeaderSelectionStep – lets user pick the header row from the sheet preview.
 */
export default class HeaderSelectionStep {
	public readonly stepName = "headerSelectionStep";

	private matchWizard: MatchWizard;
	private isValidated: boolean = false;

	constructor(matchWizard: MatchWizard) {
		this.matchWizard = matchWizard;
	}

	public build(container: VBox): void {
		// unvalidate step
		this.isValidated = false;
		this.matchWizard.getWizardModel().setProperty("/headerSelected", false);
		this.matchWizard.getStep("headerSelectionStep").setValidated(false);

		container.removeAllItems();

		const table = this.createHeaderSelectionTable(this.matchWizard.rawSheetData, 10);
		table.attachSelectionChange(async (e) => {
			const item = e.getParameter("listItem") as ColumnListItem;
			const context = item.getBindingContext();
			const rowData = context.getObject() as any;
			const rowIndex = rowData.__metadata__.rowNumber;
			const coords = this.matchWizard.calculateAndSetReadCoordinates(rowIndex, rowData, this.matchWizard.rawSheetData.length);
			if (coords) {
				await this.handleHeaderSelection(rowIndex, coords);
			}
		});

		container.addItem(table);
	}

	/**
	 * Handles header selection with validation and automatic step navigation
	 */
	private async handleHeaderSelection(
		rowIndex: number,
		coordinates: {
			a1Coordinates: string;
			objectCoordinates: any;
		}
	): Promise<void> {
		try {
			const headerStep = this.matchWizard.getStep("headerSelectionStep");
			headerStep.setBusyIndicatorDelay(0);
			headerStep.setBusy(true);

			if (headerStep && this.matchWizard.wizard.getCurrentStep() !== headerStep.getId()) {
				this.matchWizard.wizard.setCurrentStep(headerStep);
			}

			// Update wizard model via the centralized MatchWizard coordinate management
			this.matchWizard.getWizardModel().setProperty("/headerSelected", true);
			this.matchWizard.setCurrentCoordinates(coordinates.a1Coordinates, coordinates.objectCoordinates);

			// Process data again with the selected coordinates to get validated data
			this.matchWizard.processedData = await this.matchWizard.processFile(
				this.matchWizard.currentFile,
				this.matchWizard.getCurrentCoordinates(),
				true // Validate now that we have coordinates
			);

			Log.debug(`Header row selected: ${rowIndex}`, undefined, "HeaderSelectionStep");

			// Validate the data with the selected coordinates using centralized method
			const validationResult = await this.matchWizard.checkHeaderValidityWithCurrentCoordinates();

			// check if header messages still exist
			const headerMessages = this.matchWizard.processedData.validationMessages.filter((message: any) => message.type.title === "EmptyHeaders");

			if (validationResult.isValid) {
				// Scenario 3: Data is valid - go directly to preview
				this.isValidated = true;
				this.validateStep(true);
				this.matchWizard.setUploadButtonEnabled(true);

				// Valid headers but other errors found - Navigate to MessagesStep

				const previewStep = this.matchWizard.getStep("previewDataStep");
				if (headerStep && previewStep && headerStep.getNextStep() !== previewStep.getId()) {
					headerStep.setNextStep(previewStep);
				}

				// Show success message
				const util = this.matchWizard.getUtil();
				const successMessage = util.geti18nText("spreadsheetimporter.headerSelectionSuccess") || "Header row selected successfully. Click Next to continue.";
				MessageToast.show(successMessage);

				// Rebuild preview step
				const previewStepControl = this.matchWizard.getStepControl("previewDataStep") as PreviewStep;
				previewStepControl.build(this.matchWizard.findStepContainer("previewDataStep"), this.matchWizard.processedData);
				this.matchWizard.wizard.nextStep();
			} else if (headerMessages.length > 0) {
				// Scenario 2: Validation failed AND header messages exist - selection was false, show message to user
				const util = this.matchWizard.getUtil();
				const errorMessage = util.geti18nText("spreadsheetimporter.headerValidationFailed") || "Header selection failed. Please select a different row.";
				MessageToast.show(errorMessage);
			} else {
				// Scenario 1: Validation failed AND no header messages - go to messageStep
				this.isValidated = true;
				this.validateStep(true)

				// Navigate to MessagesStep
				const messagesStepControl = this.matchWizard.getStep("messagesStep");
				if (headerStep && messagesStepControl && headerStep.getNextStep() !== messagesStepControl.getId()) {
					headerStep.setNextStep(messagesStepControl);
				}

				// Store validation messages in the message handler for use in MessagesStep
				if (this.matchWizard.getDialogController()?.messageHandler) {
					this.matchWizard.getDialogController().messageHandler.setMessages(this.matchWizard.processedData.validationMessages);
				}
				// Build or rebuild messagesStep
				if (this.matchWizard.stepsBuilt.has("messagesStep")) {
					const messagesController = this.matchWizard.getStepControl("messagesStep");
					messagesController.build(this.matchWizard.findStepContainer("messagesStep"));
				} else {
					this.matchWizard.activateStep("messagesStep");
				}

				Log.warning(`Header validation failed for row ${rowIndex}`, JSON.stringify(validationResult.messages), "HeaderSelectionStep");
				this.matchWizard.wizard.nextStep();
			}
			headerStep.setBusy(false);
		} catch (error) {
			Log.error("Error handling header selection", error as Error, "HeaderSelectionStep");
			this.isValidated = false;

			// Show error message
			const util = this.matchWizard.getUtil();
			const errorMessage = util.geti18nText("spreadsheetimporter.headerSelectionError") || "Error validating header selection.";
			MessageToast.show(errorMessage);
			this.matchWizard.getStep("headerSelectionStep").setBusy(false);
		}
	}

	/**
	 * Validates this step and shows the next button
	 */
	private validateStep(validated: boolean): void {
		try {
			// Get the wizard step control and set it as validated
			const headerStepControl = this.matchWizard.getStep("headerSelectionStep");
			if (headerStepControl) {
				headerStepControl.setValidated(validated);

				// Update the wizard model to reflect header selection
				this.matchWizard.getWizardModel().setProperty("/headerSelected", true);

				Log.debug("Header selection step validated, next button should now be visible", undefined, "HeaderSelectionStep");
			}
		} catch (error) {
			Log.error("Error validating step", error as Error, "HeaderSelectionStep");
		}
	}

	/**
	 * Creates a table for header selection
	 * Moved from MatchWizard to reduce its complexity
	 */
	private createHeaderSelectionTable(rawSheetData: any[][], maxRows: number = 10): Table {
		try {
			// Prepare table data - only first X rows for header selection
			const preparedData = this.matchWizard.prepareTableData(rawSheetData, 0, maxRows);

			// Create a new table instance
			const table = new Table({
				mode: "SingleSelectMaster",
				growing: true,
				growingThreshold: 10
			});

			// Add row number column
			table.addColumn(
				new Column({
					width: "4rem",
					header: new Text({
						text: this.matchWizard.getUtil().geti18nText("spreadsheetimporter.rowNumber")
					})
				})
			);

			// Add dynamic columns for each data column
			for (const column of preparedData.columns) {
				table.addColumn(
					new Column({
						header: new Text({ text: column.title })
					})
				);
			}

			// Create a row template for the table
			const template = new ColumnListItem();

			// Add row number cell
			template.addCell(new Text({ text: "{__metadata__/rowNumber}" }));

			// Add cells for each column
			for (const column of preparedData.columns) {
				template.addCell(new Text({ text: `{${column.key}}` }));
			}

			// Create a JSON model with the data
			const model = new JSONModel();
			model.setData(preparedData.data);

			// Set the model and bind items
			table.setModel(model);
			table.bindItems({
				path: "/",
				template: template
			});

			return table;
		} catch (error) {
			Log.error("Error creating header selection table", error as Error, "HeaderSelectionStep");
			// Return an empty table as fallback
			return new Table();
		}
	}
}
