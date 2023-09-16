import Log from "sap/base/Log";
import { Columns } from "../../types";
import SpreadsheetUpload from "../SpreadsheetUpload";
import OData from "./OData";
import MetadataHandlerV2 from "./MetadataHandlerV2";
import ODataListBinding from "sap/ui/model/odata/v2/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ODataMetaModel from "sap/ui/model/odata/ODataMetaModel";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class ODataV2 extends OData {
	public createPromises: Promise<any>[] = [];
	public createContexts: any[] = [];
	customBinding: ODataListBinding;
	submitChangesResponse: any;
	private metadataHandler: MetadataHandlerV2;

	constructor(ui5version: number, spreadsheetUploadController: SpreadsheetUpload) {
		super(ui5version, spreadsheetUploadController);
		this.metadataHandler = new MetadataHandlerV2(spreadsheetUploadController);
	}
	create(model: any, binding: any, payload: any) {
		const submitChangesPromise = (binding: ODataListBinding, payload: any) => {
			return new Promise((resolve, reject) => {
				// @ts-ignore
				let context = (this.customBinding.getModel() as ODataModel).createEntry(this.customBinding.sDeepPath, {
					properties: payload,
					success: () => {
						resolve(context);
					},
					error: (error: Error) => {
						reject(error);
					}
				});
			});
		};
		return submitChangesPromise(this.customBinding, payload);
	}

	createAsync(model: any, binding: any, payload: any) {
		const returnObject = this.create(model, this.customBinding, payload);
		this.createPromises.push(returnObject);
	}

	async checkForErrors(model: any, binding: any, showBackendErrorMessages: Boolean): Promise<boolean> {
		// check if this.submitChangesResponse and this.submitChangesResponse.__batchResponses exist
		if (this.submitChangesResponse && this.submitChangesResponse.__batchResponses) {
			const firstResponse = this.submitChangesResponse.__batchResponses[0];
			// check if firstResponse and firstResponse.response exist and that statusCode is >= 400
			if (firstResponse && firstResponse.response && firstResponse.response.statusCode >= 400) {
				// show messages from the Messages Manager Model
				if (showBackendErrorMessages) {
					this.odataMessageHandler.displayMessages();
				}
				return true;
			}
		}
		return false;
	}

	async createCustomBinding(binding: any) {
		if (this.spreadsheetUploadController.component.getOdataType()) {
			const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel();
			await metaModel.loaded();
			const oDataEntityType = metaModel.getODataEntityType(this.spreadsheetUploadController.component.getOdataType());
			const odataEntitySet = metaModel.getODataEntityContainer().entitySet.find((item) => item.entityType === `${oDataEntityType.namespace}.${oDataEntityType.name}`);
			this.customBinding = new ODataListBinding(this.spreadsheetUploadController.view.getModel() as ODataModel, `/${odataEntitySet.name}`);
		} else {
			this.customBinding = binding;
		}
	}

	async submitChanges(model: ODataModel) {
		const submitChangesPromise = (model: ODataModel) => {
			return new Promise((resolve, reject) => {
				model.submitChanges({
					success: (data: any) => {
						resolve(data);
					},
					error: (error: Error) => {
						reject(error);
					}
				});
			});
		};

		try {
			this.submitChangesResponse = await submitChangesPromise(model);
		} catch (error: any) {
			Log.error(error);
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
						const activationPromise = this.draftController.activateDraftEntity(element, true, undefined);
						activateActionsPromises.push(activationPromise);
					}
				} catch (error) {
					Log.error("Activate Draft failed", error as Error, "SpreadsheetUpload: OdataV2");
				}
			}
		}
		return Promise.all(activateActionsPromises);
	}

	getView(context: any) {
		return context.getView();
	}

	async getOdataType(binding: any, tableObject: any, odataType: any) {
		if (!odataType) {
			return binding._getEntityType().entityType;
		} else {
			const metaModel = this.spreadsheetUploadController.view.getModel().getMetaModel() as ODataMetaModel;
			await metaModel.loaded();
			const oDataEntityType = metaModel.getODataEntityType(odataType);
			if (!oDataEntityType) {
				// filter out $kind
				const availableEntities = metaModel
					.getODataEntityContainer()
					.entitySet.map((item) => item.name)
					.join();
				Log.error(`Error while getting specified OData Type. ${availableEntities}`, undefined, "SpreadsheetUpload: ODataV4");
				throw new Error(`Error while getting specified OData Type. Available Entities: ${availableEntities}`);
			}
			return odataType;
		}
	}

	async getLabelList(columns: Columns, odataType: string, tableObject?: any) {
		const metaModel = tableObject.getModel().getMetaModel();
		await metaModel.loaded();
		const oDataEntityType = metaModel.getODataEntityType(odataType);
		return this.getMetadataHandler().getLabelList(columns, odataType, oDataEntityType);
	}

	async getKeyList(odataType: string, tableObject: any) {
		const metaModel = tableObject.getModel().getMetaModel();
		await metaModel.loaded();
		const oDataEntityType = metaModel.getODataEntityType(odataType);
		return this.getMetadataHandler().getKeyList(oDataEntityType);
	}

	resetContexts() {
		this.createContexts = [];
		this.createPromises = [];
	}

	getMetadataHandler(): MetadataHandlerV2 {
		return this.metadataHandler;
	}
}
