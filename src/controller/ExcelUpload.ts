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

	constructor(component: Component, componentI18n: ResourceModel) {
		this.dialog = null;
		this.UI5MinorVersion = sap.ui.version.split(".")[1];
		this.component = component;
		this.component.setErrorResults([]);
		this.componentI18n = componentI18n;
		this.isODataV4 = this._checkIfODataIsV4();
		this.odataHandler = this.getODataHandler(this.UI5MinorVersion);
		this.metadataHandler = new MetadataHandler(this);
		this.setContext();
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
			this._setContextV4();
		} else {
			this.view = this.context.getView();
			await this._setContextV2();
		}
		this.model = this.tableObject.getModel();
		this.draftController = new DraftController(this.model, undefined);
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
		}
		// try get odata type from table
		this.binding = this.odataHandler.getBinding(this.tableObject);
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
		}
		// try get odata type from table
		this.binding = this.odataHandler.getBinding(this.tableObject);
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
		if (!this.dialog) {
			// TODO: check if needed from 1.93 || this.dialog.isDestroyed()) {
			this.dialog = (await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ExcelUpload",
				type: "XML",
				controller: this,
			})) as Dialog;
			this.dialog.setModel(this.componentI18n, "i18n");
		}
		(this.dialog.getContent()[0] as FileUploader).clear();
		this.dialog.open();
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
	async callOdata(fnResolve, fnReject) {
		// intializing the message manager for displaying the odata response messages
		try {
			// get binding of table to create rows
			const model = this.tableObject.getModel();
			let createPromises = [];
			let createContexts = [];
			let activateActions = [];
			let activateActionsPromises = [];

			// loop over data from excel file
			for (const payload of this.payloadArray) {
				this.payload = payload;
				// extension method to manipulate payload
				this.component.fireChangeBeforeCreate({ payload: this.payload });
				if (this.isODataV4) {
					const returnObject = this.odataHandler.create(model, this.binding, this.payload);
					createContexts.push(returnObject.context);
					createPromises.push(returnObject.promise);
				} else {
					let context;
					const returnObject = this.odataHandler.create(model, this.binding, this.payload);
					createPromises.push(returnObject);
				}
			}
			// wait for all drafts to be created
			if (this.isODataV4) {
				await model.submitBatch(model.getUpdateGroupId());
				const resultsCreation = await Promise.all(createPromises);
			} else {
				const submitChangesPromise = (model) => {
					return new Promise((resolve, reject) => {
						model.submitChanges({
							success: (data) => {
								resolve(data);
							},
							error: (oError) => {
								reject(oError);
							},
						});
					});
				};

				try {
					const oData = await submitChangesPromise(model);
					console.log(oData);
					// handle success
				} catch (oError) {
					// handle error
				}
				if (!this.isODataV4) {
					createContexts = await Promise.all(createPromises);
				} else {
					let resultsCreation = await Promise.all(createPromises);
				}
			}

			// check for and activate all drafts
			if (this.component.getActivateDraft()) {
				if (this.isODataV4) {
					for (let index = 0; index < createContexts.length; index++) {
						const element = createContexts[index];
						const operationName = this._getActionName(element, "ActivationAction");
						if (operationName) {
							const operation = element.getModel().bindContext(`${operationName}(...)`, element, { $$inheritExpandSelect: true });
							activateActionsPromises.push(operation.execute("$auto", false, null, /*bReplaceWithRVC*/ true));
						}
					}
				} else {
					for (let index = 0; index < createContexts.length; index++) {
						const element = createContexts[index];
						if (this.draftController.getDraftContext().hasDraft(element)) {
							// this will fail i.e. in a Object Page Table, maybe better way to check, hasDraft is still true
							try {
								const checkImport = this.draftController.getDraftContext().getODataDraftFunctionImportName(element, "ActivationAction");
								if (checkImport !== null) {
									const activationPromise = this.draftController.activateDraftEntity(element, true);
									activateActionsPromises.push(activationPromise);
								}
							} catch (error) {
								console.debug("Activate Draft failed");
							}
						}
					}
				}
			}
			// wait for all draft to be created
			const resultsActivations = await Promise.all(activateActionsPromises);
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
		// error cases
		if (this.component.getMandatoryFields()) {
			for (const mandatoryField of this.component.getMandatoryFields()) {
				const errorMessage = {
					title: this._geti18nText("mandatoryFieldNotFilled", [this.typeLabelList[mandatoryField].label]),
					counter: 0,
				};
				for (const row of data) {
					let label;
					if (typeof this.typeLabelList[mandatoryField] !== "undefined" && mandatoryField in this.typeLabelList) {
						label = this.typeLabelList[mandatoryField]["label"];
					} else {
						console.error(`Mandatory Field ${mandatoryField} not found for checking mandatory fields`);
					}
					const value = this._getValueFromRow(row, label, mandatoryField);
					if (value === "" || value === undefined) {
						errorMessage.counter = errorMessage.counter + 1;
					}
				}
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

	_getActionName(oContext: any, sOperation: string) {
		var oModel = oContext.getModel(),
			oMetaModel = oModel.getMetaModel(),
			sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
		return oMetaModel.getObject("".concat(sEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot/").concat(sOperation));
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
