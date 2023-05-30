import Event from "sap/ui/base/Event";
import { Columns } from "../../types";
import OData from "./OData";
import MetadataHandler from "../MetadataHandler";
import ExcelUpload from "../ExcelUpload";

export default class ODataV4 extends OData {
	public createPromises: Promise<any>[] = [];
	public createContexts: any[] = [];
	customBinding: any;

	constructor(ui5version: number, metaDatahandler: MetadataHandler, excelUploadController: ExcelUpload) {
		super(ui5version,metaDatahandler,excelUploadController);
	}

	create(model: any, binding: any, payload: any) {
		const context = this.customBinding.create(payload);
		return {
			context: context,
			promise: context.created(),
		};
	}

	createAsync(model: any, binding: any, payload: any) {
		const returnObject = this.create(model, this.customBinding, payload);
		this.createContexts.push(returnObject.context);
		this.createPromises.push(returnObject.promise);
	}

	async submitChanges(model: any): Promise<any> {
		return model.submitBatch("create");
	}

	async waitForCreation(): Promise<any> {
		await Promise.all(this.createPromises);
	}

	async checkForErrors(model: any, binding: any): Promise<boolean> {
		// if the binding has pending changes, a error occured
		if(this.customBinding.hasPendingChanges()){
			// delete all the created context
            this.createContexts.forEach(async context => {
              await context.delete("create");
            });
			// show messages from the Messages Manager Model
            this.odataMessageHandler.displayMessages();
			return true;
        }
		return false;
	}

	createCustomBinding(binding: any) {
		this.customBinding = binding.getModel().bindList(binding.getPath(),null,[],[],{$$updateGroupId: "create"});
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
		return context._view || context.oView;
	}

	getOdataType(binding: any, tableObject: any, odataType: any) {
		const tableBindingPath = binding.getPath();
		const metaModel = tableObject.getModel().getMetaModel();
		const metaModelData = tableObject.getModel().getMetaModel().getData();
		if (!odataType) {
			// for list report
			try {
				const metaDataObject = metaModel.getObject(tableBindingPath);
				return metaDataObject["$Type"];
			} catch (error) {
				console.debug();
			}
			// for object page
			if (!odataType) {
				for (const [key, value] of Object.entries(metaModelData)) {
					if (value["$kind"] === "EntityType" && value[tableBindingPath]) {
						return value[tableBindingPath]["$Type"];
					}
				}
			}
			if (!odataType) {
				console.error("No OData Type found. Please specify 'odataType' in options");
			}
		}
	}

	async createLabelList(columns: Columns, odataType: string) {
		return this.metaDatahandler.createLabelListV4(columns, odataType);
	}

	async getKeyList(odataType: string, tableObject: any) {
		return this.metaDatahandler.getKeyListV4(odataType);
	}

	resetContexts() {
		this.createContexts = [];
		this.createPromises = [];
	}
}
