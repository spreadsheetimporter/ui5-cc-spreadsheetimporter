import { Columns, ListObject, UpdateConfig } from "../../types";
import OData from "./OData";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Util from "../Util";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import Log from "sap/base/Log";
import MetadataHandlerV4 from "./MetadataHandlerV4";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import MessageHandler from "../MessageHandler";
import { ODataV4RequestObjects, BatchContext } from './ODataV4RequestObjects';

type EntityObject = {
	$kind: string;
	$Type?: string;
	$NavigationPropertyBinding?: Record<string, string>;
};

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class ODataV4 extends OData {
	customBinding: ODataListBinding;
	updateGroupId: string;
	public metadataHandler: MetadataHandlerV4;
	private contexts: BatchContext[];
	private objectRetriever: ODataV4RequestObjects;
	constructor(spreadsheetUploadController: SpreadsheetUpload, messageHandler: MessageHandler, util: Util) {
		super(spreadsheetUploadController, messageHandler, util);
		this.updateGroupId = Util.getRandomString(10);
		this.metadataHandler = new MetadataHandlerV4(spreadsheetUploadController);
		this.objectRetriever = new ODataV4RequestObjects(this.metadataHandler, messageHandler, util);
		this.contexts = [];
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

	updateAsync(model: any, binding: any, payload: any) {
		// also do this if we should check for draft entities, this should be default in draft scenarios
		const keys = this.metadataHandler.getKeys(binding, payload);
		Log.debug("Processing update operation", undefined, "SpreadsheetUpload: ODataV4", () => ({
			keys,
			payload,
			bindingPath: binding.getPath()
		}));

		// Now use the keys to find the matching context
		const currentContext = this.contexts.find((ctx) => Object.entries(keys).every(([key, value]) => ctx.payload[key] === value)) as BatchContext;
		Log.debug("Found matching context", undefined, "SpreadsheetUpload: ODataV4", () => ({
			found: !!currentContext,
			contextDetails: currentContext
		}));

		if (!currentContext.context) {
			if (!this.spreadsheetUploadController.component.getContinueOnError()) {
				// in which context should we continue?
				throw new Error("Could not find matching context for update operation");
			} else {
				Log.debug("No context found for update operation", undefined, "SpreadsheetUpload: ODataV4", () => ({
					keys,
					availableContexts: this.contexts.length
				}));
				return;
			}
		}
		let { context } = currentContext;

		const currentObject = context.getObject();
		Log.debug("Current object state", undefined, "SpreadsheetUpload: ODataV4", () => ({
			currentObject,
			isDraft: currentObject.HasDraftEntity || !currentObject.IsActiveEntity
		}));

		// Determine if the current object is a draft or active entity
		const isDraft = currentObject.HasDraftEntity || !currentObject.IsActiveEntity;

		if (isDraft) {
			// Switch to the draft entity by creating a new context with IsActiveEntity=false
			payload.IsActiveEntity = false;
			const draftKeyPredicates = MetadataHandlerV4.formatKeyPredicates(keys, payload);
			const path = MetadataHandlerV4.getResolvedPath(binding);
			Log.debug("Switching to draft entity", undefined, "SpreadsheetUpload: ODataV4", () => ({
				draftKeyPredicates,
				path,
				groupId: this.updateGroupId
			}));
			const oDataContextBinding = binding.getModel().bindContext(`${path}(${draftKeyPredicates})`, undefined, { $$groupId: this.updateGroupId }) as ODataContextBinding;
			context = oDataContextBinding.getBoundContext();
		}

		// Process all properties from payload except keys
		Object.entries(payload).forEach(([property, newValue]) => {
			// Skip if property is a key
			if (property in keys) {
				return;
			}
			// decide if the full import payload should be sent or only the changed properties
			const fullUpdate = (this.spreadsheetUploadController.component.getUpdateConfig() as UpdateConfig).fullUpdate;
			// only columns defined in the updateConfig should be updated
			const columns = (this.spreadsheetUploadController.component.getUpdateConfig() as UpdateConfig).columns;

			// Helper function to check if value is a date and if it has changed
			const hasDateValueChanged = (oldValue: any, newValue: any): boolean => {
				if (!newValue?.toISOString) return true; // not a date, continue with normal comparison
				const formattedNewDate = newValue.toISOString().substr(0,10);
				return oldValue !== formattedNewDate;
			};

			// Check if property should be updated
			const isPropertyConfigured = columns.length === 0 || columns.includes(property);
			const hasValueChanged = currentObject[property] !== newValue;
			const isDateChangeValid = hasDateValueChanged(currentObject[property], newValue);

			if (fullUpdate || (hasValueChanged && isPropertyConfigured && isDateChangeValid)) {
				Log.debug("Updating property", undefined, "SpreadsheetUpload: ODataV4", () => ({
					property,
					oldValue: currentObject[property],
					newValue,
					isDate: !!newValue?.toISOString,
					updateReason: fullUpdate ? 'fullUpdate' : 'valueChanged'
				}));

				this.createPromises.push(
					context.setProperty(
						property,
						typeof newValue === "object" ? `${newValue.getUTCFullYear()}-${("0" + (newValue.getUTCMonth() + 1)).slice(-2)}-${("0" + newValue.getUTCDate()).slice(-2)}` : newValue
					)
				);
			}
		});

		Log.debug("Update operation completed", undefined, "SpreadsheetUpload: ODataV4", () => ({
			pendingPromises: this.createPromises.length,
			isDraft,
			context: context.getPath()
		}));
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
			const entityContainer = ODataV4.getContainerName(this.spreadsheetUploadController.context);
			const typeToSearch = this.spreadsheetUploadController.component.getOdataType();
			const odataEntityTypeParameterPath = this._findAttributeByType(entityContainer, typeToSearch);
			this.customBinding = this.spreadsheetUploadController.view
				.getModel()
				.bindList("/" + odataEntityTypeParameterPath, null, [], [], { $$updateGroupId: this.updateGroupId }) as ODataListBinding;
		} else {
			let path = MetadataHandlerV4.getResolvedPath(binding);
			this.customBinding = binding.getModel().bindList(path, this.contexts, [], [], { $$updateGroupId: this.updateGroupId });
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

	getOdataType(binding: any, odataType: any) {
		const tableBindingPath = binding.getPath();
		const metaModel = binding.getModel().getMetaModel();
		const metaModelData = binding.getModel().getMetaModel().getData() as any;
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
			const entityContainer = ODataV4.getContainerName(this.spreadsheetUploadController.context);
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

	async getLabelList(columns: Columns, odataType: string, excludeColumns: Columns) {
		return this.getMetadataHandler().getLabelList(columns, odataType, excludeColumns);
	}

	async getKeyList(odataType: string, binding: any) {
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

	static getContainerName(context: any) {
		const model = (context?.getModel && context.getModel()) || context.getView().getModel();
		const entityContainer = model.getMetaModel().getData()["$EntityContainer"];
		const containerName = model.getMetaModel().getData()[entityContainer];
		return containerName;
	}

	getODataEntitiesRecursive(entityName: string, lowestLevel: number) {
		return this.metadataHandler.getODataEntitiesRecursive(entityName, lowestLevel);
	}

	getBindingFromBinding(binding: ODataListBinding, expand?: any): ODataListBinding {
		let path = binding.getPath();
		if (binding.getResolvedPath) {
			path = binding.getResolvedPath();
		} else {
			// workaround for getResolvedPath only available from 1.88
			path = (binding.getModel() as ODataModel).resolve(binding.getPath(), binding.getContext());
		}

		const bindingParameters: any = {
			$$updateGroupId: this.updateGroupId,
			$count: true
		};

		// Only add $expand if it exists and is not empty
		if (expand && Object.keys(expand).length > 0) {
			bindingParameters.$expand = expand;
		}

		return binding.getModel().bindList(path, null, [], [], bindingParameters) as ODataListBinding;
	}

	fetchBatch(customBinding: ODataListBinding, batchSize: number): Promise<any> {
		let totalResults = [] as any[]; // is an array of sap.ui.model.odata.v4.Context
		let fetchedResults = 0;
		// TODO: check if this is correct
		let count = Infinity;

		return new Promise((resolve, reject) => {
			const recursiveFetch = () => {
				if (fetchedResults >= count) {
					resolve(totalResults);
					return;
				}

				customBinding
					.requestContexts(fetchedResults, batchSize)
					.then(async (results) => {
						totalResults.push(...results);
						fetchedResults += results.length;

						// Using await inside an async function callback
						count = await customBinding.getHeaderContext().requestProperty("$count");

						console.log(`Fetched ${fetchedResults}/${count} results`);

						// Recursively call
						recursiveFetch();
					})
					.catch((error) => {
						console.error(`Error fetching results: ${error}`);
						reject(error);
					});
			};

			recursiveFetch();
		});
	}

	addKeys(labelList: ListObject, entityName: string, parentEntity?: any, partner?: string) {
		this.metadataHandler.addKeys(labelList, entityName, parentEntity, partner);
	}

	async getObjects(model: any, binding: any, batch: any): Promise<any[]> {
		try {
			const objects = await this.objectRetriever.getObjects(model, binding, batch);
			this.contexts = this.objectRetriever.getContexts();
			return objects;
		} catch (error) {
			Log.error("Error while fetching objects", error as Error, "SpreadsheetUpload: ODataV4");
			throw new Error(`Error while fetching objects: ${(error as Error).message}\nStack trace: ${(error as Error).stack}`);
		}
	}
}
