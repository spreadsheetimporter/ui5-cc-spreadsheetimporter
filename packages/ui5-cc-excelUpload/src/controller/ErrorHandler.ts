import Dialog from "sap/m/Dialog";
import { ErrorMessage, ErrorTypes, ListObject, PayloadArray } from "../types";
import ExcelUpload from "./ExcelUpload";
import Util from "./Util";
import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";

export default class ErrorHandler {
	private errorResults: ErrorMessage[] = [];
	private excelUploadController: ExcelUpload;
	private errorDialog: Dialog;

	constructor(excelUploadController: any) {
		this.errorResults = [];
		this.excelUploadController = excelUploadController;
	}

	setErrorResults(errorResults: ErrorMessage[]) {
		this.errorResults = errorResults;
	}

	addToErrorsResults(errorResults: ErrorMessage[]) {
		this.errorResults = this.errorResults.concat(errorResults);
	}

	addParsingError(errorResults: ErrorMessage) {
		this.errorResults.push(errorResults);
	}

	getErrorResults() {
		return this.errorResults;
	}

	checkMandatoryColumns(data: PayloadArray, columnNames: string[], mandatoryFieldsUser: string[], mandatoryFieldsMetadata: string[], typeLabelList: ListObject) {
		// concat mandatory fields arrays and remove duplicates
		const mandatoryFields = [...new Set([...mandatoryFieldsUser, ...mandatoryFieldsMetadata])];
		// check if column is in the data list
		const availableKeyColumns = this.checkKeyColumns(columnNames, mandatoryFields, typeLabelList);
		// check if data is filled in for available columns
		this.checkMandatoryFields(data, availableKeyColumns, typeLabelList);
	}

	checkMandatoryFields(data: PayloadArray, mandatoryFields: string[], typeLabelList: ListObject) {
		if (!mandatoryFields) {
			return;
		}
		for (const mandatoryField of mandatoryFields) {
			const fieldLabel = typeLabelList[mandatoryField]?.label;
			if (!fieldLabel) {
				console.error(`Mandatory Field ${mandatoryField} not found for checking mandatory fields`);
				continue;
			}

			for (const [index, row] of data.entries()) {
				const value = Util.getValueFromRow(row, fieldLabel, mandatoryField, this.excelUploadController.component.getFieldMatchType());
				const errorMessage = {
					title: this.excelUploadController.util.geti18nText("mandatoryFieldNotFilled", [fieldLabel]),
					type: ErrorTypes.MandatoryFieldNotFilled,
					row: index + 2,
					counter: 1,
				} as ErrorMessage;
				if (value === "" || value === undefined) {
					this.errorResults.push(errorMessage);
				}
			}
		}
	}

	checkColumnNames(columnNames: string[], fieldMatchType: string, typeLabelList: ListObject) {
		for (let index = 0; index < columnNames.length; index++) {
			const columnName = columnNames[index];
			let found = false;
			for (const key in typeLabelList) {
				if (typeLabelList.hasOwnProperty(key)) {
					if (fieldMatchType === "label") {
						if (typeLabelList[key].label === columnName) {
							found = true;
							break;
						}
					}
					if (fieldMatchType === "labelTypeBrackets") {
						if (columnName.includes(`[${key}]`)) {
							found = true;
							break;
						}
					}
				}
			}
			if (!found) {
				const errorMessage = {
					title: this.excelUploadController.util.geti18nText("columnNotFound", [columnName]),
					type: ErrorTypes.ColumnNotFound,
					counter: 1,
				} as ErrorMessage;
				this.errorResults.push(errorMessage);
			}
		}
	}

	checkKeyColumns(columnNames: string[], odataKeyList: string[], typeLabelList: ListObject) {
		const availableKeyColumns = [];
		for (let index = 0; index < odataKeyList.length; index++) {
			const columnName = odataKeyList[index];
			let found = false;
			for (const index in columnNames) {
				if (columnNames[index].includes(`[${columnName}]`)) {
					found = true;
					availableKeyColumns.push(columnName);
					break;
				}
			}
			if (!found) {
				const columnNameLabel = typeLabelList[columnName]?.label ? typeLabelList[columnName].label : columnName;
				const errorMessage = {
					title: this.excelUploadController.util.geti18nText("keyColumnNotFound", [columnNameLabel]),
					type: ErrorTypes.ColumnNotFound,
					counter: 1,
				} as ErrorMessage;
				this.errorResults.push(errorMessage);
			}
		}
		return availableKeyColumns;
	}

	areErrorsPresent(): boolean {
		if (this.errorResults.some((error) => error.counter > 0)) {
			return true;
		}
		return false;
	}

	/**
	 * Display errors in the errorArray.
	 * @param {Array} errorArray - Array containing error messages and their counters.
	 */
	async displayErrors() {
		const infoModel = new JSONModel({
			strict: this.excelUploadController.component.getStrict()
		});
		if (!this.errorDialog) {
			this.errorDialog = (await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ErrorDialog",
				type: "XML",
				controller: this,
			})) as Dialog;
		}
		this.errorDialog.setModel(this.excelUploadController.componentI18n, "i18n");
		this.errorDialog.setModel(infoModel, "info");
		this.errorDialog.setModel(new JSONModel(), "errorData");
		const errorGrouped = this.groupErrors(this.errorResults);
		const sortedErrorGrouped = this.sortErrorsByTitle(errorGrouped);
		(this.errorDialog.getModel("errorData") as JSONModel).setData(sortedErrorGrouped);
		this.errorDialog.open();
	}

	groupErrors(errors: ErrorMessage[]): ErrorMessage[] {
		const counterLargerThanOne = errors.filter((error) => error.counter !== 0);
		const parsingErrors = counterLargerThanOne.filter((error) => error.type.group === true);
		const errorGroups = parsingErrors.reduce((groups, error) => {
			if (!groups[error.title]) {
				groups[error.title] = [];
			}
			const errorText = this.excelUploadController.util.geti18nText("errorInRow", [error.row]);
			groups[error.title].push(errorText);
			return groups;
		}, {});

		const groupedErrors = [];
		for (const title in errorGroups) {
			groupedErrors.push({
				title: title,
				description: errorGroups[title].join("\n"),
			});
		}
		const allErrors = groupedErrors.concat(counterLargerThanOne.filter((error) => error.type.group === false));

		return allErrors;
	}

	private onCloseErrorDialog() {
		this.errorDialog.close();
		// rest file uploader content
		this.excelUploadController.resetContent();
	}

	private onContinue() {
		this.errorDialog.close();
		this.excelUploadController.setDataRows();
		
	}

	private sortErrorsByTitle(errors: ErrorMessage[]) {
		return errors.sort((a, b) => {
			if (a.title < b.title) {
				return -1;
			}
			if (a.title > b.title) {
				return 1;
			}
			return 0;
		});
	}
}
