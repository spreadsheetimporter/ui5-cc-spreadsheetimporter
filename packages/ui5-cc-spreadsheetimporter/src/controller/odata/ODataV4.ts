import { Columns, ListObject } from "../../types";
import OData from "./OData";
import SpreadsheetUpload from "../SpreadsheetUpload";
import Util from "../Util";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import Log from "sap/base/Log";
import MetadataHandlerV4 from "./MetadataHandlerV4";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";

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

	constructor(spreadsheetUploadController: SpreadsheetUpload) {
		super(spreadsheetUploadController);
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

	async updateAsync(model: any, binding: any, payload: any) {
		let path = binding.getPath();
		if (binding.getResolvedPath) {
			path = binding.getResolvedPath();
		} else {
			// workaround for getResolvedPath only available from 1.88
			path = binding.getModel().resolve(binding.getPath(), binding.getContext());
		}
		
		// Get the key properties for this entity type
		const keys = MetadataHandlerV4.getAnnotationProperties(
			this.spreadsheetUploadController.context,
			this.spreadsheetUploadController.getOdataType()
		).properties.$Key as string[];

		// Build the key predicates for the context binding (e.g., "ID='123',IsActiveEntity=true")
		let keyPredicates = ODataV4.formatKeyPredicates(keys, payload);

		// Create context with dynamic key predicates
		let context = binding.getModel().bindContext(
				`${path}(${keyPredicates})`
			) as ODataContextBinding;

		const getOnlyUpdateChangedProperties = this.spreadsheetUploadController.component.getOnlyUpdateChangedProperties();

		if (getOnlyUpdateChangedProperties) {
			// get current state of the object
			await context.requestObject();
			const currentObject = context.getBoundContext().getObject();
			// Determine if the current object is a draft
			let isDraft = currentObject.HasDraftEntity || !currentObject.IsActiveEntity;
			payload.IsActiveEntity = !isDraft;
			// update the key predicates
			keyPredicates = ODataV4.formatKeyPredicates(keys, payload);
			// create a new context with the updated key predicates
			context = binding.getModel().bindContext(
				`${path}(${keyPredicates})`
			) as ODataContextBinding;
			this.createContexts.push(context);
			// Process all properties from payload except keys
			Object.entries(payload).forEach(([property, newValue]) => {
				// Skip if property is a key
				if (keys.includes(property)) {
					return;
				}
				// decide if the full import payload should be sent or only the changed properties
				const fullUpdate = true // this.getFullUpdate()
				// Only update if value has changed
				if (fullUpdate || currentObject[property] !== newValue) {
					this.createPromises.push(
						context.getBoundContext().setProperty(property, 
							typeof newValue === 'object' ? `${newValue.getUTCFullYear()}-${("0" + (newValue.getUTCMonth() + 1)).slice(-2)}-${("0" + newValue.getUTCDate()).slice(-2)}` : newValue
						)
					);
				}
			});
		} else {
			this.createContexts.push(context);
			// Update all non-key properties without checking changes
			Object.entries(payload).forEach(([property, newValue]) => {
				if (!keys.includes(property)) {
					this.createPromises.push(
						context.getBoundContext().setProperty(property, 
							typeof newValue === 'object' ? `${newValue.getUTCFullYear()}-${("0" + (newValue.getUTCMonth() + 1)).slice(-2)}-${("0" + newValue.getUTCDate()).slice(-2)}` : newValue
						)
					);
				}
			});
		}
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
			const entityContainer = ODataV4.getContainerName(this.spreadsheetUploadController.context)
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
			const entityContainer = ODataV4.getContainerName(this.spreadsheetUploadController.context)
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
		return binding.getModel().bindList(path, null, [], [], { $$updateGroupId: this.updateGroupId, $count: true, $expand: expand }) as ODataListBinding;
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

	static formatKeyPredicates(keys: string[], payload: Record<string, any>): string {
		return keys.map(key => {
			// Check if the key exists in our payload
			if (!(key in payload)) {
				throw new Error(`Required key property '${key}' not found in payload`);
			}
			// Format the value based on its type:
			// - Strings need to be wrapped in quotes: ID='123'
			// - Other types (like boolean, number) don't: IsActiveEntity=true
			const value = payload[key];
			const formattedValue = typeof value === 'string' 
				? `'${value}'` 
				: value;

			// Combine key and value: "key=value"
			return `${key}=${formattedValue}`;
		}).join(',');  // Join all key-value pairs with commas
	}
}
