import Controller from "sap/fe/core/PageController";
import Column from "sap/m/Column";
import Text from "sap/m/Text";
import ColumnListItem from "sap/m/ColumnListItem";
import Select, { Select$ChangeEventParameters } from "sap/m/Select";
import Table from "sap/m/Table";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";

/**
 * @namespace com.spreadsheetimporter.anyupload.ext.main.Main.controller
 */
export default class Main extends Controller {
	private selectedService: ODataModel;

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf com.spreadsheetimporter.anyupload.ext.main.Main
	 */
	public onInit(): void {
		// const domain = "https://livedemo.spreadsheet-importer.com";
		const domain = "http://localhost:4004";
		const capServices = [
			{
				name: "Orders V2",
				url: `${domain}/odata/v2/Orders`
			},
			{
				name: "Orders V4",
				url: `${domain}/odata/v4/orders`
			}
		];
		this.getView()?.setModel(new JSONModel(capServices), "capServices");
	}

	public onServiceChange(event: Select$ChangeEventParameters) {
		// @ts-ignore
		const selectedService = (event.getSource() as Select).getSelectedItem()?.getBindingContext("capServices")?.getObject() as ServiceObject;
		this.selectedService = new ODataModel(selectedService?.url);
		const url = selectedService.url;
		// query the single url
		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				// Handle the data here
				console.log(data);
				// set data to view json model
				let entitySets;
				if (url.includes("/v2/")) {
					entitySets = data.d.results.map((item: { name: string; url: string }) => ({
						name: item.name,
						url: item.url,
						version: "V2"
					}));
				} else {
					entitySets = data.value.map((item: { name: string; url: string }) => ({
						name: item.name,
						url: item.url,
						version: "V4"
					}));
				}
				// @ts-ignore
				entitySets.sort((a, b) => a.name.localeCompare(b.name));
				this.getView()?.setModel(new JSONModel(entitySets), "capEntitySets");
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
			});
	}

	public async onEntityChange(event: Select$ChangeEventParameters): Promise<void> {
		interface ServiceObject {
			name: string;
			url: string;
			version: string;
		}
		// @ts-ignore
		const selectedEntitySet = event.getParameter("selectedItem")?.getBindingContext("capEntitySets")?.getObject() as ServiceObject;
		await this.selectedService.getMetaModel().loaded();
		const metadata = this.selectedService.getMetaModel().getObject("/");
		// @ts-ignore
		const entitySets = this.selectedService.getMetaModel().getODataEntityContainer().entitySet;
		// find entitySet by entitySetId from entitySets
		const entitySet = entitySets.find((entitySet: any) => entitySet.name === selectedEntitySet.name);

		const entityType = this.selectedService.getMetaModel().getODataEntityType(entitySet.entityType);
		const dynamicTable = this.byId("dynamicTable") as Table;

		dynamicTable.removeAllColumns();
		dynamicTable.unbindItems();

		// Create columns based on entity properties
		entityType.property.forEach((property: any) => {
			return dynamicTable.addColumn(
				new Column({
					header: new Text({ text: property.name })
				})
			);
		});

		//Create template for items
		const template = new ColumnListItem({
			cells: entityType.property.map((property: any) => {
				return new Text({ text: `{${property.name}}` });
			})
		});


		// Bind items to the table using the new model
		dynamicTable.setModel(this.selectedService);
		dynamicTable.bindItems({
			path: `/${selectedEntitySet.name}`,
			template: template
		});

		dynamicTable.setVisible(true);
	}

	async onUpload(): void {
		this.spreadsheetUpload = await this.getAppComponent()
			.createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: {
					context: this,
					
				},
			});
		this.spreadsheetUpload.openSpreadsheetUploadDialog();
	}

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf com.spreadsheetimporter.anyupload.ext.main.Main
	 */
	// public  onBeforeRendering(): void {
	//
	//  }

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf com.spreadsheetimporter.anyupload.ext.main.Main
	 */
	// public  onAfterRendering(): void {
	//
	//  }

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf com.spreadsheetimporter.anyupload.ext.main.Main
	 */
	// public onExit(): void {
	//
	//  }
}
