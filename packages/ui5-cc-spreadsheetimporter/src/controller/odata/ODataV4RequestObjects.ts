import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import { CustomMessageTypes, MessageType } from "../../enums";
import MetadataHandlerV4 from "./MetadataHandlerV4";
import MessageHandler from "../MessageHandler";
import Util from "../Util";

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
		let path = MetadataHandlerV4.getResolvedPath(binding);

		// Get both active and inactive contexts, will trigger two get requests
		const { contexts: contextsTrue, objects: objectsTrue } = await this._getFilteredContexts(model, binding, path, batch, true);
		const { contexts: contextsFalse, objects: objectsFalse } = await this._getFilteredContexts(model, binding, path, batch, false);

		let objects = this.findEntitiesFromSpreadsheet(batch, objectsTrue, objectsFalse, binding);

		// Store contexts with their corresponding paths and payloads
		this.contexts = this.getContextsFromPayload(batch, contextsTrue, contextsFalse, path, binding);

		const errorFound = this.validateObjectsAndDraftStates(batch, objects, binding);

		if (errorFound) {
			if (this.messageHandler.areMessagesPresent()) {
				try {
					// Wait for user decision
					await this.messageHandler.displayMessages();
					// If we get here, user clicked continue
					// Update objects with correct draft status versions, also to have correct partial update
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

					// Update contexts with correct versions
					this.contexts = this.getContextsFromPayload(batch, contextsTrue, contextsFalse, path, binding);
					return objects;
				} catch (error) {
					// User clicked close
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
		const objects = [];

		// get the objects state we need
		batch.forEach((payload) => {
			// Get keys excluding IsActiveEntity for matching
			const keys = this.metadataHandler.getKeys(binding, payload);
			const keysWithoutIsActiveEntity = { ...keys };
			delete keysWithoutIsActiveEntity.IsActiveEntity;

			// Find matching object based on IsActiveEntity flag
			const matchingObject = payload.IsActiveEntity
				? objectsTrue.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value))
				: objectsFalse.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value));

			if (matchingObject) {
				objects.push(matchingObject);
			} else {
				// if no matching object found, maybe draft status is wrong, still add so it comes up in the messagehandler
				const matchingObject = !payload.IsActiveEntity
					? objectsTrue.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value))
					: objectsFalse.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value));
				objects.push(matchingObject);
			}
		});

		return objects;
	}

	private getContextsFromPayload(batch: any[], contextsTrue: Context[], contextsFalse: Context[], path: string, binding: any): BatchContext[] {
		return batch.map((payload) => {
			const keys = this.metadataHandler.getKeys(binding, payload);
			const keyPredicates = MetadataHandlerV4.formatKeyPredicates(keys, payload);
			const isActiveEntity = payload.IsActiveEntity;
			const keysWithoutIsActiveEntity = { ...keys };
			delete keysWithoutIsActiveEntity.IsActiveEntity;

			const matchingContext = isActiveEntity
				? contextsTrue.find((ctx) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => ctx.getObject()[key] === value))
				: contextsFalse.find((ctx) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => ctx.getObject()[key] === value));

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

			const foundObject = objects.find((obj) => Object.entries(keysWithoutIsActiveEntity).every(([key, value]) => obj[key] === value));

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
				this.addDraftMismatchError(index, keys, "Draft", "Active");
				errorFound = true;
			} else if (foundObject.IsActiveEntity && foundObject.HasDraftEntity && batchItem.IsActiveEntity) {
				this.addDraftMismatchError(index, keys, "Active", "Draft");
				errorFound = true;
			} else if (!foundObject.IsActiveEntity && batchItem.IsActiveEntity) {
				this.addDraftMismatchError(index, keys, "Active", "Draft");
				errorFound = true;
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
