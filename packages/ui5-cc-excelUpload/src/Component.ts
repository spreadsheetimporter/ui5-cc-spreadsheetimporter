import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";
import Device, { support } from "sap/ui/Device";
import ExcelUpload from "./controller/ExcelUpload";
import { ComponentData, FieldMatchType, Messages } from "./types";
import { $ComponentSettings } from "sap/ui/core/Component";
import Log, { Level } from "sap/base/Log";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Logger from "./controller/Logger";
import Event from "sap/ui/base/Event";
/**
 * @namespace cc.excelUpload.XXXnamespaceXXX
 */
export default class Component extends UIComponent {
	excelUpload: ExcelUpload;
	private _sContentDensityClass: any;
	public logger: Logger;
	constructor(idOrSettings?: string | $ComponentSettings);
	constructor(id?: string, settings?: $ComponentSettings);
	constructor(id?: string, settings?: $ComponentSettings) {
		super(id, settings);
	}

	public static metadata = {
		interfaces: ["sap.ui.core.IAsyncContentCreation"],
		manifest: "json",
		properties: {
			excelFileName: { type: "string", defaultValue: "Template.xlsx" },
			context: { type: "object" },
			// @ts-ignore
			columns: { type: "string[]" , defaultValue: []},
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
			availableOptions: { type: "string[]", defaultValue: []},
			debug: { type: "boolean", defaultValue: false },
		},
		aggregations: {
			rootControl: {
				type: "sap.ui.core.Control",
				multiple: false,
				visibility: "hidden",
			},
		},
		events: {
			checkBeforeRead: {
				parameters: {
					sheetData: { type: "object" },
					messages: { type: "object" },
				},
			},
			changeBeforeCreate: {
				parameters: {
					payload: { type: "object" },
				},
			},
			uploadButtonPress: {
				allowPreventDefault: true,
				parameters: {
					payload: { type: "object" },
				},
			},
		},
	};

	//=============================================================================
	//LIFECYCLE APIS
	//=============================================================================

	public async init(): Promise<void> {
		var oModel;
		const oCompData = this.getComponentData() as ComponentData;
		this.getContentDensityClass();
		this.setExcelFileName(oCompData.excelFileName);
		this.setContext(oCompData.context);
		this.setColumns(oCompData.columns);
		this.setTableId(oCompData.tableId);
		this.setOdataType(oCompData.odataType);
		this.setMandatoryFields(oCompData.mandatoryFields);
		this.setFieldMatchType(oCompData.fieldMatchType);
		this.setActivateDraft(oCompData.activateDraft);
		this.setBatchSize(oCompData.batchSize);
		this.setStandalone(oCompData.standalone);
		this.setStrict(oCompData.strict);
		this.setDecimalSeparator(oCompData.decimalSeparator);
		this.setHidePreview(oCompData.hidePreview);
		this.setSkipMandatoryFieldCheck(oCompData.skipMandatoryFieldCheck);
		this.setShowBackendErrorMessages(oCompData.showBackendErrorMessages);
		this.setShowOptions(oCompData.showOptions);
		this.setDebug(oCompData.debug);
		this.setAvailableOptions(oCompData.availableOptions);
		if(oCompData.availableOptions && oCompData.availableOptions.length > 0){
			// if availableOptions is set show the Options Menu
			this.setShowOptions(true)
		}

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
		if(this.getDebug() || Log.getLevel() >= Level.DEBUG){
			Log.setLevel(Level.DEBUG);
			// @ts-ignore
			Log.logSupportInfo(true)
			this.setShowOptions(true)
		}
		const componentData = Object.assign({}, this.getComponentData()) as ComponentData;
		delete componentData.context;
		Log.debug("Component Data",undefined,"ExcelUpload: Component",() => this.logger.returnObject(componentData))
		this.excelUpload = new ExcelUpload(this, this.getModel("i18n") as ResourceModel);
		return this.excelUpload.getExcelUploadDialog()
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
	openExcelUploadDialog() {
		Log.debug("openExcelUploadDialog",undefined,"ExcelUpload: Component")
		this.excelUpload.openExcelUploadDialog();
	}

	/**
	 * Set Payload for Event
	 * @public
	 */
	setPayload(payload: any) {
		this.excelUpload._setPayload(payload);
	}

	/**
	 * add to error array
	 * @public
	 */
	addArrayToMessages(errorArray: Messages[]) {
		this.excelUpload.addToMessages(errorArray);
	}

	getMessages(): Messages[] {
		return this.excelUpload.getMessages();
	}

	//=============================================================================
	//EVENT HANDLERS
	//=============================================================================

	// Component.prototype.onCheckBeforeRead = function (firstSheet) {
	// 		this.fireCheckBeforeRead({sheetData:firstSheet})
	// };

	onChangeBeforeCreate(event: Event) {
		var aContexts, oCustomer;

		aContexts = event.getParameter("selectedContexts");
	}

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
			} else if (!support.touch) {
				// apply "compact" mode if touch is not supported
				this._sContentDensityClass = "sapUiSizeCompact";
			} else {
				// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
				this._sContentDensityClass = "sapUiSizeCozy";
			}
		}
		return this._sContentDensityClass;
	}
}
