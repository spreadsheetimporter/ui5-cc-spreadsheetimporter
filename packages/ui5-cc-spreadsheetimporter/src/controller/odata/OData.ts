import ManagedObject from "sap/ui/base/ManagedObject";
import DraftController from "sap/ui/generic/app/transaction/DraftController";
import { Columns, ListObject, Property } from "../../types";
import ODataMessageHandler from "../dialog/ODataMessageHandler";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Log from "sap/base/Log";
import MetadataHandlerV2 from "./MetadataHandlerV2";
import MetadataHandlerV4 from "./MetadataHandlerV4";
import TableSelector from "../TableSelector";
import JSONModel from "sap/ui/model/json/JSONModel";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default abstract class OData extends ManagedObject {
	UI5MinorVersion: number;
	draftController: DraftController;
	odataMessageHandler: ODataMessageHandler;
	private _tables: any[] = [];
	busyDialog: Dialog;
	spreadsheetUploadController: SpreadsheetUpload;

	constructor(ui5version: number, spreadsheetUploadController: SpreadsheetUpload) {
		super();
		this.UI5MinorVersion = ui5version;
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

		// intializing the message manager for displaying the odata response messages
		try {
			// get binding of table to create rows
			const model = tableObject.getModel();

			await this.createBusyDialog(spreadsheetUploadController);

			// Slice the array into chunks of 'batchSize' if necessary
			const slicedPayloadArray = this.processPayloadArray(component.getBatchSize(), payloadArray);
			(this.busyDialog.getModel("busyModel") as JSONModel).setProperty("/progressText", `0/${payloadArray.length}`);
			let currentProgressPercent = 0;
			let currentProgressValue = 0;

			// Loop over the sliced array
			for (const batch of slicedPayloadArray) {
				// loop over data from spreadsheet file
				for (const payload of batch) {
					// Extension method to manipulate payload
					component.fireChangeBeforeCreate({ payload: payload });
					this.createAsync(model, binding, payload);
				}
				// wait for all drafts to be created
				await this.submitChanges(model);
				let errorsFound = await this.checkForErrors(model, binding, component.getShowBackendErrorMessages());
				if (errorsFound) {
					this.busyDialog.close();
					break;
				} else {
					await this.waitForCreation();
				}

				// check for and activate all drafts and wait for all draft to be created
				if (component.getActivateDraft() && !errorsFound) {
					await this.waitForDraft();
				}

				this.resetContexts();
				currentProgressPercent = currentProgressPercent + (batch.length / payloadArray.length) * 100;
				currentProgressValue = currentProgressValue + batch.length;
				(this.busyDialog.getModel("busyModel") as JSONModel).setProperty("/progressPercent", currentProgressPercent);
				(this.busyDialog.getModel("busyModel") as JSONModel).setProperty("/progressText", `${currentProgressValue} / ${payloadArray.length}`);
			}
			spreadsheetUploadController.refreshBinding(context, binding, tableObject.getId());
			this.busyDialog.close();
			fnResolve();
		} catch (error) {
			this.busyDialog.close();
			this.resetContexts();
			Log.error("Error while calling the odata service", error as Error, "SpreadsheetUpload: callOdata");
			fnReject(error);
		}
	}

	public getBinding(tableObject: any): any {
		if (tableObject.getMetadata().getName() === "sap.m.Table" || tableObject.getMetadata().getName() === "sap.m.List") {
			return tableObject.getBinding("items");
		}
		if (tableObject.getMetadata().getName() === "sap.ui.table.Table") {
			return tableObject.getBinding("rows");
		}
	}

	public _getActionName(oContext: any, sOperation: string) {
		var oModel = oContext.getModel(),
			oMetaModel = oModel.getMetaModel(),
			sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
		return oMetaModel.getObject("".concat(sEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot/").concat(sOperation));
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
					throw new Error(spreadsheetUploadController.util.geti18nText("tableSelectorDialogCancel"));
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

	public get tables(): any[] {
		return this._tables;
	}
	public set tables(value: any[]) {
		this._tables = value;
	}

	abstract create(model: any, binding: any, payload: any): any;
	abstract createAsync(model: any, binding: any, payload: any): any;
	abstract submitChanges(model: any): Promise<any>;
	abstract waitForCreation(): Promise<any>;
	abstract waitForDraft(): void;
	abstract resetContexts(): void;
	abstract getView(context: any): any;
	abstract getMetadataHandler(): MetadataHandlerV2 | MetadataHandlerV4;
	abstract getLabelList(columns: Columns, odataType: string, tableObject?: any): Promise<ListObject>;
	abstract getKeyList(odataType: string, tableObject: any): Promise<string[]>;
	abstract getOdataType(binding: any, tableObject: any, odataType: any): string;
	abstract checkForErrors(model: any, binding: any, showBackendErrorMessages: Boolean): Promise<boolean>;
	abstract createCustomBinding(binding: any): any;

	// Pro Methods
}
