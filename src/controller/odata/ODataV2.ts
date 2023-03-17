import OData from "./OData";

export default class ODataV2 extends OData {
	public createPromises: Promise<any>[] = [];
	public createContexts: any[] = [];

	constructor(ui5version: number) {
		super(ui5version);
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

	async waitForCreation(model: any) {
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
			const oData = await submitChangesPromise(model);
			console.log(oData);
			// handle success
		} catch (oError) {
			// handle error
		}
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
					console.debug("Activate Draft failed");
				}
			}
		}
		return Promise.all(activateActionsPromises);
	}
}
