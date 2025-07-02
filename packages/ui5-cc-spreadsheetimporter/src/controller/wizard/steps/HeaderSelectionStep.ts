import VBox from "sap/m/VBox";
import Wizard from "../Wizard";
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

	private wizard: Wizard;
	private isValidated: boolean = false;

	constructor(wizard: Wizard) {
		this.wizard = wizard;
	}

	public build(container: VBox): void {
		// unvalidate step
		this.isValidated = false;
		this.wizard.getWizardModel().setProperty("/headerSelected", false);
		this.wizard.getStep("headerSelectionStep").setValidated(false);

		container.removeAllItems();

		const table = this.createHeaderSelectionTable(this.wizard.rawSheetData, 10);
		table.attachSelectionChange(async (e) => {
			const item = e.getParameter("listItem") as ColumnListItem;
			const context = item.getBindingContext();
			const rowData = context.getObject() as any;
			const rowIndex = rowData.__metadata__.rowNumber;
			const coords = this.wizard.calculateAndSetReadCoordinates(rowIndex, rowData, this.wizard.rawSheetData.length);
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
			const headerStep = this.wizard.getStep("headerSelectionStep");
			headerStep.setBusyIndicatorDelay(0);
			headerStep.setBusy(true);

			if (headerStep && this.wizard.wizard.getCurrentStep() !== headerStep.getId()) {
				this.wizard.wizard.setCurrentStep(headerStep);
			}

			// Update wizard model via the centralized Wizard coordinate management
			this.wizard.getWizardModel().setProperty("/headerSelected", true);
			this.wizard.setCurrentCoordinates(coordinates.a1Coordinates, coordinates.objectCoordinates);

			// Process data again with the selected coordinates to get validated data
			this.wizard.processedData = await this.wizard.processFile(
				this.wizard.currentFile,
				this.wizard.getCurrentCoordinates(),
				true // Validate now that we have coordinates
			);

			Log.debug(`Header row selected: ${rowIndex}`, undefined, "HeaderSelectionStep");

			// Validate the data with the selected coordinates using centralized method
			const validationResult = await this.wizard.checkHeaderValidityWithCurrentCoordinates();

			// check if header messages still exist
			const headerMessages = this.wizard.processedData.validationMessages.filter((message: any) => message.type.title === "EmptyHeaders");

			if (validationResult.isValid) {
				// Scenario 3: Data is valid - go directly to preview
				this.isValidated = true;
				this.validateStep(true);
				this.wizard.setUploadButtonEnabled(true);

				// Valid headers but other errors found - Navigate to MessagesStep

				const previewStep = this.wizard.getStep("previewDataStep");
				if (headerStep && previewStep && headerStep.getNextStep() !== previewStep.getId()) {
					headerStep.setNextStep(previewStep);
				}

				// Show success message
				const util = this.wizard.getUtil();
				const successMessage = util.geti18nText("spreadsheetimporter.headerSelectionSuccess") || "Header row selected successfully. Click Next to continue.";
				MessageToast.show(successMessage);

				// Rebuild preview step
				const previewStepControl = this.wizard.getStepControl("previewDataStep") as PreviewStep;
				previewStepControl.build(this.wizard.findStepContainer("previewDataStep"), this.wizard.processedData);
				this.wizard.wizard.nextStep();
			} else if (headerMessages.length > 0) {
				// Scenario 2: Validation failed AND header messages exist - selection was false, show message to user
				const util = this.wizard.getUtil();
				const errorMessage = util.geti18nText("spreadsheetimporter.headerValidationFailed") || "Header selection failed. Please select a different row.";
				MessageToast.show(errorMessage);
			} else {
				// Scenario 1: Validation failed AND no header messages - go to messageStep
				this.isValidated = true;
				this.validateStep(true)

				// Navigate to MessagesStep
				const messagesStepControl = this.wizard.getStep("messagesStep");
				if (headerStep && messagesStepControl && headerStep.getNextStep() !== messagesStepControl.getId()) {
					headerStep.setNextStep(messagesStepControl);
				}

				// Store validation messages in the message handler for use in MessagesStep
				if (this.wizard.getDialogController()?.messageHandler) {
					this.wizard.getDialogController().messageHandler.setMessages(this.wizard.processedData.validationMessages);
				}
				// Build or rebuild messagesStep
				if (this.wizard.stepsBuilt.has("messagesStep")) {
					const messagesController = this.wizard.getStepControl("messagesStep");
					messagesController.build(this.wizard.findStepContainer("messagesStep"));
				} else {
					this.wizard.activateStep("messagesStep");
				}

				Log.warning(`Header validation failed for row ${rowIndex}`, JSON.stringify(validationResult.messages), "HeaderSelectionStep");
				this.wizard.wizard.nextStep();
			}
			headerStep.setBusy(false);
		} catch (error) {
			Log.error("Error handling header selection", error as Error, "HeaderSelectionStep");
			this.isValidated = false;

			// Show error message
			const util = this.wizard.getUtil();
			const errorMessage = util.geti18nText("spreadsheetimporter.headerSelectionError") || "Error validating header selection.";
			MessageToast.show(errorMessage);
			this.wizard.getStep("headerSelectionStep").setBusy(false);
		}
	}

	/**
	 * Validates this step and shows the next button
	 */
	private validateStep(validated: boolean): void {
		try {
			// Get the wizard step control and set it as validated
			const headerStepControl = this.wizard.getStep("headerSelectionStep");
			if (headerStepControl) {
				headerStepControl.setValidated(validated);

				// Update the wizard model to reflect header selection
				this.wizard.getWizardModel().setProperty("/headerSelected", true);

				Log.debug("Header selection step validated, next button should now be visible", undefined, "HeaderSelectionStep");
			}
		} catch (error) {
			Log.error("Error validating step", error as Error, "HeaderSelectionStep");
		}
	}

	/**
	 * Creates a table for header selection
	 */
	private createHeaderSelectionTable(rawSheetData: any[][], maxRows: number = 10): Table {
		try {
			// Prepare table data - only first X rows for header selection
			const preparedData = this.wizard.prepareTableData(rawSheetData, 0, maxRows);

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
						text: this.wizard.getUtil().geti18nText("spreadsheetimporter.rowNumber")
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
