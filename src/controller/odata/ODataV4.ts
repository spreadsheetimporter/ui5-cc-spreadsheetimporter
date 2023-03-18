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

	resetContexts(){
		this.createContexts = []
		this.createPromises = []
	}
}
