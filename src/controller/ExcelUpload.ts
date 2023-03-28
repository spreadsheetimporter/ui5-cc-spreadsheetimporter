import ManagedObject from "sap/ui/base/ManagedObject";
import Fragment from "sap/ui/core/Fragment";
import MessageToast from "sap/m/MessageToast";
import JSONModel from "sap/ui/model/json/JSONModel";
import * as XLSX from "xlsx";
import MetadataHandler from "./MetadataHandler";
import DraftController from "sap/ui/generic/app/transaction/DraftController";
import Component from "../Component";
import XMLView from "sap/ui/core/mvc/XMLView";
import { ListObject } from "../types";
import Dialog from "sap/m/Dialog";
import Event from "sap/ui/base/Event";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import OData from "./odata/OData";
import ODataV2 from "./odata/ODataV2";
import ODataV4 from "./odata/ODataV4";
import FileUploader from "sap/ui/unified/FileUploader";
import MessageBox from "sap/m/MessageBox";
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

	constructor(component: Component, componentI18n: ResourceModel) {
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
		await this.setContext();
	}

	async setContext() {
		this.context = this.component.getContext();
		if (this.context.base) {
			this.context = this.context.base;
		}

		if (this.isODataV4) {
			this.view = this.context._view;
			if (!this.view) {
				this.view = this.context.getView();
			}
			try {
				await this._setContextV4();
				this.errorState = false;
			} catch (error) {
				this.errorMessage = error.message;
				this.errorState = true;
			}
		} else {
			this.view = this.context.getView();
			try {
				await this._setContextV2();
				this.errorState = false;
			} catch (error) {
				this.errorMessage = error.message;
				this.errorState = true;
			}
		}
		this.model = this.tableObject.getModel();
		this.odataHandler.draftController = new DraftController(this.model, undefined);
	}

	async _setContextV4() {
		// try get object page table
		if (!this.component.getTableId()) {
			let tables = this.view.findAggregatedObjects(true, function (o) {
				return o.isA("sap.m.Table") || o.isA("sap.ui.table.Table");
			});
			if (tables.length > 1) {
				console.error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
			} else {
				this.component.setTableId(tables[0].getId());
				this.tableObject = tables[0];
			}
		} else {
			this.tableObject = this.view.byId(this.component.getTableId());
		}
		// try get odata type from table
		this.binding = this.odataHandler.getBinding(this.tableObject);
		if (!this.binding) {
			throw new Error(this._geti18nText("bindingError"));
		}
		const tableBindingPath = this.binding.getPath();
		const metaModel = this.tableObject.getModel().getMetaModel();
		const metaModelData = this.tableObject.getModel().getMetaModel().getData();
		if (!this.component.getOdataType()) {
			// for list report
			try {
				const metaDataObject = metaModel.getObject(tableBindingPath);
				this.component.setOdataType(metaDataObject["$Type"]);
			} catch (error) {
				console.debug();
			}
			// for object page
			if (!this.component.getOdataType()) {
				for (const [key, value] of Object.entries(metaModelData)) {
					if (value["$kind"] === "EntityType" && value[tableBindingPath]) {
						this.component.setOdataType(value[tableBindingPath]["$Type"]);
					}
				}
			}
			if (!this.component.getOdataType()) {
				console.error("No OData Type found. Please specify 'odataType' in options");
			}
		}

		this.typeLabelList = this.metadataHandler.createLabelListV4(this.component.getColumns());
	}

	async _setContextV2() {
		// try get object page table
		if (!this.component.getTableId()) {
			let tables = this.view.findAggregatedObjects(true, function (o) {
				return o.isA("sap.m.Table") || o.isA("sap.ui.table.Table");
			});
			if (tables.length > 1) {
				console.error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
			} else {
				this.component.setTableId(tables[0].getId());
				this.tableObject = tables[0];
			}
		} else {
			this.tableObject = this.view.byId(this.component.getTableId());
		}
		// try get odata type from table
		this.binding = this.odataHandler.getBinding(this.tableObject);
		if (!this.binding) {
			throw new Error(this._geti18nText("bindingError"));
		}
		if (!this.component.getOdataType()) {
			this.component.setOdataType(this.binding._getEntityType().entityType);
			if (!this.component.getOdataType()) {
				console.error("No OData Type found. Please specify 'odataType' in options");
			}
			const metaModel = this.tableObject.getModel().getMetaModel();
			await metaModel.loaded();
			this.oDataEntityType = metaModel.getODataEntityType(this.component.getOdataType());
		}

		this.typeLabelList = this.metadataHandler.createLabelListV2(this.component.getColumns());
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
		await this.initialSetup();
		if (!this.errorState) {
			(this.dialog.getContent()[0] as FileUploader).clear();
			this.dialog.open();
		} else {
			MessageBox.error(this.errorMessage);
			console.error("ErrorState: True. Can not open dialog.");
		}
	}

	async onFileUpload(oEvent: Event) {
		try {
			this.payloadArray = [];
			const fileType = oEvent.getParameter("files")[0].type;
			let excelSheetsData: any[] = [];
			const stream: ReadableStream = oEvent.getParameter("files")[0].stream();
			const data = await this.buffer_RS(stream);
			let workbook = XLSX.read(data);
			this.component.setErrorResults([]);
			let columnNames;
			// reading all sheets
			workbook.SheetNames.forEach((sheetName) => {
				// Need special case for CSV Import
				// let worksheet = workbook.Sheets[sheetName];
				// const range = XLSX.utils.decode_range(worksheet["!ref"]);
				// for (let row = range.s.r + 1; row <= range.e.r; ++row) {
				// 	for (let col = range.s.c; col <= range.e.c; ++col) {
				// 		const ref = XLSX.utils.encode_cell({ r: row, c: col });
				// 		if (worksheet[ref] && worksheet[ref].t === "n") {
				// 			worksheet[ref].v = this._changeDecimalSeperator(worksheet[ref].w);
				// 		}
				// 	}
				// }
				let data = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
				columnNames = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })[0];
				excelSheetsData.push(data);
			});
			// use only first sheet
			var firstSheet = excelSheetsData[0];
			//remove empty spaces before and after every value
			for (const object of firstSheet) {
				for (const key in object) {
					object[key] = typeof object[key] === "string" ? object[key].trim() : object[key];
				}
			}
			// check if data is ok in extension method
			this._checkMandatoryFields(firstSheet, this.component.getErrorResults());
			this._checkColumnNames(columnNames, this.component.getErrorResults());
			this.component.fireCheckBeforeRead({ sheetData: firstSheet });
			if (this.component.getErrorResults().some((error) => error.counter > 0)) {
				// error found in excel
				// remove those errors not found
				const errorArray = this.component.getErrorResults().filter((error) => error.counter !== 0);
				throw errorArray;
			}

			// Wait for all promises to be resolved
			this._parseExcelData(firstSheet);
			MessageToast.show(this._geti18nText("uploadSuccessful"));
		} catch (error) {
			this.errorDialog = (await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ErrorDialog",
				type: "XML",
				controller: this,
			})) as Dialog;
			this.dialog.setModel(this.componentI18n, "i18n");
			this.errorDialog.setModel(new JSONModel(), "errorData");
			var fileUploader = this.dialog.getContent()[0];
			fileUploader.setValue();
			this.errorDialog.getModel("errorData").setData(error);
			this.errorDialog.open();
		}
	}

	onCloseDialog(oEvent) {
		this.dialog.close();
	}
	onCloseErrorDialog(oEvent) {
		this.errorDialog.close();
	}

	/**
	 * Sending extracted data to backend
	 * @param {*} oEvent
	 */
	async onUploadSet(oEvent) {
		// checking if excel file contains data or not
		if (!this.payloadArray.length) {
			MessageToast.show(this._geti18nText("selectFileUpload"));
			return;
		}

		var that = this;
		var oSource = oEvent.getSource();

		oSource.getParent().setBusyIndicatorDelay(0);
		oSource.getParent().setBusy(true);
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

		oSource.getParent().setBusy(false);
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

	_checkMandatoryFields(data, errorArray) {
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
			};
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

	_checkColumnNames(columnNames, errorArray) {
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
				};
				errorArray.push(errorMessage);
			}
		}
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
}
