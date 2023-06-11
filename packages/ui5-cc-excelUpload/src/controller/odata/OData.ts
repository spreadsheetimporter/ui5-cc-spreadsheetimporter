import DraftController from "sap/ui/generic/app/transaction/DraftController";
import { Columns, ListObject } from "../../types";
import MetadataHandler from "./MetadataHandler";
import ODataMessageHandler from "../ODataMessageHandler";
import ExcelUpload from "../ExcelUpload";
import Log from "sap/base/Log";
import MetadataHandlerV2 from "./MetadataHandlerV2";
import MetadataHandlerV4 from "./MetadataHandlerV4";

export default abstract class OData {
	UI5MinorVersion: number;
	draftController: DraftController;
	odataMessageHandler: ODataMessageHandler;

	constructor(ui5version: number, excelUploadController: ExcelUpload) {
		this.UI5MinorVersion = ui5version;
		this.odataMessageHandler = new ODataMessageHandler(excelUploadController);
	}

	public getBinding(tableObject: any): any {
		if (tableObject.getMetadata().getName() === "sap.m.Table" || tableObject.getMetadata().getName() === "sap.m.List") {
			return tableObject.getBinding("items");
		}
		if (tableObject.getMetadata().getName() === "sap.ui.table.Table") {
			return tableObject.getBinding("rows");
		}
	}

	public _getActionName(oContext: any, sOperation: string) {
		var oModel = oContext.getModel(),
			oMetaModel = oModel.getMetaModel(),
			sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
		return oMetaModel.getObject("".concat(sEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot/").concat(sOperation));
	}

	// Slice the array into chunks of 'batchSize' if necessary
	public processPayloadArray(batchSize: number, payloadArray: string | any[]) {
		if (batchSize > 0) {
			let slicedPayloadArray = [];
			const numOfSlices = Math.ceil(payloadArray.length / batchSize);
			const equalSize = Math.ceil(payloadArray.length / numOfSlices);

			for (let i = 0; i < payloadArray.length; i += equalSize) {
				slicedPayloadArray.push(payloadArray.slice(i, i + equalSize));
			}
			return slicedPayloadArray;
		} else {
			return [payloadArray];
		}
	}

	public getTableObject(tableId: string, view: any) {
		// try get object page table
		if (!tableId) {
			let tables = view.findAggregatedObjects(true, function (object) {
				return object.isA("sap.m.Table") || object.isA("sap.ui.table.Table");
			});
			if (tables.length > 1) {
				Log.error("Found more than one table on Object Page.\n Please specify table in option 'tableId'",undefined,"ExcelUpload: OData");
			} else {
				return tables[0];
			}
		} else {
			return view.byId(tableId);
		}
	}


	abstract create(model: any, binding: any, payload: any): any;
	abstract createAsync(model: any, binding: any, payload: any): any;
	abstract submitChanges(model: any): Promise<any>;
	abstract waitForCreation(): Promise<any>;
	abstract waitForDraft(): void;
	abstract resetContexts(): void;
	abstract getView(context: any): any;
	abstract getMetadataHandler(): MetadataHandlerV2 | MetadataHandlerV4
	abstract getLabelList(columns: Columns, odataType: string, tableObject: any): Promise<ListObject>;
	abstract getKeyList(odataType: string, tableObject: any): Promise<string[]>;
	abstract getOdataType(binding: any, tableObject: any, odataType: any): string;
	abstract checkForErrors(model: any, binding: any, showBackendErrorMessages: Boolean): Promise<boolean>;
	abstract createCustomBinding(binding: any): any;
}
