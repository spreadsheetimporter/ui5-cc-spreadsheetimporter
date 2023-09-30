import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";
import SpreadsheetUpload from "./controller/SpreadsheetUpload";
import { ComponentData, Messages } from "./types";
import Log from "sap/base/Log";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Logger from "./controller/Logger";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import Button from "sap/m/Button";
import Controller from "sap/ui/core/mvc/Controller";
/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class Component extends UIComponent {
	spreadsheetUpload: SpreadsheetUpload;
	private _sContentDensityClass: any;
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
			skipMandatoryFieldCheck: { type: "boolean", defaultValue: false },
			showBackendErrorMessages: { type: "boolean", defaultValue: false },
			showOptions: { type: "boolean", defaultValue: false },
			// @ts-ignore
			availableOptions: { type: "string[]", defaultValue: [] },
			hideSampleData: { type: "boolean", defaultValue: false },
			sampleData: { type: "object" },
			useTableSelector: { type: "boolean", defaultValue: false },
			readAllSheets: { type: "boolean", defaultValue: false },
			debug: { type: "boolean", defaultValue: false },
			componentContainerData: { type: "object" }
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
			checkBeforeRead: {
				parameters: {
					sheetData: { type: "object" },
					messages: { type: "object" }
				}
			},
			changeBeforeCreate: {
				parameters: {
					payload: { type: "object" }
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
		var oModel;
		const componentData = this.getComponentData() as ComponentData;
		const oCompData =
			componentData != null ? (Object.keys(componentData).length === 0 ? (this.settingsFromContainer as ComponentData) : componentData) : (this.settingsFromContainer as ComponentData);
		this.getContentDensityClass();
		this.setSpreadsheetFileName(oCompData?.spreadsheetFileName);
		this.setContext(oCompData?.context);
		this.setColumns(oCompData?.columns);
		this.setTableId(oCompData?.tableId);
		this.setOdataType(oCompData?.odataType);
		this.setMandatoryFields(oCompData?.mandatoryFields);
		this.setFieldMatchType(oCompData?.fieldMatchType);
		this.setActivateDraft(oCompData?.activateDraft);
		this.setBatchSize(oCompData?.batchSize);
		this.setStandalone(oCompData?.standalone);
		this.setReadAllSheets(oCompData?.readAllSheets);
		this.setStrict(oCompData?.strict);
		this.setDecimalSeparator(oCompData?.decimalSeparator);
		this.setHidePreview(oCompData?.hidePreview);
		this.setSkipMandatoryFieldCheck(oCompData?.skipMandatoryFieldCheck);
		this.setShowBackendErrorMessages(oCompData?.showBackendErrorMessages);
		this.setShowOptions(oCompData?.showOptions);
		this.setDebug(oCompData?.debug);
		this.setAvailableOptions(oCompData?.availableOptions);
		this.setSampleData(oCompData?.sampleData);
		this.setUseTableSelector(oCompData?.useTableSelector);
		this.setHideSampleData(oCompData?.hideSampleData);
		this.setComponentContainerData(oCompData?.componentContainerData);
		if (oCompData?.availableOptions && oCompData?.availableOptions.length > 0) {
			// if availableOptions is set show the Options Menu
			this.setShowOptions(true);
		}

		// Pro Configurations - Start

		// Pro Configurations - End

		// // we could create a device model and use it
		oModel = new JSONModel(Device);
		oModel.setDefaultBindingMode("OneWay");
		this.setModel(oModel, "device");

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
		return new Button({ text: buttonText, press: () => this.openSpreadsheetUploadDialog() });
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

	/**
	 * Attaches events to the component container based on the provided options.
	 * @param context - The controller context to attach the events to.
	 * @returns void
	 */
	private _attachEvents(context: Controller) {
		const componentContainerOptions = this.getComponentContainerData();
		const eventMethodMap = {
			uploadButtonPress: this.attachUploadButtonPress,
			changeBeforeCreate: this.attachChangeBeforeCreate,
			checkBeforeRead: this.attachCheckBeforeRead
		};

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

	async triggerInitContext() {
		await this.spreadsheetUpload.initialSetup();
	}

	/**
	 * Set Payload for Event
	 * @public
	 */
	setPayload(payload: any) {
		this.spreadsheetUpload._setPayload(payload);
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
		var oView = null;
		while (control && !(control instanceof sap.ui.core.mvc.View)) {
			control = control.getParent();
		}

		if (control) {
			oView = control;
			var oController = oView.getController();
			return oController;
		} else {
			return null;
		}
	}
}
