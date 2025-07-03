import Controller from "sap/fe/core/PageController";
import Column from "sap/m/Column";
import Text from "sap/m/Text";
import ColumnListItem from "sap/m/ColumnListItem";
import Select, { Select$ChangeEventParameters } from "sap/m/Select";
import Table from "sap/m/Table";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModelV4 from "sap/ui/model/odata/v4/ODataModel";
import ODataModelV2 from "sap/ui/model/odata/v2/ODataModel";
import Button from "sap/m/Button";
import MessageStrip, { MessageType } from "sap/m/MessageStrip";

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
		const domain = "https://livedemo.spreadsheet-importer.com";
		// const domain = "http://localhost:4004";
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

	public async onServiceChange(event: Select$ChangeEventParameters) {
		// @ts-ignore
		let selectedService = "";
		try {
			selectedService = (event.getSource() as Select).getSelectedItem()?.getBindingContext("capServices")?.getObject() as ServiceObject;
			if (selectedService?.url.includes("/v2/")) {
				this.selectedService = new ODataModelV2(selectedService.url);
			} else if (selectedService?.url.includes("/v4/")) {
				// Import ODataModel V4 at the top of the file
				// import ODataModelV4 from "sap/ui/model/odata/v4/ODataModel";
				this.selectedService = new ODataModelV4({
					serviceUrl: selectedService.url,
					synchronizationMode: "None"
				});
			} else {
				console.error("Unknown OData version");
			}
			await this.selectedService.getMetaModel().loaded();
		} catch (error) {
			console.error("Error creating ODataModel:", error);
		}
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

				// Reset entitysets select
				const entitySetSelect = this.byId("entitySetSelect") as Select;
				const entitySetText = this.byId("entitySetText") as Text;
				if (entitySetSelect) {
					entitySetSelect.setSelectedKey(null);
					const hasEntitySets = entitySets && entitySets.length > 0;
					entitySetSelect.setVisible(hasEntitySets);
					entitySetText.setVisible(hasEntitySets);

					if (!hasEntitySets) {
						const messageStrip = new MessageStrip({
							text: "No entity sets are available",
							type: MessageType.Error,
							showIcon: true
						});
						this.getView().addContent(messageStrip);
					}
				}

				// Make table and excel button not visible
				const dynamicTable = this.byId("dynamicTable") as Table;
				if (dynamicTable) {
					dynamicTable.setVisible(false);
				}

				const excelButton = this.byId("excelButton") as Button;
				if (excelButton) {
					excelButton.setVisible(false);
				}
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

		const excelButton = this.byId("excelButton") as Button;
		if (excelButton) {
			excelButton.setVisible(true);
		}
	}

	async onUpload(): void {
		const entitySelectObject = this.byId("entitySetSelect")?.getSelectedItem()?.getBindingContext("capEntitySets")?.getObject();
		const serviceSelectObject = this.byId("serviceSelect")?.getSelectedItem()?.getBindingContext("capServices")?.getObject();

		const componentData = {
			context: this
		};
		if (serviceSelectObject.name === "Orders V2") {
			componentData.createActiveEntity = true;
		}
		this.spreadsheetUpload = await this.getAppComponent().createComponent({
			usage: "spreadsheetImporter",
			async: true,
			componentData: componentData
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
