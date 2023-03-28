import ManagedObject from "sap/ui/base/ManagedObject";
import Fragment from "sap/ui/core/Fragment";
import MessageToast from "sap/m/MessageToast";
import JSONModel from "sap/ui/model/json/JSONModel";
import * as XLSX from "xlsx";
import MetadataHandler from "./MetadataHandler";
import DraftController from "sap/ui/generic/app/transaction/DraftController";
import Component from "../Component";
import XMLView from "sap/ui/core/mvc/XMLView";
import { ListObject, ErrorMessage } from "../types";
import Dialog from "sap/m/Dialog";
import Event from "sap/ui/base/Event";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import OData from "./odata/OData";
import ODataV2 from "./odata/ODataV2";
import ODataV4 from "./odata/ODataV4";
import FileUploader from "sap/ui/unified/FileUploader";
import MessageBox from "sap/m/MessageBox";
import Button from "sap/m/Button";
/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class ExcelUpload {
	public oDataEntityType: any;
	public component: Component;
	public context: any;
	private isODataV4: boolean;
	private view: XMLView;
	private tableObject: any;
	private metadataHandler: MetadataHandler;
	private draftController: DraftController;
	private model: any;
	private typeLabelList: ListObject;
	private dialog: Dialog;
	private errorDialog: Dialog;
	private componentI18n: ResourceModel;
	private UI5MinorVersion: number;
	private odataHandler: OData;
	private payload: any;
	private binding: any;
	private payloadArray: any[];
	private errorState: boolean;
	private errorMessage: string;
	private initialSetupPromise: Promise<void>;
	public errorArray: ErrorMessage[];

	constructor(component: Component, componentI18n: ResourceModel) {
		this.errorArray = [];
		this.dialog = null;
		this.errorState = false;
		this.UI5MinorVersion = sap.ui.version.split(".")[1];
		this.component = component;
		this.component.setErrorResults([]);
		this.componentI18n = componentI18n;
		this.isODataV4 = this._checkIfODataIsV4();
		this.odataHandler = this.getODataHandler(this.UI5MinorVersion);
		this.initialSetupPromise = this.initialSetup();
	}

	async initialSetup(): Promise<void> {
		if (!this.dialog) {
			this.dialog = (await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ExcelUpload",
				type: "XML",
				controller: this,
			})) as Dialog;
			this.dialog.setModel(this.componentI18n, "i18n");
		}
		this.metadataHandler = new MetadataHandler(this);
		this.odataHandler.metaDatahandler = this.metadataHandler;
		try {
			await this.setContext();
			this.errorState = false;
		} catch (error) {
			this.errorMessage = error.message;
			this.errorState = true;
			console.error(error);
		}
	}

	async setContext() {
		this.context = this.component.getContext();
		if (this.context.base) {
			this.context = this.context.base;
		}

		this.view = this.odataHandler.getView(this.context);
		this.tableObject = this.odataHandler.getTableObject(this.component.getTableId(), this.view);
		this.component.setTableId(this.tableObject.getId());
		this.binding = this.odataHandler.getBinding(this.tableObject);
		if (!this.binding) {
			throw new Error(this._geti18nText("bindingError"));
		}
		const odataType = this.odataHandler.getOdataType(this.binding, this.tableObject, this.component.getOdataType());
		this.component.setOdataType(odataType);
		this.typeLabelList = this.odataHandler.createLabelList(this.component.getColumns(), odataType);

		this.model = this.tableObject.getModel();
		this.odataHandler.draftController = new DraftController(this.model, undefined);
	}

	getODataHandler(version: number): OData {
		if (this.isODataV4) {
			return new ODataV4(version);
		} else {
			return new ODataV2(version);
		}
	}

	async openExcelUploadDialog() {
		await this.initialSetupPromise;
		if (this.errorState) {
			await this.initialSetup();
		}
		if (!this.errorState) {
			(this.dialog.getContent()[0] as FileUploader).clear();
			this.dialog.open();
		} else {
			MessageBox.error(this.errorMessage);
			console.error("ErrorState: True. Can not open dialog.");
		}
	}

	async onFileUpload(event: Event) {
		try {
			this.component.setErrorResults([]);
			this.errorArray = [];
			const file = event.getParameter("files")[0];

			const workbook = (await this._readWorkbook(file)) as XLSX.WorkBook;
			const sheetName = workbook.SheetNames[0];
			let excelSheetsData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
			let columnNames = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })[0];

			if (!excelSheetsData || excelSheetsData.length === 0) {
				throw new Error(this._geti18nText("emptySheet"));
			}

			//remove empty spaces before and after every value
			for (const object of excelSheetsData) {
				for (const key in object) {
					object[key] = typeof object[key] === "string" ? object[key].trim() : object[key];
				}
			}

			this.errorArray = this._checkMandatoryFields(excelSheetsData, this.errorArray);
			this.errorArray = this._checkColumnNames(columnNames, this.errorArray);
			this.component.fireCheckBeforeRead({ sheetData: excelSheetsData });

			if (this.errorArray.some((error) => error.counter > 0)) {
				// show error dialog
				this.displayErrors();
				// reset file uploader
				var fileUploader = this.dialog.getContent()[0] as FileUploader;
				fileUploader.setValue();
				return;
			}

			this.payloadArray = [];
			this._parseExcelData(excelSheetsData);
		} catch (error) {
			// show other errors
			console.error(error);
			MessageToast.show(error.message);
		}
	}

	onCloseDialog() {
		this.dialog.close();
	}
	onCloseErrorDialog() {
		this.errorDialog.close();
	}

	/**
	 * Sending extracted data to backend
	 * @param {*} event
	 */
	async onUploadSet(event: Event) {
		// checking if excel file contains data or not
		if (!this.payloadArray.length) {
			MessageToast.show(this._geti18nText("selectFileUpload"));
			return;
		}

		var that = this;
		const source = event.getSource() as Button;
		const sourceParent = source.getParent() as Dialog;

		sourceParent.setBusyIndicatorDelay(0);
		sourceParent.setBusy(true);
		await this._sleep(50);

		// creating a promise as the extension api accepts odata call in form of promise only
		var fnAddMessage = function () {
			return new Promise((fnResolve, fnReject) => {
				that.callOdata(fnResolve, fnReject);
			});
		};

		var mParameters = {
			busy: {
				set: true,
				check: false,
			},
			dataloss: {
				popup: true,
				navigation: false,
			},
			sActionLabel: this._geti18nText("uploadingFile"),
		};
		// calling the oData service using extension api
		if (this.isODataV4) {
			await this.context.editFlow.securedExecution(fnAddMessage, mParameters);
		} else {
			if (this.context.extensionAPI) {
				try {
					await this.context.extensionAPI.securedExecution(fnAddMessage, mParameters);
				} catch (error) {
					console.error(error);
				}
			} else {
				await fnAddMessage();
			}
		}

		sourceParent.setBusy(false);
		this.onCloseDialog();
	}

	/**
	 * helper method to call OData
	 * @param {*} fnResolve
	 * @param {*} fnReject
	 */
	async callOdata(fnResolve: any, fnReject: any) {
		// intializing the message manager for displaying the odata response messages
		try {
			// get binding of table to create rows
			const model = this.tableObject.getModel();

			// Slice the array into chunks of 'batchSize' if necessary
			const slicedPayloadArray = this.odataHandler.processPayloadArray(this.component.getBatchSize(), this.payloadArray);

			// Loop over the sliced array
			for (const batch of slicedPayloadArray) {
				// loop over data from excel file
				for (const payload of batch) {
					this.payload = payload;
					// Extension method to manipulate payload
					this.component.fireChangeBeforeCreate({ payload: this.payload });
					this.odataHandler.createAsync(model, this.binding, this.payload);
				}
				// wait for all drafts to be created
				await this.odataHandler.waitForCreation(model);

				// check for and activate all drafts and wait for all draft to be created
				if (this.component.getActivateDraft()) {
					await this.odataHandler.waitForDraft();
				}

				this.odataHandler.resetContexts();
			}
			try {
				this.binding.refresh();
			} catch (error) {
				console.debug(error);
			}
			fnResolve();
		} catch (error) {
			console.log(error);
			fnReject();
		}
	}

	/**
	 * Create Excel Template File with specific columns
	 */
	onTempDownload() {
		// create excel column list
		let fieldMatchType = this.component.getFieldMatchType();
		var excelColumnList = [{}];
		for (let [key, value] of Object.entries(this.typeLabelList)) {
			if (fieldMatchType === "label") {
				excelColumnList[0][value.label] = "";
			}
			if (fieldMatchType === "labelTypeBrackets") {
				excelColumnList[0][`${value.label}[${key}]`] = "";
			}
		}

		// initialising the excel work sheet
		const ws = XLSX.utils.json_to_sheet(excelColumnList);
		// creating the new excel work book
		const wb = XLSX.utils.book_new();
		// set the file value
		XLSX.utils.book_append_sheet(wb, ws, "Tabelle1");
		// download the created excel file
		XLSX.writeFile(wb, this.component.getExcelFileName());

		MessageToast.show(this._geti18nText("downloadingTemplate"));
	}

	_checkIfODataIsV4() {
		try {
			if (this.component.getContext().getModel().getODataVersion() === "4.0") {
				return true;
			}
		} catch (error) {
			return false;
		}
	}

	_sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	_setPayload(payload) {
		this.payload = payload;
	}

	_addToErrorsResults(errorResults) {
		this.component.setErrorResults(this.component.getErrorResults().concat(errorResults));
	}

	_checkMandatoryFields(data: unknown[], errorArray: ErrorMessage[]) {
		const mandatoryFields = this.component.getMandatoryFields();
		if (!mandatoryFields) {
			return errorArray;
		}
		for (const mandatoryField of mandatoryFields) {
			const fieldLabel = this.typeLabelList[mandatoryField]?.label;
			if (!fieldLabel) {
				console.error(`Mandatory Field ${mandatoryField} not found for checking mandatory fields`);
				continue;
			}
			const errorMessage = {
				title: this._geti18nText("mandatoryFieldNotFilled", [fieldLabel]),
				counter: 0,
			} as ErrorMessage;
			for (const row of data) {
				const value = this._getValueFromRow(row, fieldLabel, mandatoryField);
				if (value === "" || value === undefined) {
					errorMessage.counter++;
				}
			}
			if (errorMessage.counter > 0) {
				errorArray.push(errorMessage);
			}
		}
		return errorArray;
	}

	_checkColumnNames(columnNames: any, errorArray: ErrorMessage[]) {
		const fieldMatchType = this.component.getFieldMatchType();
		for (let index = 0; index < columnNames.length; index++) {
			const columnName = columnNames[index];
			let found = false;
			for (const key in this.typeLabelList) {
				if (this.typeLabelList.hasOwnProperty(key)) {
					if (fieldMatchType === "label") {
						if (this.typeLabelList[key].label === columnName) {
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
					title: this._geti18nText("columnNotFound", [columnName]),
					counter: 1,
				} as ErrorMessage;
				errorArray.push(errorMessage);
			}
		}
		return errorArray;
	}

	_getValueFromRow(row, label, type) {
		const fieldMatchType = this.component.getFieldMatchType();
		let value;
		if (fieldMatchType === "label") {
			value = row[label];
		}
		if (fieldMatchType === "labelTypeBrackets") {
			try {
				value = Object.entries(row).find(([key]) => key.includes(`[${type}]`))[1];
			} catch (error) {
				console.debug(`Not found ${type}`);
			}
		}
		return value;
	}

	_parseExcelData(sheetData) {
		// loop over data from excel file
		for (const row of sheetData) {
			let payload = {};
			// check each specified column if availalble in excel data
			for (const [columnKey, metadataColumn] of Object.entries(this.typeLabelList)) {
				// depending on parse type
				const value = this._getValueFromRow(row, metadataColumn.label, columnKey);
				// depending on data type
				if (value) {
					if (metadataColumn.type === "Edm.Boolean") {
						payload[columnKey] = `${value || ""}`;
					} else if (metadataColumn.type === "Edm.Date") {
						let excelDate = new Date(Math.round((value - 25569) * 86400 * 1000));
						payload[columnKey] = `${excelDate.getFullYear()}-${("0" + (excelDate.getMonth() + 1)).slice(-2)}-${("0" + excelDate.getDate()).slice(-2)}`;
					} else if (metadataColumn.type === "Edm.DateTimeOffset" || metadataColumn.type === "Edm.DateTime") {
						payload[columnKey] = new Date(Math.round((value - 25569) * 86400 * 1000));
					} else if (metadataColumn.type === "Edm.TimeOfDay" || metadataColumn.type === "Edm.Time") {
						//convert to hh:mm:ss
						const secondsInADay = 24 * 60 * 60;
						const timeInSeconds = value * secondsInADay;
						payload[columnKey] = new Date(timeInSeconds * 1000).toISOString().substring(11, 16);
					} else if (metadataColumn.type === "Edm.Double" || metadataColumn.type === "Edm.Int32") {
						payload[columnKey] = value;
					} else {
						payload[columnKey] = `${value || ""}`;
					}
				}
			}

			this.payloadArray.push(payload);
		}
	}

	_geti18nText(text: string, array?: any): string {
		const resourceBundle = this.componentI18n.getResourceBundle() as ResourceBundle;
		return resourceBundle.getText(text, array);
	}

	_changeDecimalSeperator(value: string): number {
		// Replace thousands separator with empty string
		value = value.replace(/[.]/g, "");
		// Replace decimal separator with a dot
		value = value.replace(/[,]/g, ".");
		// Convert string to number
		return parseFloat(value);
	}

	async buffer_RS(stream: ReadableStream) {
		/* collect data */
		const buffers = [];
		const reader = stream.getReader();
		for (;;) {
			const res = await reader.read();
			if (res.value) buffers.push(res.value);
			if (res.done) break;
		}

		/* concat */
		const out = new Uint8Array(buffers.reduce((acc, v) => acc + v.length, 0));

		let off = 0;
		for (const u8 of buffers) {
			out.set(u8, off);
			off += u8.length;
		}

		return out;
	}

	/**
	 * Display errors in the errorArray.
	 * @param {Array} errorArray - Array containing error messages and their counters.
	 */
	async displayErrors() {
		if (!this.errorDialog) {
			this.errorDialog = (await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ErrorDialog",
				type: "XML",
				controller: this,
			})) as Dialog;
		}
		this.errorDialog.setModel(new JSONModel(), "errorData");
		(this.errorDialog.getModel("errorData") as JSONModel).setData(this.errorArray.filter((error) => error.counter !== 0));
		this.errorDialog.open();
	}

	/**
	 * Read the uploaded workbook from the file.
	 * @param {File} file - The uploaded file.
	 * @returns {Promise} - Promise object representing the workbook.
	 */
	async _readWorkbook(file: Blob) {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await this.buffer_RS(file.stream());
				let workbook = XLSX.read(data);
				resolve(workbook);
			} catch (error) {
				reject(error);
			}
		});
	}
}
