import ManagedObject from "sap/ui/base/ManagedObject";
import DraftController from "sap/ui/generic/app/transaction/DraftController";
import { Columns, FireEventReturnType, ListObject, Property } from "../../types";
import ODataMessageHandler from "../dialog/ODataMessageHandler";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Log from "sap/base/Log";
import MetadataHandlerV2 from "./MetadataHandlerV2";
import MetadataHandlerV4 from "./MetadataHandlerV4";
import TableSelector from "../TableSelector";
import JSONModel from "sap/ui/model/json/JSONModel";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import Util from "../Util";
import ODataListBindingV2 from "sap/ui/model/odata/v2/ODataListBinding";
import ODataListBindingV4 from "sap/ui/model/odata/v4/ODataListBinding";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default abstract class OData extends ManagedObject {
	draftController: DraftController;
	odataMessageHandler: ODataMessageHandler;
	private _tables: any[] = [];
	busyDialog: Dialog;
	spreadsheetUploadController: SpreadsheetUpload;

	constructor(spreadsheetUploadController: SpreadsheetUpload) {
		super();
		this.odataMessageHandler = new ODataMessageHandler(spreadsheetUploadController);
		this.spreadsheetUploadController = spreadsheetUploadController;
	}

	/**
	 * Helper method to call OData service.
	 * @param {*} fnResolve - The resolve function for the Promise.
	 * @param {*} fnReject - The reject function for the Promise.
	 */
	async callOdata(fnResolve: any, fnReject: any, spreadsheetUploadController: SpreadsheetUpload): Promise<void> {
		const component = spreadsheetUploadController.component;
		const tableObject = spreadsheetUploadController.tableObject;
		const payloadArray = spreadsheetUploadController.payloadArray;
		const binding = spreadsheetUploadController.binding;
		const context = spreadsheetUploadController.context;
		spreadsheetUploadController.errorsFound = false;

		// intializing the message manager for displaying the odata response messages
		try {
			// get binding of table to create rows
			const model = binding.getModel();

			await this.createBusyDialog(spreadsheetUploadController);

			// Slice the array into chunks of 'batchSize' if necessary
			const slicedPayloadArray = this.processPayloadArray(component.getBatchSize(), payloadArray);
			(this.busyDialog.getModel("busyModel") as JSONModel).setProperty("/progressText", `0/${payloadArray.length}`);
			let currentProgressPercent = 0;
			let currentProgressValue = 0;

			// Loop over the sliced array
			for (const batch of slicedPayloadArray) {
				// loop over data from spreadsheet file
				try {

					// default for draft scenarios we need to request the object first to get draft status otherwise the update will fail
					// with options the strategy could be changed to make the update quicker
					// request all objects in the batch first
					await this.getObjects(model, binding, batch);


					for (let payload of batch) {
						let fireEventAsyncReturn: FireEventReturnType;
						// skip draft and directly create
						if (component.getCreateActiveEntity()) {
							payload.IsActiveEntity = true;
						}
						// Extension method to manipulate payload
						try {
							fireEventAsyncReturn = await Util.fireEventAsync("changeBeforeCreate", { payload: payload }, component);
						} catch (error) {
							Log.error("Error while calling the changeBeforeCreate event", error as Error, "SpreadsheetUpload: callOdata");
						}
						if (fireEventAsyncReturn.returnValue) {
							payload = fireEventAsyncReturn.returnValue;
						}
						if(component.getAction() === "CREATE") {
							this.createAsync(model, binding, payload);
						}
						if(component.getAction() === "UPDATE") {
							await this.updateAsync(model, binding, payload);
						}
					}
					// wait for all drafts to be created
					await this.submitChanges(model);
					let errorsFoundLocal = await this.checkForErrors(model, binding, component.getShowBackendErrorMessages());
					if (errorsFoundLocal) {
						Log.error("Error while calling the odata service", "SpreadsheetUpload: callOdata");
						if (!component.getContinueOnError()) {
							this.busyDialog.close();
							spreadsheetUploadController.errorsFound = true;
							this.resetContexts();
							fnReject("Error while calling the odata service");
							break;
						}
					} else {
						await this.waitForCreation();
					}

					// check for and activate all drafts and wait for all draft to be created
					// only if createActiveEntity is false and IsActiveEntity is not used in the payload
					if (!component.getCreateActiveEntity() && component.getActivateDraft() && !errorsFoundLocal) {
						await this.waitForDraft();
					}

					this.resetContexts();
					currentProgressPercent = currentProgressPercent + (batch.length / payloadArray.length) * 100;
					currentProgressValue = currentProgressValue + batch.length;
					(this.busyDialog.getModel("busyModel") as JSONModel).setProperty("/progressPercent", currentProgressPercent);
					(this.busyDialog.getModel("busyModel") as JSONModel).setProperty("/progressText", `${currentProgressValue} / ${payloadArray.length}`);
				} catch (error) {
					if (component.getContinueOnError()) {
						Log.error("Error while calling the odata service", error as Error, "SpreadsheetUpload: callOdata");
					} else {
						// throw error to stop processing
						throw error;
					}
				}
			}
			if (tableObject) {
				spreadsheetUploadController.refreshBinding(context, binding, tableObject.getId());
			}
			this.busyDialog.close();
			fnResolve();
		} catch (error) {
			this.busyDialog.close();
			this.resetContexts();
			Log.error("Error while calling the odata service", error as Error, "SpreadsheetUpload: callOdata");
			await this.checkForODataErrors(component.getShowBackendErrorMessages());
			fnReject(error);
		}
	}

	public getBindingFromTable(tableObject: any): any {
		if (tableObject.getMetadata().getName() === "sap.m.Table" || tableObject.getMetadata().getName() === "sap.m.List") {
			return tableObject.getBinding("items");
		}
		if (tableObject.getMetadata().getName() === "sap.ui.table.Table") {
			return tableObject.getBinding("rows");
		}
	}

	public _getActionName(context: any, sOperation: string) {
		const model = (context?.getModel && context.getModel()) || context.getView().getModel(),
			metaModel = model.getMetaModel(),
			entitySetPath = metaModel.getMetaPath(context.getPath());
		return metaModel.getObject("".concat(entitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot/").concat(sOperation));
	}

	// Slice the array into chunks of 'batchSize' if necessary
	public processPayloadArray(batchSize: number, payloadArray: string | any[]) {
		if (batchSize > 0) {
			let slicedPayloadArray = [];
			const numOfSlices = Math.ceil(payloadArray.length / batchSize);
			const equalSize = Math.ceil(payloadArray.length / numOfSlices);

			for (let i = 0; i < payloadArray.length; i += equalSize) {
				slicedPayloadArray.push(payloadArray.slice(i, i + equalSize));
			}
			return slicedPayloadArray;
		} else {
			return [payloadArray];
		}
	}

	public async getTableObject(tableId: string, view: any, spreadsheetUploadController: SpreadsheetUpload): any {
		// try get object page table
		if (!tableId) {
			this.tables = view.findAggregatedObjects(true, function (object: any) {
				return object.isA("sap.m.Table") || object.isA("sap.ui.table.Table");
			});
			if (this.tables.length > 1 && !spreadsheetUploadController.component.getUseTableSelector()) {
				throw new Error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
			} else if (this.tables.length > 1 && spreadsheetUploadController.component.getUseTableSelector()) {
				const tableSelector = new TableSelector(view);
				let selectedTable;
				try {
					selectedTable = await tableSelector.chooseTable();
				} catch (error) {
					// user canceled or no table found
					throw new Error(spreadsheetUploadController.util.geti18nText("spreadsheetimporter.tableSelectorDialogCancel"));
				}
				return selectedTable;
			} else if (this.tables.length === 0) {
				throw new Error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
			} else {
				return this.tables[0];
			}
		} else {
			return view.byId(tableId);
		}
	}

	private async createBusyDialog(spreadsheetUploadController: SpreadsheetUpload) {
		const busyModel = new JSONModel({
			progressPercent: 0,
			progressText: "0"
		});
		if (!this.busyDialog) {
			this.busyDialog = (await Fragment.load({
				name: "cc.spreadsheetimporter.XXXnamespaceXXX.fragment.BusyDialogProgress",
				controller: this
			})) as Dialog;
		}
		this.busyDialog.setModel(busyModel, "busyModel");
		this.busyDialog.setModel(spreadsheetUploadController.component.getModel("device"), "device");
		this.busyDialog.setModel(spreadsheetUploadController.component.getModel("i18n"), "i18n");
		this.busyDialog.open();
	}

	private async checkForODataErrors(showBackendErrorMessages: Boolean) {
		if (showBackendErrorMessages) {
			try {
				// sap.ui.core.Messaging is only available in UI5 version 1.118 and above, prefer this over sap.ui.getCore().getMessageManager()saging = Util.loadUI5RessourceAsync("sap/ui/core/Messaging");
				const Messaging = await Util.loadUI5RessourceAsync("sap/ui/core/Messaging");
				const messages = Messaging.getMessageModel().getData();
				if (messages.length > 0) {
					this.odataMessageHandler.displayMessages(messages);
				}
				return;
			} catch (error) {
				Log.debug("sap/ui/core/Messaging not found", undefined, "SpreadsheetUpload: checkForODataErrors");
			}
			// ui5lint-disable-next-line -- fallback for UI5 versions below 1.118
			const messages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
			if (messages.length > 0) {
				this.odataMessageHandler.displayMessages(messages);
			}
		}
	}
	
	getView(context: any): any {
        return context._view || context.oView || context.getView();
    }

	public get tables(): any[] {
		return this._tables;
	}
	public set tables(value: any[]) {
		this._tables = value;
	}

	abstract create(model: any, binding: any, payload: any): any;
	abstract createAsync(model: any, binding: any, payload: any): any;
	abstract updateAsync(model: any, binding: any, payload: any): any;
	abstract submitChanges(model: any): Promise<any>;
	abstract waitForCreation(): Promise<any>;
	abstract waitForDraft(): void;
	abstract resetContexts(): void;
	abstract getMetadataHandler(): MetadataHandlerV2 | MetadataHandlerV4;
	abstract getLabelList(columns: Columns, odataType: string, excludeColumns: Columns, binding?: any): Promise<ListObject>;
	abstract getKeyList(odataType: string, tableObject: any): Promise<string[]>;
	abstract getOdataType(binding: any, odataType: any): string;
	abstract checkForErrors(model: any, binding: any, showBackendErrorMessages: Boolean): Promise<boolean>;
	abstract createCustomBinding(binding: any): any;
	abstract getODataEntitiesRecursive(entityName: string, deepLevel: number): any;
	abstract getBindingFromBinding(binding: any, expand?: any): ODataListBindingV4 | ODataListBindingV2;
	abstract fetchBatch(customBinding: ODataListBindingV4 | ODataListBindingV2, batchSize: number): Promise<any>;
	abstract addKeys(labelList: ListObject, entityName: string, parentEntity?: any, partner?: string): void;
	abstract getObjects(model: any, binding: any, batch: any): Promise<any>;
	// Pro Methods
}
