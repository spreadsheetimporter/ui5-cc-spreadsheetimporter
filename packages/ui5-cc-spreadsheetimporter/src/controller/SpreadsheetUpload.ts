import ManagedObject from "sap/ui/base/ManagedObject";
import Component from "../Component";
import XMLView from "sap/ui/core/mvc/XMLView";
import { Messages, ListObject, ComponentData } from "../types";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import OData from "./odata/OData";
import ODataV2 from "./odata/ODataV2";
import ODataV4 from "./odata/ODataV4";
import FileUploader from "sap/ui/unified/FileUploader";
import Util from "./Util";
import MessageHandler from "./MessageHandler";
import Log from "sap/base/Log";
import FlexBox from "sap/m/FlexBox";
import OptionsDialog from "./dialog/OptionsDialog";
import SpreadsheetDialog from "../control/SpreadsheetDialog";
import SpreadsheetUploadDialog from "./dialog/SpreadsheetUploadDialog";
import { CustomMessageTypes } from "../enums";
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class SpreadsheetUpload extends ManagedObject {
	public oDataEntityType: any;
	public component: Component;
	public context: any;
	private _isODataV4: boolean;
	private isOpenUI5: boolean;
	private _view: XMLView;
	private _tableObject: any;
	private messageHandler: MessageHandler;
	public util: Util;
	private model: any;
	public typeLabelList: ListObject;
	public componentI18n: ResourceModel;
	public UI5MinorVersion: number;
	private odataHandler: OData;
	public payload: any;
	private _odataType: string;
	private _binding: any;

	public payloadArray: any[];
	public errorState: boolean;
	public errorMessage: any;
	private initialSetupPromise: Promise<void>;
	public messageArray: Messages[];
	odataKeyList: string[];
	optionsHandler: OptionsDialog;
	private _spreadsheetUploadDialogHandler: SpreadsheetUploadDialog;
	private _controller: import("sap/ui/core/mvc/Controller").default;

	/**
	 * Initializes SpreadsheetUpload instance.
	 * @param {Component} component - The component to be used.
	 * @param {ResourceModel} componentI18n - The i18n resource model for the component.
	 */
	constructor(component: Component, componentI18n: ResourceModel) {
		super();
		this.errorState = false;
		// @ts-ignore
		this.UI5MinorVersion = sap.ui.version.split(".")[1];
		this.component = component;
		this.componentI18n = componentI18n;
		this.util = new Util(componentI18n.getResourceBundle() as ResourceBundle);
		this.messageHandler = new MessageHandler(this);
		this.spreadsheetUploadDialogHandler = new SpreadsheetUploadDialog(this, component, componentI18n, this.messageHandler);
		// check if "sap.ui.generic" is available, if false it is OpenUI5
		// @ts-ignore
		this.isOpenUI5 = sap.ui.generic ? true : false;

		Log.debug("constructor", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ ui5version: this.UI5MinorVersion, isOpenUI5: this.isOpenUI5 }));
	}

	/**
	 * Executes initial setup.
	 * @returns {Promise<void>} A promise that resolves when the initial setup is complete.
	 */
	async initialSetup(): Promise<void> {
		await this.spreadsheetUploadDialogHandler.createSpreadsheetUploadDialog();
		if (!this.component.getStandalone()) {
			try {
				await this.setContext();
				this.errorState = false;
			} catch (error) {
				this.errorMessage = error;
				this.errorState = true;
				Log.error("Error setting 'setContext'", error as Error, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ error: error }));
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
		this.isODataV4 = this._checkIfODataIsV4();
		this.odataHandler = this.createODataHandler(this.UI5MinorVersion, this);
		this.view = this.odataHandler.getView(this.context);
		this.controller = this.view.getController();
		Log.debug("View", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ view: this.view }));
		this.view.addDependent(this.spreadsheetUploadDialogHandler.getDialog());
		this.tableObject = await this.odataHandler.getTableObject(this.component.getTableId(), this.view, this);
		Log.debug("tableObject", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ tableObject: this.tableObject }));
		this.component.setTableId(this.tableObject.getId());
		Log.debug("table Id", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ tableID: this.tableObject.getId() }));
		this.binding = this.odataHandler.getBinding(this.tableObject);
		if (!this.binding) {
			throw new Error(this.util.geti18nText("bindingError"));
		}
		this._odataType = await this.odataHandler.getOdataType(this.binding, this.tableObject, this.component.getOdataType());
		Log.debug("odataType", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ odataType: this._odataType }));
		this.odataKeyList = await this.odataHandler.getKeyList(this._odataType, this.tableObject);
		Log.debug("odataKeyList", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ odataKeyList: this.odataKeyList }));
		this.typeLabelList = await this.odataHandler.getLabelList(this.component.getColumns(), this._odataType, this.tableObject);
		Log.debug("typeLabelList", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ typeLabelList: this.typeLabelList }));

		this.model = this.tableObject.getModel();
		Log.debug("model", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ model: this.model }));
		this.odataHandler.createCustomBinding(this.binding);
		try {
			// Load the DraftController asynchronously using the loadDraftController function
			// @ts-ignore
			const DraftController: sap.ui.generic.app.transaction.DraftController = await this._loadDraftController();
			// Create an instance of the DraftController
			this.odataHandler.draftController = new DraftController(this.model, undefined);
		} catch (error) {
			Log.error("Error setting the draft controller", error as Error, "SpreadsheetUpload: SpreadsheetUpload");
		}
	}

	/**
	 * Retrieves OData handler based on UI5 version.
	 * @param {number} version - UI5 version number.
	 * @returns {OData} OData handler instance.
	 */
	createODataHandler(version: number, spreadsheetUploadController: SpreadsheetUpload): OData {
		if (this.isODataV4) {
			return new ODataV4(version, spreadsheetUploadController);
		} else {
			return new ODataV2(version, spreadsheetUploadController);
		}
	}

	/**
	 * Opens the Spreadsheet upload dialog.
	 * @param {object} options - all component options.
	 */
	async openSpreadsheetUploadDialog(options: ComponentData) {
		if (options) {
			// set options to component
			this.setComponentOptions(options);
			this.initialSetupPromise = this.initialSetup();
		} else {
			this.initialSetupPromise = this.initialSetup();
		}
		await this.initialSetupPromise;
		if (!this.errorState) {
			((this.spreadsheetUploadDialogHandler.getDialog().getContent()[0] as FlexBox).getItems()[1] as FileUploader).clear();
			this.spreadsheetUploadDialogHandler.openSpreadsheetUploadDialog();
		} else {
			Util.showError(this.errorMessage, "SpreadsheetUpload.ts", "initialSetup");
			Log.error("Error opening the dialog", undefined, "SpreadsheetUpload: SpreadsheetUpload");
		}
	}
	setComponentOptions(options: ComponentData) {
		if (options.hasOwnProperty("spreadsheetFileName")) {
			this.component.setSpreadsheetFileName(options.spreadsheetFileName);
		}
		if (options.hasOwnProperty("context")) {
			this.component.setContext(options.context);
		}
		if (options.hasOwnProperty("columns")) {
			this.component.setColumns(options.columns);
		}
		if (options.hasOwnProperty("tableId")) {
			this.component.setTableId(options.tableId);
		}
		if (options.hasOwnProperty("odataType")) {
			this.component.setOdataType(options.odataType);
		}
		if (options.hasOwnProperty("mandatoryFields")) {
			this.component.setMandatoryFields(options.mandatoryFields);
		}
		if (options.hasOwnProperty("fieldMatchType")) {
			this.component.setFieldMatchType(options.fieldMatchType);
		}
		if (options.hasOwnProperty("activateDraft")) {
			this.component.setActivateDraft(options.activateDraft);
		}
		if (options.hasOwnProperty("batchSize")) {
			this.component.setBatchSize(options.batchSize);
		}
		if (options.hasOwnProperty("standalone")) {
			this.component.setStandalone(options.standalone);
		}
		if (options.hasOwnProperty("strict")) {
			this.component.setStrict(options.strict);
		}
		if (options.hasOwnProperty("decimalSeparator")) {
			this.component.setDecimalSeparator(options.decimalSeparator);
		}
		if (options.hasOwnProperty("hidePreview")) {
			this.component.setHidePreview(options.hidePreview);
		}
		if (options.hasOwnProperty("skipMandatoryFieldCheck")) {
			this.component.setSkipMandatoryFieldCheck(options.skipMandatoryFieldCheck);
		}
		if (options.hasOwnProperty("showBackendErrorMessages")) {
			this.component.setShowBackendErrorMessages(options.showBackendErrorMessages);
		}
		if (options.hasOwnProperty("showOptions")) {
			this.component.setShowOptions(options.showOptions);
		}
		if (options.hasOwnProperty("debug")) {
			this.component.setDebug(options.debug);
		}
		if (options.hasOwnProperty("availableOptions")) {
			this.component.setAvailableOptions(options.availableOptions);
		}
		if (options.hasOwnProperty("sampleData")) {
			this.component.setSampleData(options.sampleData);
		}
		if (options.hasOwnProperty("hideSampleData")) {
			this.component.setHideSampleData(options.hideSampleData);
		}

		// Special case for showOptions
		if (options.availableOptions && options.availableOptions.length > 0) {
			this.component.setShowOptions(true);
		}
	}

	_checkIfODataIsV4() {
		try {
			let model;
			// @ts-ignore
			if (this.component.getContext().base) {
				// @ts-ignore
				model = this.component.getContext().base.getModel();
			} else {
				// @ts-ignore
				model = this.component.getContext().getModel();
			}

			if (model.getODataVersion() === "4.0") {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			return false;
		}
	}

	_setPayload(payload: any) {
		this.payloadArray = payload;
	}

	refreshBinding(context: any, binding: any, id: any) {
		if (context._controller?.getExtensionAPI()) {
			// refresh binding in V4 FE context
			try {
				context._controller.getExtensionAPI().refresh(binding.getPath());
			} catch (error) {
				Log.error("Failed to refresh binding in V4 FE context: " + error);
			}
		} else if (context.extensionAPI) {
			// refresh binding in V2 FE context
			if (context.extensionAPI.refresh) {
				try {
					context.extensionAPI.refresh(binding.getPath(id));
				} catch (error) {
					Log.error("Failed to refresh binding in Object Page V2 FE context: " + error);
				}
			}
			if (context.extensionAPI.refreshTable) {
				try {
					context.extensionAPI.refreshTable(id);
				} catch (error) {
					Log.error("Failed to refresh binding in List Report V2 FE context: " + error);
				}
			}
		}
		// try refresh binding either way
		try {
			binding.refresh(true);
		} catch (error) {
			Log.error("Failed to refresh binding in other contexts: " + error);
		}
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
		this.odataHandler.resetContexts();
		this.spreadsheetUploadDialogHandler.resetContent();
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
				message.type = CustomMessageTypes.CustomErrorGroup;
			} else {
				message.type = CustomMessageTypes.CustomError;
			}
			message.counter = 1;
		});
		this.messageHandler.addArrayToMessages(messagesArray);
	}

	public getSpreadsheetUploadDialog(): SpreadsheetDialog {
		return this.spreadsheetUploadDialogHandler.getDialog();
	}

	public getPayloadArray(): any[] {
		return this.payloadArray;
	}

	public getODataHandler(): OData {
		return this.odataHandler;
	}

	public get isODataV4(): boolean {
		return this._isODataV4;
	}
	public set isODataV4(value: boolean) {
		this._isODataV4 = value;
	}
	public get tableObject(): any {
		return this._tableObject;
	}
	public set tableObject(value: any) {
		this._tableObject = value;
	}
	public get binding(): any {
		return this._binding;
	}
	public set binding(value: any) {
		this._binding = value;
	}
	public get spreadsheetUploadDialogHandler(): SpreadsheetUploadDialog {
		return this._spreadsheetUploadDialogHandler;
	}
	public set spreadsheetUploadDialogHandler(value: SpreadsheetUploadDialog) {
		this._spreadsheetUploadDialogHandler = value;
	}
	public get controller(): import("sap/ui/core/mvc/Controller").default {
		return this._controller;
	}
	public get view(): XMLView {
		return this._view;
	}
	public getOdataType(): string {
		return this._odataType;
	}
}
