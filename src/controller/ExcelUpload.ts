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
	private componentI18n : ResourceModel;

	constructor(component: Component, componentI18n: ResourceModel) {
		this._excelSheetsData = [];
		this.dialog = null;
		this.component = component;
		this.component.setErrorResults([]);
		this.componentI18n = componentI18n;
		this.metadataHandler = new MetadataHandler(this);
		this.setContext();
	}

	async setContext() {
		this.context = this.component.getContext();
		if (this.context.base) {
			this.context = this.context.base;
		}
		this.isODataV4 = this._checkIfODataIsV4();
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
			const domRef = this.view.getContent()[0].getDomRef();
			let tables = domRef.querySelectorAll("[id$='::LineItem-innerTable']");
			if (tables.length > 1) {
				console.error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
			} else {
				this.component.setTableId(tables[0].getAttribute("id"));
			}
		}
		// try get odata type from table
		this.tableObject = this.context.byId(this.component.getTableId());
		const tableBindingPath = this.tableObject.getBindingPath("items");
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
			const domRef = this.view.getContent()[0].getDomRef();
			// list report v2 responsive Table
			const tables = domRef.querySelectorAll("[id$='responsiveTable']");
			if (tables.length > 1) {
				console.error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
			} else {
				this.component.setTableId(tables[0].getAttribute("id"));
			}
		}
		// try get odata type from table
		this.tableObject = this.context.byId(this.component.getTableId());
		if (!this.component.getOdataType()) {
			this.component.setOdataType(this.tableObject.getBinding("items")._getEntityType().entityType);
			if (!this.component.getOdataType()) {
				console.error("No OData Type found. Please specify 'odataType' in options");
			}
			const metaModel = this.context.byId(this.component.getTableId()).getModel().getMetaModel();
			await metaModel.loaded();
			this.oDataEntityType = metaModel.getODataEntityType(this.component.getOdataType());
		}

		this.typeLabelList = this.metadataHandler.createLabelListV2(this.component.getColumns());
	}

	async openExcelUploadDialog() {
		this._excelSheetsData = [];
		if (!this.dialog || this.dialog.isDestroyed()) {
			this.dialog = await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ExcelUpload",
				type: "XML",
				controller: this,
			}) as Dialog;
			this.dialog.setModel(this.componentI18n, "i18n");
		}
		this.dialog.open();
	}

	async onFileUpload(oEvent: Event) {
		var excelSheetsData = [];
		const stream:ReadableStream = oEvent.getParameter("files")[0].stream();
		const data = await this.buffer_RS(stream);
		const workbook = XLSX.read(data);
		this.component.setErrorResults([]);
		// reading all sheets
		workbook.SheetNames.forEach(function (sheetName) {
			// appending the excel file data to the global variable
			excelSheetsData.push(XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]));
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
		try {
			this._excelSheetsData = firstSheet;
			MessageToast.show(this._geti18nText("uploadSuccessful"));
		} catch (error) {
			this.errorDialog = await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ErrorDialog",
				type: "XML",
				controller: this,
			}) as Dialog;
			this.dialog.setModel(this.componentI18n, "i18n");
			this.errorDialog.setModel(new JSONModel(), "errorData");
			var fileUploader = this.dialog.getContent()[0];
			fileUploader.setValue();
			this.errorDialog.getModel("errorData").setData(error);
			this.errorDialog.open();
		}
	}

	onCloseDialog(oEvent) {
		this.dialog.destroy();
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
		if (!this._excelSheetsData.length) {
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
				await this.context.extensionAPI.securedExecution(fnAddMessage, mParameters);
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
			const model = this.context.byId(this.component.getTableId()).getModel();
			const binding = this.context.byId(this.component.getTableId()).getBinding("items");
			let createPromises = [];
			let createContexts = [];
			let activateActions = [];
			let activateActionsPromises = [];

			// binding.attachCreateCompleted(this.test, this);

			// loop over data from excel files
			for (const row of this._excelSheetsData) {
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

				this._payload = payload;
				// extension method to manipulate payload
				this.component.fireChangeBeforeCreate({ payload: this._payload });
				if (this.isODataV4) {
					const context = binding.create(this._payload);
					createContexts.push(context);
					createPromises.push(context.created());
				} else {
					const context = binding.create(this._payload, /*bAtEnd*/ true, { inactive: false, expand: "" });
					createContexts.push(context);
					createPromises.push(context.created());
				}
			}
			// wait for all drafts to be created
			if (this.isODataV4) {
				await model.submitBatch(model.getUpdateGroupId());
				const resultsCreation = await Promise.all(createPromises);
			} else {
				await model.submitChanges();
				const resultsCreation = await Promise.all(createPromises);
			}

			// check for and activate all drafts
			if (this.component.getActivateDraft()) {
				if (this.isODataV4) {
					for (let index = 0; index < createContexts.length; index++) {
						const element = createContexts[index];
						// const operation = element.getModel().bindContext(this._activateActionName + "(...)", element, { $$inheritExpandSelect: true });
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
				binding.refresh();
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
			if (this.context.getModel().getODataVersion() === "4.0") {
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
		this._payload = payload;
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

	_geti18nText(text: string, array?: any):string {
		const resourceBundle = this.componentI18n.getResourceBundle() as ResourceBundle;
		return resourceBundle.getText(text, array);
	}

	_getActionName(oContext: any, sOperation:string) {
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
