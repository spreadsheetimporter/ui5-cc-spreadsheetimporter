import ManagedObject from "sap/ui/base/ManagedObject";
import Dialog from "sap/m/Dialog";
import Select from "sap/m/Select";
import Button from "sap/m/Button";
import Text from "sap/m/Text";
import Item from "sap/ui/core/Item";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

/**
 * @namespace cc.spreadsheetimporter.XXXnamespaceXXX
 */
export default class TableSelector extends ManagedObject {
	private _tables: any[] = [];
	private _i18nModel: ResourceModel;

	constructor(view: any) {
		super();
		this._tables = this._getTableObject(view);
		this._i18nModel = new ResourceModel({
			bundleName: "cc.spreadsheetimporter.XXXnamespaceXXX.i18n.i18n"
		});
	}

	public getTables(): any[] {
		return this._tables;
	}

	public chooseTable(): Promise<any> {
		return new Promise((resolve, reject) => {
			if (this._tables.length === 0) {
				reject(new Error("No tables found"));
			}
			if (this._tables.length === 1) {
				resolve(this._tables[0]);
			}
			const select = new Select();

			this._tables.forEach((table) => {
				select.addItem(
					new Item({
						key: table.getId(),
						text: table.getBinding("items").getPath()
					})
				);
			});

			const i18n = this._i18nModel.getResourceBundle() as ResourceBundle;

			const dialog = new Dialog({
				title: i18n.getText("tableSelectorDialogTitle"),
				type: "Message",
				content: [select],
				beginButton: new Button({
					text: i18n.getText("ok"),
					press: () => {
						const selectedKey = select.getSelectedKey();
						const selectedTable = this._tables.find((table) => table.getId() === selectedKey);
						resolve(selectedTable);
						dialog.close();
					}
				}),
				afterClose: () => dialog.destroy(),
				endButton: new Button({
					text: i18n.getText("close"),
					press: () => {
						reject(new Error(i18n.getText("close")));
						dialog.close();
					}
				})
			}) as Dialog;

			dialog.open();
		});
	}

	private _getTableObject(view: any) {
		return view.findAggregatedObjects(true, function (object: any) {
			return object.isA("sap.m.Table") || object.isA("sap.ui.table.Table");
		});
	}

	public get tables(): any[] {
		return this._tables;
	}
	public set tables(value: any[]) {
		this._tables = value;
	}
}
