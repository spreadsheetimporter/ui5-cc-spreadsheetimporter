import { Columns } from "../../types";
import OData from "./OData";

export default class ODataV4 extends OData {
	public createPromises: Promise<any>[] = [];
	public createContexts: any[] = [];

	constructor(ui5version: number) {
		super(ui5version);
	}

	create(model: any, binding: any, payload: any) {
		const context = binding.create(payload);
		return {
			context: context,
			promise: context.created(),
		};
	}

	createAsync(model: any, binding: any, payload: any) {
		const returnObject = this.create(model, binding, payload);
		this.createContexts.push(returnObject.context);
		this.createPromises.push(returnObject.promise);
	}

	async waitForCreation(model: any): Promise<any[]> {
		await model.submitBatch(model.getUpdateGroupId());
		return Promise.all(this.createPromises);
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
		return context._view;
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

	resetContexts() {
		this.createContexts = [];
		this.createPromises = [];
	}
}
