import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import { CustomMessageTypes, MessageType } from "../../enums";
import MetadataHandlerV4 from "./MetadataHandlerV4";
import MessageHandler from "../MessageHandler";
import Util from "../Util";
import Log from "sap/base/Log";

export interface BatchContext {
	context: Context;
	path: string;
	keyPredicates: string;
	keys: string[];
	payload: any;
}

export class ODataV4RequestObjects {
	private metadataHandler: MetadataHandlerV4;
	private messageHandler: MessageHandler;
	private util: Util;
	private contexts: BatchContext[] = [];

	constructor(metadataHandler: MetadataHandlerV4, messageHandler: MessageHandler, util: Util) {
		this.metadataHandler = metadataHandler;
		this.messageHandler = messageHandler;
		this.util = util;
	}

	public getContexts(): BatchContext[] {
		return this.contexts;
	}

	async getObjects(model: any, binding: any, batch: any): Promise<any[]> {
		Log.debug("Processing batch from spreadsheet", undefined, "SpreadsheetUpload: ODataV4RequestObjects", () => ({
			batch,
			bindingPath: binding.getPath(),
			modelName: model.getMetadata().getName()
		}));
		let path = MetadataHandlerV4.getResolvedPath(binding);

		// Get both active and inactive contexts
		Log.debug("Fetching active entities...", undefined, "SpreadsheetUpload: ODataV4RequestObjects");
		const { contexts: contextsTrue, objects: objectsTrue } = await this._getFilteredContexts(model, binding, path, batch, true);
		Log.debug("Found active entities", undefined, "SpreadsheetUpload: ODataV4RequestObjects", () => ({
			count: objectsTrue.length,
			objects: objectsTrue
		}));

		Log.debug("Fetching inactive entities...", undefined, "SpreadsheetUpload: ODataV4RequestObjects");
		const { contexts: contextsFalse, objects: objectsFalse } = await this._getFilteredContexts(model, binding, path, batch, false);
		Log.debug("Found inactive entities", undefined, "SpreadsheetUpload: ODataV4RequestObjects", () => ({
			count: objectsFalse.length,
			objects: objectsFalse
		}));

		let objects = this.findEntitiesFromSpreadsheet(batch, objectsTrue, objectsFalse, binding);
		Log.debug("Matched entities from spreadsheet", undefined, "SpreadsheetUpload: ODataV4RequestObjects", () => ({
			count: objects.length,
			objects
		}));

		// Store contexts
		this.contexts = this.getContextsFromPayload(batch, contextsTrue, contextsFalse, path, binding);
		Log.debug("Generated contexts", undefined, "SpreadsheetUpload: ODataV4RequestObjects", () => ({
			count: this.contexts.length,
			contexts: this.contexts
		}));

		const errorFound = this.validateObjectsAndDraftStates(batch, objects, binding);
		Log.debug("Validation completed", undefined, "SpreadsheetUpload: ODataV4RequestObjects", () => ({
			errorFound,
			messageCount: this.messageHandler.messages.length
		}));

		if (errorFound) {
			if (this.messageHandler.areMessagesPresent()) {
				try {
					await this.messageHandler.displayMessages();

					// Log status changes
					const statusChanges = batch.map((payload, index) => {
						const keys = this.metadataHandler.getKeys(binding, payload);
						const keysWithoutIsActiveEntity = { ...keys };
						delete keysWithoutIsActiveEntity.IsActiveEntity;

						const originalStatus = payload.IsActiveEntity;
						const oppositeStatusObject = payload.IsActiveEntity
							? objectsFalse.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value))
							: objectsTrue.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value));

						return {
							index,
							keys: keysWithoutIsActiveEntity,
							originalStatus,
							newStatus: oppositeStatusObject?.IsActiveEntity,
							statusChanged: originalStatus !== oppositeStatusObject?.IsActiveEntity
						};
					});

					Log.debug("Status changes after user confirmation", undefined, "SpreadsheetUpload: ODataV4RequestObjects", () => ({
						total: statusChanges.length,
						changed: statusChanges.filter(c => c.statusChanged).length,
							details: statusChanges
					}));

					// Update objects with correct draft status versions
					objects = batch.map(payload => {
						const keys = this.metadataHandler.getKeys(binding, payload);
						const keysWithoutIsActiveEntity = { ...keys };
						delete keysWithoutIsActiveEntity.IsActiveEntity;

						// Find the object with opposite draft status
						const oppositeStatusObject = payload.IsActiveEntity
							? objectsFalse.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value))
							: objectsTrue.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value));

						// Update payload to match actual status
						if (oppositeStatusObject) {
							payload.IsActiveEntity = oppositeStatusObject.IsActiveEntity;
							return oppositeStatusObject;
						}
						return payload;
					});

					return objects;
				} catch (error) {
					Log.debug("Operation cancelled by user", undefined, "SpreadsheetUpload: ODataV4RequestObjects", () => ({
						error: error.message
					}));
					throw new Error("Operation cancelled by user");
				}
			}
		}

		return objects;
	}

	private async _getFilteredContexts(
		model: any,
		binding: any,
		path: string,
		batch: any[],
		isActive: boolean
	): Promise<{
		contexts: Context[];
		objects: any[];
	}> {
		// Create filters for each object in the batch
		const batchFilters = batch.map((payload) => {
			const keys = this.metadataHandler.getKeys(binding, payload);
			keys.IsActiveEntity = isActive;

			const keyFilters = Object.entries(keys).map(([property, value]) => new Filter(property, FilterOperator.EQ, value));

			return new Filter({
				filters: keyFilters,
				and: true
			});
		});

		// Combine all batch filters with OR
		const combinedFilter = new Filter({
			filters: batchFilters,
			and: false
		});

		// Bind the list with the filter
		const listBinding = model.bindList(path, null, [], [], { $$updateGroupId: "$auto" }) as ODataListBinding;
		listBinding.filter(combinedFilter);

		// Request contexts and map to objects
		const contexts = await listBinding.requestContexts(0, batch.length);
		const objects = await Promise.all(contexts.map((context) => context.getObject()));

		return { contexts, objects };
	}

	private findEntitiesFromSpreadsheet(batch: any[], objectsTrue: any[], objectsFalse: any[], binding: any): any[] {
		const matchResults = [];

		batch.forEach((payload, index) => {
			const keys = this.metadataHandler.getKeys(binding, payload);
			const keysWithoutIsActiveEntity = { ...keys };
			delete keysWithoutIsActiveEntity.IsActiveEntity;

			// try to find the matching object from the spreadsheet in the requested objects
			const matchingObjectTrue = objectsTrue.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value));
			const matchingObjectFalse = objectsFalse.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value));

			let matchingObject = payload.IsActiveEntity ? matchingObjectTrue : matchingObjectFalse;

			// if the matching object is not found, try to find it in the opposite status objects, a error will be later shown in the validation
			if(!matchingObject) {
				matchingObject = payload.IsActiveEntity ? matchingObjectFalse : matchingObjectTrue;
			}

			matchResults.push({
				index,
				keys: keysWithoutIsActiveEntity,
				requestedStatus: payload.IsActiveEntity,
				foundIn: matchingObjectTrue ? 'objectsTrue' : (matchingObjectFalse ? 'objectsFalse' : 'notFound'),
				object: matchingObject
			});
		});

		Log.debug("Entity matching results", undefined, "SpreadsheetUpload: ODataV4RequestObjects", () => ({
			total: matchResults.length,
			found: matchResults.filter(r => r.object).length,
			notFound: matchResults.filter(r => !r.object).length,
			details: matchResults
		}));

		return matchResults.map(result => result.object);
	}

	private getContextsFromPayload(batch: any[], contextsTrue: Context[], contextsFalse: Context[], path: string, binding: any): BatchContext[] {
		return batch.map((payload) => {
			const keys = this.metadataHandler.getKeys(binding, payload);
			const keyPredicates = MetadataHandlerV4.formatKeyPredicates(keys, payload);
			const isActiveEntity = payload.IsActiveEntity;
			const keysWithoutIsActiveEntity = { ...keys };
			delete keysWithoutIsActiveEntity.IsActiveEntity;

			const matchingContextTrue = contextsTrue.find((ctx) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => ctx.getObject()[key] === value));
			const matchingContextFalse = contextsFalse.find((ctx) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => ctx.getObject()[key] === value));

			let matchingContext = isActiveEntity ? matchingContextTrue : matchingContextFalse;

			if(!matchingContext) {
				matchingContext = isActiveEntity ? matchingContextFalse : matchingContextTrue;
			}

			return {
				context: matchingContext,
				path,
				keyPredicates: keyPredicates,
				keys: Object.keys(keys),
				payload
			};
		});
	}

	private validateObjectsAndDraftStates(batch: any[], objects: any[], binding: any): boolean {
		let errorFound = false;

		batch.forEach((batchItem, index) => {
			const keys = this.metadataHandler.getKeys(binding, batchItem);
			const keysWithoutIsActiveEntity = { ...keys };
			delete keysWithoutIsActiveEntity.IsActiveEntity;

			const foundObject = objects.find((obj) => obj && Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value));

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

			// Check for valid draft states only if batchItem.IsActiveEntity is defined
			if (batchItem.IsActiveEntity !== undefined) {
				if (foundObject.IsActiveEntity && !foundObject.HasDraftEntity && !batchItem.IsActiveEntity) {
					this.addDraftMismatchError(index, keys, "Draft", "Active");
					errorFound = true;
				} else if (foundObject.IsActiveEntity && foundObject.HasDraftEntity && batchItem.IsActiveEntity) {
					this.addDraftMismatchError(index, keys, "Active", "Draft");
					errorFound = true;
				} else if (!foundObject.IsActiveEntity && batchItem.IsActiveEntity) {
					this.addDraftMismatchError(index, keys, "Active", "Draft");
					errorFound = true;
				}
			}
		});

		return errorFound;
	}

	private addDraftMismatchError(index: number, keys: Record<string, any>, uploadedState: string, expectedState: string): void {
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
}
