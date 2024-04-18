import ManagedObject from "sap/ui/base/ManagedObject";
import Button from "sap/m/Button";
import Column from "sap/m/Column";
import ColumnListItem from "sap/m/ColumnListItem";
import Dialog from "sap/m/Dialog";
import Table from "sap/m/Table";
import JSONModel from "sap/ui/model/json/JSONModel";
import Text from "sap/m/Text";
import Util from "./Util";
import { ListObject } from "../types";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class Preview extends ManagedObject {
	dialog: Dialog;
	util: Util;
	constructor(util: Util) {
		super();
		this.util = util;
	}

	showPreview(payload: any, typeLabelList: ListObject, previewColumns: string[]) {
		const table = this.createDynamicTable(payload, typeLabelList, previewColumns);
		if (typeof table === "undefined") {
			return;
		}
		this.dialog = new Dialog({
			title: this.util.geti18nText("spreadsheetimporter.previewTableName"),
			content: [table],
			buttons: [
				new Button({
					text: this.util.geti18nText("spreadsheetimporter.messageDialogButtonClose"),
					press: () => {
						this.dialog.close();
					}
				})
			],
			afterClose: () => {
				this.dialog.destroy();
			}
		});

		this.dialog.open();
	}

	createDynamicTable(data: any[], typeLabelList: ListObject, previewColumns: string[]) {
		const table = new Table();

		// Create table columns and cells based on the first object's keys
		if (typeof data !== "undefined" && data !== null && data.length > 0) {
			const firstObject = data[0];
			const aColumns = Object.keys(firstObject);

			aColumns.forEach((column) => {
				// check if column is in previewColumns
				if (previewColumns && previewColumns.length > 0 && previewColumns.indexOf(column) === -1) {
					return;
				}
				const type = typeLabelList.get(column);
				const label = type && type.label ? type.label : column;
				const sapMColumn = new Column({
					header: new Text({ text: label })
				});

				table.addColumn(sapMColumn);
			});

			// Create a template for table rows
			const template = new ColumnListItem();
			aColumns.forEach((column) => {
				let oCell;
				if (typeof firstObject[column] === "object" && firstObject[column] instanceof Date) {
					// show date in the format dd.mm.yyyy
					oCell = new Text({ text: `{path: '${column}', type: 'sap.ui.model.type.Date'}` });
				} else {
					oCell = new Text({ text: "{" + column + "}" });
				}
				template.addCell(oCell);
			});

			// Bind the data to the table
			const model = new JSONModel();
			model.setData(data);
			table.setModel(model);
			table.bindItems({ path: "/", template: template });
			return table;
		} else {
			// No data
			Util.showError(new Error(this.util.geti18nText("spreadsheetimporter.noDataPreview")), "Preview.ts", "createDynamicTable");
			return undefined;
		}
	}
}
