import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";
import SpreadsheetUpload from "./controller/SpreadsheetUpload";
import { ComponentData, DeepDownloadConfig, Messages } from "./types";
import Log from "sap/base/Log";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Logger from "./controller/Logger";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import Button from "sap/m/Button";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import Util from "./controller/Util";
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class Component extends UIComponent {
	spreadsheetUpload: SpreadsheetUpload;
	private _sContentDensityClass: any;
	public _densityClass: string;
	public logger: Logger;
	oContainer: ComponentContainer;
	settingsFromContainer: $ComponentSettings;
	constructor(idOrSettings?: string | $ComponentSettings);
	constructor(id?: string, settings?: $ComponentSettings);
	constructor(id?: string, settings?: $ComponentSettings) {
		this.settingsFromContainer = id;
		super(id, settings);
	}

	public static metadata = {
		// interfaces: ["sap.ui.core.IAsyncContentCreation"],
		manifest: "json",
		properties: {
			spreadsheetFileName: { type: "string", defaultValue: "Template.xlsx" },
			context: { type: "object" },
			// @ts-ignore
			columns: { type: "string[]", defaultValue: [] },
			// @ts-ignore
			excludeColumns: { type: "string[]", defaultValue: [] },
			tableId: { type: "string" },
			odataType: { type: "string" },
			// @ts-ignore
			mandatoryFields: { type: "string[]", defaultValue: [] },
			fieldMatchType: { type: "string", defaultValue: "labelTypeBrackets" },
			activateDraft: { type: "boolean", defaultValue: false },
			batchSize: { type: "int", defaultValue: 1000 },
			standalone: { type: "boolean", defaultValue: false },
			strict: { type: "boolean", defaultValue: false },
			decimalSeparator: { type: "string", defaultValue: "" },
			hidePreview: { type: "boolean", defaultValue: false },
			// @ts-ignore
			previewColumns: { type: "string[]", defaultValue: [] },
			skipMandatoryFieldCheck: { type: "boolean", defaultValue: false },
			skipColumnsCheck: { type: "boolean", defaultValue: false },
			skipMaxLengthCheck: { type: "boolean", defaultValue: false },
			showBackendErrorMessages: { type: "boolean", defaultValue: false },
			showOptions: { type: "boolean", defaultValue: false },
			// @ts-ignore
			availableOptions: { type: "string[]", defaultValue: [] },
			hideSampleData: { type: "boolean", defaultValue: false },
			sampleData: { type: "object" },
			spreadsheetTemplateFile: { type: "any", defaultValue: "" },
			useTableSelector: { type: "boolean", defaultValue: false },
			readAllSheets: { type: "boolean", defaultValue: false },
			readSheet: { type: "any", defaultValue: 0 },
			spreadsheetRowPropertyName: { type: "string" },
			continueOnError: { type: "boolean", defaultValue: false },
			createActiveEntity: { type: "boolean", defaultValue: false },
			i18nModel: { type: "object" },
			debug: { type: "boolean", defaultValue: false },
			componentContainerData: { type: "object" },
			bindingCustom: { type: "object" },
			showDownloadButton: { type: "boolean", defaultValue: false },
			deepDownloadConfig: { type: "object", defaultValue: {} }
			//Pro Configurations
		},
		aggregations: {
			rootControl: {
				type: "sap.ui.core.Control",
				multiple: false,
				visibility: "hidden"
			}
		},
		events: {
			preFileProcessing: {
				parameters: {
					file: { type: "object" }
				}
			},
			checkBeforeRead: {
				parameters: {
					sheetData: { type: "object" },
					parsedData: { type: "object" },
					messages: { type: "object" }
				}
			},
			changeBeforeCreate: {
				parameters: {
					payload: { type: "object" }
				}
			},
			requestCompleted: {
				parameters: {
					success: { type: "boolean" }
				}
			},
			uploadButtonPress: {
				allowPreventDefault: true,
				parameters: {
					payload: { type: "object" },
					rawData: { type: "object" },
					parsedData: { type: "object" }
				}
			}
		}
	};

	//=============================================================================
	//LIFECYCLE APIS
	//=============================================================================

	public async init(): Promise<void> {
		let model;
		const componentData = this.getComponentData() as ComponentData;
		const compData =
			componentData != null ? (Object.keys(componentData).length === 0 ? (this.settingsFromContainer as ComponentData) : componentData) : (this.settingsFromContainer as ComponentData);
		this.getContentDensityClass();
		this.setSpreadsheetFileName(compData?.spreadsheetFileName);
		this.setContext(compData?.context);
		this.setColumns(compData?.columns);
		this.setExcludeColumns(compData?.excludeColumns);
		this.setTableId(compData?.tableId);
		this.setOdataType(compData?.odataType);
		this.setMandatoryFields(compData?.mandatoryFields);
		this.setFieldMatchType(compData?.fieldMatchType);
		this.setActivateDraft(compData?.activateDraft);
		this.setBatchSize(compData?.batchSize);
		this.setStandalone(compData?.standalone);
		this.setReadAllSheets(compData?.readAllSheets);
		this.setReadSheet(compData?.readSheet);
		this.setSpreadsheetRowPropertyName(compData?.spreadsheetRowPropertyName);
		this.setStrict(compData?.strict);
		this.setDecimalSeparator(compData?.decimalSeparator);
		this.setHidePreview(compData?.hidePreview);
		this.setPreviewColumns(compData?.previewColumns);
		this.setSkipMandatoryFieldCheck(compData?.skipMandatoryFieldCheck);
		this.setSkipColumnsCheck(compData?.skipColumnsCheck);
		this.setSkipMaxLengthCheck(compData?.skipMaxLengthCheck);
		this.setShowBackendErrorMessages(compData?.showBackendErrorMessages);
		this.setShowOptions(compData?.showOptions);
		this.setDebug(compData?.debug);
		this.setAvailableOptions(compData?.availableOptions);
		this.setSampleData(compData?.sampleData);
		this.setSpreadsheetTemplateFile(compData?.spreadsheetTemplateFile);
		this.setUseTableSelector(compData?.useTableSelector);
		this.setHideSampleData(compData?.hideSampleData);
		this.setComponentContainerData(compData?.componentContainerData);
		this.setContinueOnError(compData?.continueOnError);
		this.setCreateActiveEntity(compData?.createActiveEntity);
		this.setI18nModel(compData?.i18nModel);
		this.setBindingCustom(compData?.bindingCustom);
		this.setShowDownloadButton(compData?.showDownloadButton);
		if (compData?.availableOptions && compData?.availableOptions.length > 0) {
			// if availableOptions is set show the Options Menu
			this.setShowOptions(true);
		}

		const defaultDeepDownloadConfig: DeepDownloadConfig = {
				addKeysToExport: false,
				deepExport: false,
				deepLevel: 1,
				showOptions: true,
				columns: []
		};

	    const mergedDeepDownloadConfig = Util.mergeConfig(defaultDeepDownloadConfig, compData.deepDownloadConfig)
		this.setDeepDownloadConfig(mergedDeepDownloadConfig);

		// Pro Configurations - Start

		// Pro Configurations - End

		// // we could create a device model and use it
		model = new JSONModel(Device);
		model.setDefaultBindingMode("OneWay");
		this.setModel(model, "device");

		this.logger = new Logger();

		// call the init function of the parent - ATTENTION: this triggers createContent()
		// call the base component's init function
		super.init();
	}

	createContent() {
		if (this.getDebug() || Log.getLevel() >= Log.Level.DEBUG) {
			Log.setLevel(Log.Level.DEBUG);

			Log.logSupportInfo(true);
			this.setShowOptions(true);
		}
		const componentData = Object.assign({}, this.getComponentData()) as ComponentData;
		delete componentData.context;
		Log.debug("Component Data", undefined, "SpreadsheetUpload: Component", () => this.logger.returnObject(componentData));
		this.spreadsheetUpload = new SpreadsheetUpload(this, this.getModel("i18n") as ResourceModel);
		const componentContainerData = this.getComponentContainerData?.() || {};
		const buttonText = componentContainerData.buttonText ?? "Excel Import";
		const buttonId = componentContainerData.buttonId
		
		// Check if the download button should be enabled
		const showDownloadButton = componentContainerData.downloadButton ?? false;
		let pressMethod = () => this.openSpreadsheetUploadDialog();

		if(showDownloadButton) {
			pressMethod = () => this.triggerDownloadSpreadsheet();
		}

		if(buttonId) {
			return new Button({ id: this.createId(buttonId), text: buttonText, press: pressMethod });
		}

		return new Button({ text: buttonText, press: pressMethod });
	}

	//=============================================================================
	//OVERRIDE SETTERS
	//=============================================================================

	//=============================================================================
	//PUBLIC APIS
	//=============================================================================

	/**
	 * Opens the dialog for selecting a customer.
	 * @public
	 */
	openSpreadsheetUploadDialog(options?: ComponentData) {
		if (!this.getContext()) {
			// if loaded via ComponentContainer, context is not set
			const context = this._getViewControllerOfControl(this.oContainer);
			this.setContext(context);
			// attach event from ComponentContainer
			this._attachEvents(context);
		}
		Log.debug("openSpreadsheetUploadDialog", undefined, "SpreadsheetUpload: Component");
		this.spreadsheetUpload.openSpreadsheetUploadDialog(options);
	}

	async triggerDownloadSpreadsheet(deepDownloadConfig?: DeepDownloadConfig) {
		if (!this.getContext()) {
			// if loaded via ComponentContainer, context is not set
			const context = this._getViewControllerOfControl(this.oContainer);
			this.setContext(context);
			// attach event from ComponentContainer
			this._attachEvents(context);
		}
		await this.spreadsheetUpload.initializeComponent();
		Log.debug("triggerDownloadSpreadsheet", undefined, "SpreadsheetUpload: Component");
		if (deepDownloadConfig) {
			this.setDeepDownloadConfig(deepDownloadConfig);
		}
		this.spreadsheetUpload.triggerDownloadSpreadsheet();
	}

	/**
	 * Attaches events to the component container based on the provided options.
	 * @param context - The controller context to attach the events to.
	 * @returns void
	 */
	private _attachEvents(context: Controller) {
		const componentContainerOptions = this.getComponentContainerData();
		const eventMethodMap = {
			preFileProcessing: this.attachPreFileProcessing,
			uploadButtonPress: this.attachUploadButtonPress,
			changeBeforeCreate: this.attachChangeBeforeCreate,
			checkBeforeRead: this.attachCheckBeforeRead,
			requestCompleted: this.attachRequestCompleted
		};
		if (componentContainerOptions) {
			for (const [eventName, attachMethod] of Object.entries(eventMethodMap)) {
				const methodName = componentContainerOptions[eventName];
				console.log(`eventName: ${eventName}, methodName: ${methodName}`);
				if (methodName && typeof context[methodName] === "function") {
					try {
						console.log(`Attaching ${methodName} to ${eventName}`);
						attachMethod.call(this, context[methodName].bind(context), context);
					} catch (error) {
						Log.error(`Error while attaching event ${eventName}`, error, "SpreadsheetUpload: Component");
					}
				} else {
					console.log(`Method ${methodName} not found on context or is not a function`);
				}
			}
		}
	}

	async triggerInitContext() {
		await this.spreadsheetUpload.initialSetup();
	}

	/**
	 * add to error array
	 * @public
	 */
	addArrayToMessages(errorArray: Messages[]) {
		this.spreadsheetUpload.addToMessages(errorArray);
	}

	getMessages(): Messages[] {
		return this.spreadsheetUpload.getMessages();
	}

	//=============================================================================
	//EVENT HANDLERS
	//=============================================================================

	// Component.prototype.onCheckBeforeRead = function (firstSheet) {
	// 		this.fireCheckBeforeRead({sheetData:firstSheet})
	// };

	// onChangeBeforeCreate(event: Component$ChangeBeforeCreateEvent) {
	// 	var aContexts, oCustomer;

	// 	aContexts = event.getParameter("selectedContexts");
	// }

	//=============================================================================
	//PRIVATE APIS
	//=============================================================================

	/**
	 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
	 * design mode class should be set, which influences the size appearance of some controls.
	 * @private
	 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
	 */
	getContentDensityClass() {
		if (this._sContentDensityClass === undefined) {
			// check whether FLP has already set the content density class; do nothing in this case
			if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
				this._sContentDensityClass = "";
				// set _densityClass to "sapUiSizeCozy" or "sapUiSizeCompact" depending on the current content density
				this._densityClass = document.body.classList.contains("sapUiSizeCozy") ? "sapUiSizeCozy" : "sapUiSizeCompact";
			} else if (!Device.support.touch) {
				// apply "compact" mode if touch is not supported
				this._sContentDensityClass = "sapUiSizeCompact";
			} else {
				// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
				this._sContentDensityClass = "sapUiSizeCozy";
			}
		}
		return this._sContentDensityClass;
	}

	_getViewControllerOfControl(control: any) {
		var view = null;
		while (control && !(control instanceof View)) {
			control = control.getParent();
		}

		if (control) {
			view = control;
			var controller = view.getController();
			return controller;
		} else {
			return null;
		}
	}

	//=============================================================================
	//PRO APIS
	//=============================================================================
}
