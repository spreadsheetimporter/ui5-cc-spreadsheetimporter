import Log from "sap/base/Log";
import { Columns } from "../../types";
import ExcelUpload from "../ExcelUpload";
import MetadataHandler from "../MetadataHandler";
import OData from "./OData";

export default class ODataV2 extends OData {
	public createPromises: Promise<any>[] = [];
	public createContexts: any[] = [];
	submitChangesResponse: any;

	constructor(ui5version: number, metaDatahandler: MetadataHandler, excelUploadController: ExcelUpload) {
		super(ui5version, metaDatahandler, excelUploadController);
	}
	create(model: any, binding: any, payload: any) {
		const submitChangesPromise = (binding, payload) => {
			return new Promise((resolve, reject) => {
				let context = binding.getModel().createEntry(binding.sDeepPath, {
					properties: payload,
					success: (data) => {
						resolve(context);
					},
					error: (oError) => {
						reject(oError);
					},
				});
			});
		};
		return submitChangesPromise(binding, payload);
	}

	createAsync(model: any, binding: any, payload: any) {
		const returnObject = this.create(model, binding, payload);
		this.createPromises.push(returnObject);
	}

	async checkForErrors(model: any, binding: any, showBackendErrorMessages: Boolean): Promise<boolean> {
		// check if this.submitChangesResponse and this.submitChangesResponse.__batchResponses exist
		if (this.submitChangesResponse && this.submitChangesResponse.__batchResponses) {
			const firstResponse = this.submitChangesResponse.__batchResponses[0];
			// check if firstResponse and firstResponse.response exist and that statusCode is >= 400
			if (firstResponse && firstResponse.response && firstResponse.response.statusCode >= 400) {
				// show messages from the Messages Manager Model
				if(showBackendErrorMessages){
					this.odataMessageHandler.displayMessages();
				}
				return true;
			}
		}
		return false;
	}

	createCustomBinding(model: any) {}

	async submitChanges(model: any) {
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
			this.submitChangesResponse = await submitChangesPromise(model);
		} catch (oError) {
			Log.error(oError);
		}
	}

	async waitForCreation() {
		this.createContexts = await Promise.all(this.createPromises);
	}

	async waitForDraft(): Promise<any[]> {
		const activateActionsPromises = [];
		for (let index = 0; index < this.createContexts.length; index++) {
			const element = this.createContexts[index];
			if (this.draftController.getDraftContext().hasDraft(element)) {
				// this will fail i.e. in a Object Page Table, maybe better way to check, hasDraft is still true
				try {
					const checkImport = this.draftController.getDraftContext().getODataDraftFunctionImportName(element, "ActivationAction");
					if (checkImport !== null) {
						const activationPromise = this.draftController.activateDraftEntity(element, true);
						activateActionsPromises.push(activationPromise);
					}
				} catch (error) {
					Log.error("Activate Draft failed",error as Error,"ExcelUpload: OdataV2")
				}
			}
		}
		return Promise.all(activateActionsPromises);
	}

	getView(context: any) {
		return context.getView();
	}

	getOdataType(binding: any, tableObject: any, odataType: any) {
		if (!odataType) {
			return binding._getEntityType().entityType;
		}
	}

	async createLabelList(columns: Columns, odataType: string, tableObject: any) {
		const metaModel = tableObject.getModel().getMetaModel();
		await metaModel.loaded();
		const oDataEntityType = metaModel.getODataEntityType(odataType);
		return this.metaDatahandler.createLabelListV2(columns, odataType, oDataEntityType);
	}

	resetContexts() {
		this.createContexts = [];
		this.createPromises = [];
	}

	async getKeyList(odataType: string, tableObject: any) {
		const metaModel = tableObject.getModel().getMetaModel();
		await metaModel.loaded();
		const oDataEntityType = metaModel.getODataEntityType(odataType);
		return this.metaDatahandler.getKeyListV2(oDataEntityType);
	}
}
