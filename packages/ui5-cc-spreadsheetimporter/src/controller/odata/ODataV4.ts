import { Columns } from "../../types";
import OData from "./OData";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Util from "../Util";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import Log from "sap/base/Log";
import MetadataHandlerV4 from "./MetadataHandlerV4";

type EntityObject = {
	$kind: string;
	$Type?: string;
	$NavigationPropertyBinding?: Record<string, string>;
};

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class ODataV4 extends OData {
	public createPromises: Promise<any>[] = [];
	public createContexts: any[] = [];
	customBinding: ODataListBinding;
	updateGroupId: string;
	public metadataHandler: MetadataHandlerV4;

	constructor(ui5version: number, spreadsheetUploadController: SpreadsheetUpload) {
		super(ui5version, spreadsheetUploadController);
		this.updateGroupId = Util.getRandomString(10);
		this.metadataHandler = new MetadataHandlerV4(spreadsheetUploadController);
	}

	create(model: any, binding: any, payload: any) {
		const context = this.customBinding.create(payload, true);
		return {
			context: context,
			promise: context.created()
		};
	}

	createAsync(model: any, binding: any, payload: any) {
		const returnObject = this.create(model, this.customBinding, payload);
		this.createContexts.push(returnObject.context);
		this.createPromises.push(returnObject.promise);
	}

	async submitChanges(model: any): Promise<any> {
		return model.submitBatch(this.updateGroupId);
	}

	async waitForCreation(): Promise<any> {
		await Promise.all(this.createPromises);
	}

	async checkForErrors(model: any, binding: any, showBackendErrorMessages: Boolean): Promise<boolean> {
		// if the binding has pending changes, a error occured
		if (this.customBinding.hasPendingChanges()) {
			// delete all the created context
			this.createContexts.forEach(async (context) => {
				await context.delete(this.updateGroupId);
			});
			// show messages from the Messages Manager Model
			if (showBackendErrorMessages) {
				this.odataMessageHandler.displayMessages();
			}
			return true;
		}
		return false;
	}

	createCustomBinding(binding: any) {
		if (this.spreadsheetUploadController.component.getOdataType()) {
			const containerName = this.spreadsheetUploadController.context.getModel().getMetaModel().getData()["$EntityContainer"];
			const entityContainer = this.spreadsheetUploadController.context.getModel().getMetaModel().getData()[containerName];
			const typeToSearch = this.spreadsheetUploadController.component.getOdataType();
			const odataEntityTypeParameterPath = this._findAttributeByType(entityContainer, typeToSearch);
			this.customBinding = this.spreadsheetUploadController.view
				.getModel()
				.bindList("/" + odataEntityTypeParameterPath, null, [], [], { $$updateGroupId: this.updateGroupId }) as ODataListBinding;
		} else {
			let path = binding.getPath();
			if (binding.getResolvedPath) {
				path = binding.getResolvedPath();
			} else {
				// workaround for getResolvedPath only available from 1.88
				path = binding.getModel().resolve(binding.getPath(), binding.getContext());
			}
			this.customBinding = binding.getModel().bindList(path, null, [], [], { $$updateGroupId: this.updateGroupId });
		}
	}

	async waitForDraft(): Promise<any[]> {
		const activateActionsPromises = [];
		for (let index = 0; index < this.createContexts.length; index++) {
			const element = this.createContexts[index];
			const operationName = this._getActionName(element, "ActivationAction");
			if (operationName) {
				const operation = element.getModel().bindContext(`${operationName}(...)`, element, { $$inheritExpandSelect: true });
				activateActionsPromises.push(operation.execute("$auto", false, null, /*bReplaceWithRVC*/ true));
			}
		}
		return Promise.all(activateActionsPromises);
	}

	getView(context: any) {
		return context._view || context.oView || context.getView();
	}

	getOdataType(binding: any, tableObject: any, odataType: any) {
		const tableBindingPath = binding.getPath();
		const metaModel = tableObject.getModel().getMetaModel();
		const metaModelData = tableObject.getModel().getMetaModel().getData() as any;
		if (!odataType) {
			// for list report
			try {
				const metaDataObject = metaModel.getObject(tableBindingPath);
				return metaDataObject["$Type"];
			} catch (error) {
				Log.debug("Error while getting OData Type for List Report", error as Error, "SpreadsheetUpload: ODataV4");
			}
			// for object page
			if (!odataType) {
				for (const [key, value] of Object.entries(metaModelData)) {
					if ((value as any)["$kind"] === "EntityType" && (value as any)[tableBindingPath]) {
						return (value as any)[tableBindingPath]["$Type"];
					}
				}
			}
			if (!odataType) {
				Log.error("Error while getting OData Type. Please specify 'odataType' in options", undefined, "SpreadsheetUpload: ODataV4");
			}
		} else {
			const containerName = this.spreadsheetUploadController.context.getModel().getMetaModel().getData()["$EntityContainer"];
			const entityContainer = this.spreadsheetUploadController.context.getModel().getMetaModel().getData()[containerName];
			const odataEntityType = this._findAttributeByType(entityContainer, odataType);
			if (!odataEntityType) {
				// filter out $kind
				const availableEntities = Object.keys(entityContainer)
					.filter((entity) => entity !== "$kind")
					.join();
				Log.error(`Error while getting specified OData Type. ${availableEntities}`, undefined, "SpreadsheetUpload: ODataV4");
				throw new Error(`Error while getting specified OData Type. Available Entities: ${availableEntities}`);
			}
			return odataType;
		}
	}

	async getLabelList(columns: Columns, odataType: string) {
		return this.getMetadataHandler().getLabelList(columns, odataType);
	}

	async getKeyList(odataType: string, tableObject: any) {
		return this.getMetadataHandler().getKeyList(odataType);
	}

	resetContexts() {
		this.createContexts = [];
		this.createPromises = [];
	}

	getMetadataHandler(): MetadataHandlerV4 {
		return this.metadataHandler;
	}

	_findAttributeByType(obj: Record<string, EntityObject>, typeToSearch: string): string | undefined {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const entity = obj[key];
				if (entity.$Type === typeToSearch) {
					return key;
				}
			}
		}
		return undefined; // if not found
	}
}
