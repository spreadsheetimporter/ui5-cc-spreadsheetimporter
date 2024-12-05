import ManagedObject from "sap/ui/base/ManagedObject";
import Component from "../Component";
import XMLView from "sap/ui/core/mvc/XMLView";
import { Messages, ListObject, ComponentData } from "../types";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import OData from "./odata/OData";
import ODataV2 from "./odata/ODataV2";
import ODataV4 from "./odata/ODataV4";
import Util from "./Util";
import MessageHandler from "./MessageHandler";
import Log from "sap/base/Log";
import OptionsDialog from "./dialog/OptionsDialog";
import SpreadsheetDialog from "../control/SpreadsheetDialog";
import SpreadsheetUploadDialog from "./dialog/SpreadsheetUploadDialog";
import { CustomMessageTypes } from "../enums";
import VersionInfo from "sap/ui/VersionInfo";
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class SpreadsheetUpload extends ManagedObject {
	public odataEntityType: any;
	public component: Component;
	public context: any;
	private _isODataV4: boolean;
	private _view: XMLView;
	private _tableObject: any;
	private messageHandler: MessageHandler;
	public util: Util;
	private model: any;
	public typeLabelList: ListObject;
	public componentI18n: ResourceModel;
	private odataHandler: OData;
	public payload: any;
	private _odataType: string;
	private _binding: any;

	public payloadArray: any[];
	public errorState: boolean;
	public errorMessage: any;
	private initialSetupPromise: Promise<void>;
	public messageArray: Messages[];
	public errorsFound: boolean;
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
		this.component = component;
		this.componentI18n = componentI18n;
		// enhance i18n model with data from the component config, custom i18n model will overwrite the default one but only the texts that are present in the custom i18n model
		//https://github.com/SAP/openui5/blob/85c3fc7d61b0886a1f53babd02100ef6bb96521b/src/sap.ui.core/src/sap/ui/model/resource/ResourceModel.js#L392-L426
		if (this.component.getI18nModel()) {
			try {
				// @ts-ignore
				this.componentI18n.enhance((this.component.getI18nModel() as ResourceModel).getResourceBundle());
			} catch (error) {
				Log.error("Error enhancing i18n model", error as Error, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ error: error }));
			}
		}
		this.util = new Util(componentI18n.getResourceBundle() as ResourceBundle);
		this.messageHandler = new MessageHandler(this);
		this.spreadsheetUploadDialogHandler = new SpreadsheetUploadDialog(this, component, componentI18n, this.messageHandler);
	}

	/**
	 * Executes initial setup.
	 * @returns {Promise<void>} A promise that resolves when the initial setup is complete.
	 */
	async initialSetup(): Promise<void> {
		// check if "sap.ui.generic" is available, if false it is OpenUI5
		this.isOpenUI5 = await this.isOpenUI5Context();
		// load version from UI5 2.0
		VersionInfo.load()
			.catch(function (err) {
				Log.error("failed to load global version info", err);
			})
			.then(
				function (versionInfo: any) {
					const version = versionInfo.version;
					const text = "UI5 Version Info: " + versionInfo.name + " - " + versionInfo.version;
					Log.debug("constructor", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ ui5version: version, isOpenUI5: this.isOpenUI5 }));
				}.bind(this)
			);
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
		this.view = OData.prototype.getView(this.context);
		if (this.component.getBindingCustom()) {
			this.binding = this.component.getBindingCustom();
			Log.debug("binding", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ binding: this.binding }));
		} else {
			this.tableObject = await OData.prototype.getTableObject(this.component.getTableId(), this.view, this);
			Log.debug("tableObject", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ tableObject: this.tableObject }));
			if(!this.tableObject) {
				throw new Error("No table object found");
			}
			this.component.setTableId(this.tableObject.getId());
			Log.debug("table Id", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ tableID: this.tableObject.getId() }));
			this.binding = OData.prototype.getBindingFromTable(this.tableObject);
		}
		if (!this.binding) {
			throw new Error(this.util.geti18nText("spreadsheetimporter.bindingError"));
		}
		this.isODataV4 = this._checkIfODataIsV4(this.binding);
		this.odataHandler = this.createODataHandler(this);
		this.controller = this.view.getController();
		Log.debug("View", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ view: this.view }));
		this.view.addDependent(this.spreadsheetUploadDialogHandler.getDialog());
		this._odataType = await this.odataHandler.getOdataType(this.binding, this.component.getOdataType());
		Log.debug("odataType", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ odataType: this._odataType }));
		this.odataKeyList = await this.odataHandler.getKeyList(this._odataType, this.binding);
		Log.debug("odataKeyList", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ odataKeyList: this.odataKeyList }));
		this.typeLabelList = await this.odataHandler.getLabelList(this.component.getColumns(), this._odataType, this.component.getExcludeColumns(), this.binding);
		Log.debug("typeLabelList", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ typeLabelList: this.typeLabelList }));

		const { mainEntity, expands } = this.odataHandler.getODataEntitiesRecursive(this.getOdataType(), Infinity);
		Log.debug("mainEntity", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ mainEntity: mainEntity }));
		Log.debug("expands", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({ expands: expands }));

		this.model = this.binding.getModel();
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
	createODataHandler(spreadsheetUploadController: SpreadsheetUpload): OData {
		if (this.isODataV4) {
			return new ODataV4(spreadsheetUploadController);
		} else {
			return new ODataV2(spreadsheetUploadController);
		}
	}

	/**
	 * Initializes the component with options and performs initial setup
	 * @param {ComponentData} options - Configuration options
	 * @returns {Promise<void>}
	 */
	async initializeComponent(): Promise<void> {
		this.initialSetupPromise = this.initialSetup();
		await this.initialSetupPromise;
		
		if (this.errorState) {
			Util.showError(this.errorMessage, "SpreadsheetUpload.ts", "initialSetup");
			Log.error("Error during initialization", undefined, "SpreadsheetUpload: SpreadsheetUpload");
			throw this.errorMessage;
		}
	}

	/**
	 * Opens the Spreadsheet upload dialog.
	 * @param {ComponentData} options - Optional configuration options
	 */
	async openSpreadsheetUploadDialog(options?: ComponentData) {
		try {
			if (options) {
				this.setComponentOptions(options);
			}
			await this.initializeComponent();
			this.spreadsheetUploadDialogHandler.openSpreadsheetUploadDialog();
		} catch (error) {
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
		if (options.hasOwnProperty("excludeColumns")) {
			this.component.setExcludeColumns(options.excludeColumns);
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
		if (options.hasOwnProperty("previewColumns")) {
			this.component.setPreviewColumns(options.previewColumns);
		}
		if (options.hasOwnProperty("skipMandatoryFieldCheck")) {
			this.component.setSkipMandatoryFieldCheck(options.skipMandatoryFieldCheck);
		}
		if (options.hasOwnProperty("skipColumnsCheck")) {
			this.component.setSkipColumnsCheck(options.skipColumnsCheck);
		}
		if (options.hasOwnProperty("skipColumnsCheck")) {
			this.component.setSkipColumnsCheck(options.useTableSelector);
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
		if (options.hasOwnProperty("spreadsheetTemplateFile")) {
			this.component.setSpreadsheetTemplateFile(options.spreadsheetTemplateFile);
		}
		if (options.hasOwnProperty("hideSampleData")) {
			this.component.setHideSampleData(options.hideSampleData);
		}
		if (options.hasOwnProperty("spreadsheetRowPropertyName")) {
			this.component.setUseTableSelector(options.useTableSelector);
		}
		if (options.hasOwnProperty("readAllSheets")) {
			this.component.setReadAllSheets(options.readAllSheets);
		}
		if (options.hasOwnProperty("readSheet")) {
			this.component.setReadSheet(options.readSheet);
		}
		if (options.hasOwnProperty("continueOnError")) {
			this.component.setContinueOnError(options.continueOnError);
		}
		if (options.hasOwnProperty("createActiveEntity")) {
			this.component.setCreateActiveEntity(options.createActiveEntity);
		}
		if (options.hasOwnProperty("componentContainerData")) {
			this.component.setComponentContainerData(options.componentContainerData);
		}
		if (options.hasOwnProperty("i18nModel")) {
			this.component.setI18nModel(options.i18nModel);
		}
		if (options.hasOwnProperty("bindingCustom")) {
			this.component.setBindingCustom(options.bindingCustom);
		}
		if (options.hasOwnProperty("showDownloadButton")) {
			this.component.setShowDownloadButton(options.showDownloadButton);
		}

		// Special case for showOptions
		if (options.availableOptions && options.availableOptions.length > 0) {
			this.component.setShowOptions(true);
		}
	}

	_checkIfODataIsV4(binding: any) {
		try {
				const odataVersion = binding.getModel().getMetadata().getName();
				if (odataVersion === "sap.ui.model.odata.v2.ODataModel") {
					return false;
				} else {
				return true;
			}
		} catch (error) {
			Log.debug("Error getting the odata version from the tableObject", error as Error, "SpreadsheetUpload: SpreadsheetUpload");
			return false;
		}
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
			let refreshFailed = false;
			// refresh binding in V2 FE context
			if (context.extensionAPI.refresh) {
				try {
					context.extensionAPI.refresh(binding.getPath(id));
				} catch (error) {
					Log.error("Failed to refresh binding in Object Page V2 FE context: " + error);
					refreshFailed = true;
				}
			}
			if (context.extensionAPI.refreshTable) {
				try {
					context.extensionAPI.refreshTable(id);
				} catch (error) {
					Log.error("Failed to refresh binding in List Report V2 FE context: " + error);
					refreshFailed = true;
				}
			}
			// try refresh binding when refresh failed
			if (refreshFailed) {
				try {
					// force refresh only available for v2
					binding.refresh(true);
				} catch (error) {
					Log.error("Failed to refresh binding in other contexts: " + error);
				}
			}
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

	triggerDownloadSpreadsheet() {
		this.spreadsheetUploadDialogHandler.onDownloadDataSpreadsheet();
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

	private async isOpenUI5Context(): Promise<boolean> {
		try {
			// sap.ui.core.Messaging is only available in UI5 version 1.118 and above, prefer this over sap.ui.getCore().getMessageManager() = Util.loadUI5RessourceAsync("sap/ui/core/Messaging");
			await Util.loadUI5RessourceAsync("sap/ui/generic");
			return true;
		} catch (error) {
			Log.debug("sap/ui/generic not found", undefined, "SpreadsheetUpload: isOpenUI5");
			return false;
		}
	}
}
