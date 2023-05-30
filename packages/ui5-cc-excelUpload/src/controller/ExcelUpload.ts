import Fragment from "sap/ui/core/Fragment";
import MessageToast from "sap/m/MessageToast";
import * as XLSX from "xlsx";
import MetadataHandler from "./MetadataHandler";
import Component from "../Component";
import XMLView from "sap/ui/core/mvc/XMLView";
import { ListObject, Messages, MessageTypes } from "../types";
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
import Util from "./Util";
import Parser from "./Parser";
import MessageHandler from "./MessageHandler";
import Bar from "sap/m/Bar";
import Preview from "./Preview";
import Log from "sap/base/Log";
import JSONModel from "sap/ui/model/json/JSONModel";
import FlexBox from "sap/m/FlexBox";
import Options from "./Options";
import SheetHandler from "./SheetHandler";
import ExcelDialog from "../control/ExcelDialog";
/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class ExcelUpload {
	public oDataEntityType: any;
	public component: Component;
	public context: any;
	private isODataV4: boolean;
	private isOpenUI5: boolean;
	private view: XMLView;
	private tableObject: any;
	private metadataHandler: MetadataHandler;
	private messageHandler: MessageHandler;
	private previewHandler: Preview;
	public util: Util;
	private model: any;
	private typeLabelList: ListObject;
	private dialog: Dialog;
	public componentI18n: ResourceModel;
	private UI5MinorVersion: number;
	private odataHandler: OData;
	private payload: any;
	private binding: any;
	private payloadArray: any[];
	private errorState: boolean;
	private errorMessage: any;
	private initialSetupPromise: Promise<void>;
	public messageArray: Messages[];
	odataKeyList: string[];
	optionsHandler: Options;

	/**
	 * Initializes ExcelUpload instance.
	 * @param {Component} component - The component to be used.
	 * @param {ResourceModel} componentI18n - The i18n resource model for the component.
	 */
	constructor(component: Component, componentI18n: ResourceModel) {
		this.dialog = null;
		this.errorState = false;
		this.UI5MinorVersion = sap.ui.version.split(".")[1];
		this.component = component;
		this.componentI18n = componentI18n;
		this.util = new Util(componentI18n.getResourceBundle() as ResourceBundle);
		this.isODataV4 = this._checkIfODataIsV4();
		// check if "sap.ui.generic" is available, if false it is OpenUI5
		this.isOpenUI5 = sap.ui.generic ? false : true;
		this.odataHandler = this.getODataHandler(this.UI5MinorVersion, undefined, this);
		this.initialSetupPromise = this.initialSetup();
		this.previewHandler = new Preview(this.util);
	}

	/**
	 * Executes initial setup.
	 * @returns {Promise<void>} A promise that resolves when the initial setup is complete.
	 */
	async initialSetup(): Promise<void> {
		this.optionsHandler = new Options(this);
		const infoModel = new JSONModel({
			dataRows: 0,
			strict: this.component.getStrict(),
			hidePreview: this.component.getHidePreview()
		});
		if (!this.dialog) {
			this.dialog = (await Fragment.load({
				name: "cc.excelUpload.XXXnamespaceXXX.fragment.ExcelUpload",
				type: "XML",
				controller: this,
			})) as ExcelDialog;
			this.dialog.setModel(this.componentI18n, "i18n");
			this.dialog.setModel(infoModel, "info");
			this.dialog.setModel(this.component.getModel("device"), "device");
			this.dialog.attachDecimalSeparatorChanged(this.onDecimalSeparatorChanged.bind(this));
		}
		if (this.component.getStandalone() && this.component.getColumns().length === 0) {
			(this.dialog.getSubHeader() as Bar).setVisible(false);
			(this.dialog.getSubHeader() as Bar).getContentLeft()[0].setVisible(false);
		}
		this.messageHandler = new MessageHandler(this);
		if (!this.component.getStandalone()) {
			this.metadataHandler = new MetadataHandler(this);
			this.odataHandler.metaDatahandler = this.metadataHandler;
			try {
				await this.setContext();
				this.errorState = false;
			} catch (error) {
				this.errorMessage = error;
				this.errorState = true;
			}
		}
	}

	/**
	 * Sets context for the instance.
	 */
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
			throw new Error(this.util.geti18nText("bindingError"));
		}
		const odataType = this.odataHandler.getOdataType(this.binding, this.tableObject, this.component.getOdataType());
		this.component.setOdataType(odataType);
		this.odataKeyList = await this.odataHandler.getKeyList(odataType, this.tableObject);
		this.typeLabelList = await this.odataHandler.createLabelList(this.component.getColumns(), odataType, this.tableObject);

		this.model = this.tableObject.getModel();
		this.odataHandler.createCustomBinding(this.binding)
		try {
			// Load the DraftController asynchronously using the loadDraftController function
			const DraftController: sap.ui.generic.app.transaction.DraftController = await this._loadDraftController();
			// Create an instance of the DraftController
			this.odataHandler.draftController = new DraftController(this.model, undefined);
		} catch (error) {}
	}

	/**
	 * Retrieves OData handler based on UI5 version.
	 * @param {number} version - UI5 version number.
	 * @returns {OData} OData handler instance.
	 */
	getODataHandler(version: number, metaDatahandler: MetadataHandler, excelUploadController: ExcelUpload): OData {
		if (this.isODataV4) {
			return new ODataV4(version, metaDatahandler, excelUploadController);
		} else {
			return new ODataV2(version,metaDatahandler, excelUploadController);
		}
	}

	/**
	 * Opens the Excel upload dialog.
	 */
	async openExcelUploadDialog() {
		await this.initialSetupPromise;
		if (this.errorState) {
			await this.initialSetup();
		}
		if (!this.errorState) {
			((this.dialog.getContent()[0] as FlexBox).getItems()[1] as FileUploader).clear();
			this.dialog.open();
		} else {
			Util.showError(this.errorMessage, "ExcelUpload.ts", "initialSetup");
			Log.error("ErrorState: True. Can not open dialog.", "ExcelUpload.ts.openExcelUploadDialog");
		}
	}

	async showPreview() {
		this.previewHandler.showPreview(this.payloadArray);
	}

	/**
	 * Handles file upload event.
	 * @param {Event} event - The file upload event.
	 */
	async onFileUpload(event: Event) {
		try {
			this.messageHandler.setMessages([]);
			const file = event.getParameter("files")[0];

			const workbook = (await this._readWorkbook(file)) as XLSX.WorkBook;
			const sheetName = workbook.SheetNames[0];
			let excelSheetsData = SheetHandler.sheet_to_json(workbook.Sheets[sheetName]);
			let columnNames = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })[0];

			if (!excelSheetsData || excelSheetsData.length === 0) {
				throw new Error(this.util.geti18nText("emptySheet"));
			}

			//remove empty spaces before and after every value
			for (const object of excelSheetsData) {
				for (const key in object) {
					object[key].rawValue = typeof object[key].rawValue === "string" ? object[key].rawValue.trim() : object[key].rawValue;
				}
			}

			if (!this.component.getStandalone()) {
				this.messageHandler.checkFormat(excelSheetsData);
				this.messageHandler.checkMandatoryColumns(excelSheetsData,columnNames,this.odataKeyList, this.component.getMandatoryFields(), this.typeLabelList);
				this.messageHandler.checkColumnNames(columnNames, this.component.getFieldMatchType(), this.typeLabelList);
			}
			this.payload = excelSheetsData;
			this.component.fireCheckBeforeRead({ sheetData: excelSheetsData });
			if (!this.component.getStandalone()) {
				this.payloadArray = [];
				this.payloadArray = Parser.parseExcelData(this.payload, this.typeLabelList, this.component, this.messageHandler, this.util, this.isODataV4);
			} else {
				this.payloadArray = this.payload;
			}

			if (this.messageHandler.areMessagesPresent()) {
				// show error dialog
				this.messageHandler.displayMessages();
				return;
			}
			this.setDataRows();
		} catch (error) {
			Util.showError(error, "ExcelUpload.ts", "onFileUpload");
			this.resetContent();
		}
	}

	/**
	 * Closes the Excel upload dialog.
	 */
	onCloseDialog() {
		this.resetContent();
		this.dialog.close();
	}

	onOpenOptionsDialog() {
		this.optionsHandler.openOptionsDialog();
	}

	/**
	 * Sending extracted data to backend
	 * @param {*} event
	 */
	async onUploadSet(event: Event) {
		const isDefaultNotPrevented = this.component.fireUploadButtonPress({ payload: this.payload });
		if (!isDefaultNotPrevented || this.component.getStandalone()) {
			this.onCloseDialog();
			return;
		}
		// checking if excel file contains data or not
		if (!this.payloadArray.length) {
			MessageToast.show(this.util.geti18nText("selectFileUpload"));
			return;
		}

		var that = this;
		const source = event.getSource() as Button;
		const sourceParent = source.getParent() as Dialog;

		sourceParent.setBusyIndicatorDelay(0);
		sourceParent.setBusy(true);
		await Util.sleep(50);

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
				popup: false,
				navigation: false,
			},
			sActionLabel: this.util.geti18nText("uploadingFile"),
		};
		// calling the oData service using extension api
		if (this.isODataV4) {
			await this.context.editFlow.securedExecution(fnAddMessage, mParameters);
		} else {
			try {
				if (this.context.extensionAPI) {
					await this.context.extensionAPI.securedExecution(fnAddMessage, mParameters);
				} else {
					await fnAddMessage();
				}
			} catch (error) {
				this.resetContent();
			}
		}

		sourceParent.setBusy(false);

		this.onCloseDialog();
	}

	/**
	 * Helper method to call OData service.
	 * @param {*} fnResolve - The resolve function for the Promise.
	 * @param {*} fnReject - The reject function for the Promise.
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
				await this.odataHandler.submitChanges(model);
				let errorsFound = await this.odataHandler.checkForErrors(model, this.binding);
				if(errorsFound){
					break;
				} else {
					await this.odataHandler.waitForCreation();
				}

				// check for and activate all drafts and wait for all draft to be created
				if (this.component.getActivateDraft() && !errorsFound) {
					await this.odataHandler.waitForDraft();
				}

				this.odataHandler.resetContexts();
			}
			try {
				this.binding.refresh();
			} catch (error) {
				Log.error(error);
			}
			fnResolve();
		} catch (error) {
			this.odataHandler.resetContexts();
			Log.error(error);
			fnReject(error);
		}
	}

	/**
	 * Create Excel Template File with specific columns
	 */
	onTempDownload() {
		// create excel column list
		let fieldMatchType = this.component.getFieldMatchType();
		var excelColumnList = [{}];
		if (this.component.getStandalone()) {
			// loop over this.component.getColumns
			for (let column of this.component.getColumns()) {
				excelColumnList[0][column] = "";
			}
		} else {
			for (let [key, value] of Object.entries(this.typeLabelList)) {
				if (fieldMatchType === "label") {
					excelColumnList[0][value.label] = "";
				}
				if (fieldMatchType === "labelTypeBrackets") {
					excelColumnList[0][`${value.label}[${key}]`] = "";
				}
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

		MessageToast.show(this.util.geti18nText("downloadingTemplate"));
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

	_setPayload(payload) {
		this.payload = payload;
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
	 * Read the uploaded workbook from the file.
	 * @param {File} file - The uploaded file.
	 * @returns {Promise} - Promise object representing the workbook.
	 */
	async _readWorkbook(file: Blob) {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await this.buffer_RS(file.stream());
				let workbook = XLSX.read(data, {cellNF: true, cellDates: true, cellText: true, cellFormula: true});
				resolve(workbook);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Dynamically loads the `sap.ui.generic.app.transaction.DraftController` module.
	 * @returns {Promise<sap.ui.generic.app.transaction.DraftController>} A Promise that resolves to an instance of the `DraftController` class.
	 * @throws {Error} If the `DraftController` module cannot be loaded.
	 */
	async _loadDraftController() {
		return new Promise(function (resolve, reject) {
			sap.ui.require(
				["sap/ui/generic/app/transaction/DraftController"],
				function (DraftController: unknown) {
					resolve(DraftController);
				},
				function (err: any) {
					reject(err);
				}
			);
		});
	}

	resetContent() {
		this.payloadArray = [];
		this.payload = [];
		(this.dialog.getModel("info") as JSONModel).setProperty("/dataRows", 0);
		this.odataHandler.resetContexts();
		var fileUploader = this.dialog.getContent()[0].getItems()[1] as FileUploader;
		fileUploader.setValue();
	}

	/**
	 * Returns messages from the MessageHandler.
	 * @returns {Messages[]} - An array of messages.
	 */
	getMessages() {
		return this.messageHandler.getMessages();
	}

	/**
	 * Adds messages to the MessageHandler's messages.
	 * @param {Messages[]} messagesArray - An array of messages to add.
	 */
	addToMessages(messagesArray: Messages[]) {
		messagesArray.forEach((message) => {
			if (message.group) {
				message.type = MessageTypes.CustomErrorGroup;
			} else {
				message.type = MessageTypes.CustomError;
			}
			message.counter = 1;
		});
		this.messageHandler.addArrayToMessages(messagesArray);
	}

	public setDataRows() {
		(this.dialog.getModel("info") as JSONModel).setProperty("/dataRows", this.payloadArray.length);
	}

	onDecimalSeparatorChanged(event:Event) {
		this.component.setDecimalSeparator(event.getParameter("decimalSeparator"));
	}
}
