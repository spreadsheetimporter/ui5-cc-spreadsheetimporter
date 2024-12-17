import { Columns, ListObject, UpdateConfig } from "../../types";
import OData from "./OData";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Util from "../Util";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import Log from "sap/base/Log";
import MetadataHandlerV4 from "./MetadataHandlerV4";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Context from "sap/ui/model/odata/v4/Context";
import MessageHandler from "../MessageHandler";
import { CustomMessageTypes, MessageType } from "../../enums";

type EntityObject = {
	$kind: string;
	$Type?: string;
	$NavigationPropertyBinding?: Record<string, string>;
};
interface ContextCreationResult {
    context: ODataContextBinding;
    path: string;
    keyPredicates: string;
    keys: string[];
}

interface BatchContext {
    context: Context;
    path: string;
    keyPredicates: string;
    keys: string[];
    payload: any;
}

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class ODataV4 extends OData {
	customBinding: ODataListBinding;
	updateGroupId: string;
	public metadataHandler: MetadataHandlerV4;
	private objects: any[];
	private contexts: BatchContext[];
	constructor(spreadsheetUploadController: SpreadsheetUpload, messageHandler: MessageHandler, util: Util) {
		super(spreadsheetUploadController, messageHandler, util);
		this.updateGroupId = Util.getRandomString(10);
		this.metadataHandler = new MetadataHandlerV4(spreadsheetUploadController);
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
		// TODO: maybe this should default and only way to update
		const keys = this.getKeys(binding, payload);

		// Now use the keys to find the matching context
		const currentContext = this.contexts.find((ctx) => Object.entries(keys).every(([key, value]) => ctx.payload[key] === value)) as BatchContext;

		if (!currentContext.context) {
			if (false) {
				// in which context should we continue?
				throw new Error("Could not find matching context for update operation");
			} else {
				// TODO: continue with successfull fetched objects
				return;
			}
		}
		let { context } = currentContext;

		const currentObject = context.getObject();

		// Determine if the current object is a draft or active entity
		const isDraft = currentObject.HasDraftEntity || !currentObject.IsActiveEntity;

		if (isDraft) {
			// Switch to the draft entity by creating a new context with IsActiveEntity=false
			payload.IsActiveEntity = false;
			const draftKeyPredicates = ODataV4.formatKeyPredicates(keys, payload);
			const path = ODataV4.getResolvedPath(binding);
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
			// Only update if value has changed
			if (fullUpdate || currentObject[property] !== newValue) {
				this.createPromises.push(
					context.setProperty(
						property,
						typeof newValue === "object" ? `${newValue.getUTCFullYear()}-${("0" + (newValue.getUTCMonth() + 1)).slice(-2)}-${("0" + newValue.getUTCDate()).slice(-2)}` : newValue
					)
				);
			}
		});
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
			let path = ODataV4.getResolvedPath(binding);
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
		const expandParameter = expand ? expand : "";
		let path = binding.getPath();
		if (binding.getResolvedPath) {
			path = binding.getResolvedPath();
		} else {
			// workaround for getResolvedPath only available from 1.88
			path = (binding.getModel() as ODataModel).resolve(binding.getPath(), binding.getContext());
		}
		return binding.getModel().bindList(path, null, [], [], { $$updateGroupId: this.updateGroupId, $count: true }) as ODataListBinding;
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
		// TODO: check if IsActiveEntity is available, add it to the payload?
		let path = ODataV4.getResolvedPath(binding);

		// Create filters for each object in the batch
		const batchFilters = batch.map((payload) => {
			// Get keys but exclude IsActiveEntity as we'll add it separately
			const keys = this.getKeys(binding, payload, undefined, true);
			const filterConditions = Object.entries(keys).map(([property, value]) => 
				new Filter(property, FilterOperator.EQ, value)
			);
			
			// Always add IsActiveEntity=true filter
			filterConditions.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));

			return new Filter({
				filters: filterConditions,
				and: true // Combine conditions for each key
			});
		});

		// Combine all batch filters with OR
		const combinedFilter = new Filter({
			filters: batchFilters,
			and: false // OR condition between different objects
		});

		// Bind the list with the filter
		const listBinding = model.bindList(path, null, [], [], { $$updateGroupId: "$auto" }) as ODataListBinding;
		listBinding.filter(combinedFilter);

		// Request contexts (fetch all data matching the filters)
		const contexts = await listBinding.requestContexts(0, batch.length);

		// Store contexts with their corresponding paths and payloads
		batch.forEach((payload, index) => {
			const keys = this.getKeys(binding, payload);
			this.contexts.push({
				context: contexts[index],
				path,
				keyPredicates: ODataV4.formatKeyPredicates(keys, payload),
				keys: Object.keys(keys),
				payload
			});
		});

		// Map contexts to objects
		const objects = await Promise.all(contexts.map((context) => context.getObject()));

		let errorFound = false;

		// Find which objects from batch weren't found
		batch.forEach((batchItem, index) => {
			const keys = this.getKeys(binding, batchItem);
			const keysWithoutIsActiveEntity = { ...keys };
			delete keysWithoutIsActiveEntity.IsActiveEntity;

			const foundObject = objects.find((obj) => 
				Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value)
			);

			if (!foundObject) {
				errorFound = true;
				this.messageHandler.addMessageToMessages({
					title: this.util.geti18nText("spreadsheetimporter.objectNotFound"),
					row: index + 1,
					type: CustomMessageTypes.ObjectNotFound,
					counter: 1,
					formattedValue: Object.entries(keys)
						.map(([key, value]) => `${key}=${value}`)
						.join(", "),
					ui5type: MessageType.Error
				});
				return;
			}

			// Check for valid draft states
			if (foundObject.IsActiveEntity && !foundObject.HasDraftEntity && !batchItem.IsActiveEntity) {
				// Active entity without draft - must import as active
				this._addDraftMismatchError(index, keys, "Draft", "Active");
				errorFound = true;
			} else if (foundObject.IsActiveEntity && foundObject.HasDraftEntity && batchItem.IsActiveEntity) {
				// Active entity with draft - must import as draft
				this._addDraftMismatchError(index, keys, "Active", "Draft");
				errorFound = true;
			} else if (!foundObject.IsActiveEntity && batchItem.IsActiveEntity) {
				// Draft entity - must import as draft
				this._addDraftMismatchError(index, keys, "Active", "Draft");
				errorFound = true;
			}
		});

		if (errorFound) {
			if (this.messageHandler.areMessagesPresent()) {
				try {
					// Wait for user decision
					await this.messageHandler.displayMessages();
					// If we get here, user clicked continue
					return objects;
				} catch (error) {
					// User clicked close
					throw new Error("Operation cancelled by user");
				}
			}
		}

		return objects;
	}

	// Helper method to add draft mismatch error
	private _addDraftMismatchError(index: number, keys: Record<string, any>, uploadedState: string, expectedState: string): void {
		this.messageHandler.addMessageToMessages({
			title: this.util.geti18nText("spreadsheetimporter.draftEntityMismatch"),
			row: index + 1,
			type: CustomMessageTypes.DraftEntityMismatch,
			counter: 1,
			ui5type: MessageType.Error,
			formattedValue: [
				Object.entries(keys)
					.map(([key, value]) => `${key}=${value}`)
					.join(", "),
				uploadedState,
				expectedState
			]
		});
	}

	// move to metadata handler
	getKeys(binding: any, payload: any, IsActiveEntity?: boolean, excludeIsActiveEntity: boolean = false): Record<string, any> {
		// Get the resolved path
		let path = ODataV4.getResolvedPath(binding);

		// Get the key properties for this entity type
		const keyNames = MetadataHandlerV4.getAnnotationProperties(this.spreadsheetUploadController.context, this.spreadsheetUploadController.getOdataType()).properties.$Key as string[];

		// Create a map of key names to their values from the payload
		const keyMap: Record<string, any> = {};
		keyNames.forEach((key) => {
			if (excludeIsActiveEntity && key === "IsActiveEntity") {
				return;
			}
			if (key === "IsActiveEntity") {
				// If IsActiveEntity is explicitly provided as a parameter, use it
				// Otherwise, use the value from the payload
				keyMap[key] = IsActiveEntity !== undefined ? IsActiveEntity : payload[key];
			} else {
				keyMap[key] = payload[key];
			}
		});

		return keyMap;
	}

	static formatKeyPredicates(keys: Record<string, any>, payload: Record<string, any>): string {
		// If IsActiveEntity is a key but not in payload, add it with true value as ODataV4 is not able to create draft entities
		if ("IsActiveEntity" in keys && !("IsActiveEntity" in payload)) {
			payload = { ...payload, IsActiveEntity: true };
		}

		return Object.entries(keys)
			.map(([key, _]) => {
				// Check if the key exists in our payload
				if (!(key in payload)) {
					throw new Error(`Required key property '${key}' not found in payload`);
				}
				// Format the value based on its type:
				// - Strings need to be wrapped in quotes: ID='123'
				// - Other types (like boolean, number) don't: IsActiveEntity=true
				const value = payload[key];
				const formattedValue = typeof value === "string" ? `'${value}'` : value;

				// Combine key and value: "key=value"
				return `${key}=${formattedValue}`;
			})
			.join(","); // Join all key-value pairs with commas
	}

	static getResolvedPath(binding: any): string {
		let path = binding.getPath();
		if (binding.getResolvedPath) {
			path = binding.getResolvedPath();
		} else {
			// workaround for getResolvedPath only available from 1.88
			path = binding.getModel().resolve(binding.getPath(), binding.getContext());
		}
		return path;
	}
}
