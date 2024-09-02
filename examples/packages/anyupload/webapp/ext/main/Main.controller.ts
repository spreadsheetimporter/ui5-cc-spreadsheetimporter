import Controller from "sap/fe/core/PageController";
import Select from "sap/m/Select";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";

/**
 * @namespace com.spreadsheetimporter.anyupload.ext.main.Main.controller
 */
export default class Main extends Controller {
	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf com.spreadsheetimporter.anyupload.ext.main.Main
	 */
	public onInit(): void {
		const capInstancesURL = ["https://livedemo.spreadsheet-importer.com/odata/v2/Orders", "https://livedemo.spreadsheet-importer.com/odata/v4/orders"];
		// query the cap instances, returns json
		Promise.all(capInstancesURL.map(url => fetch(url).then(response => response.json())))
			.then(dataArray => {
				// Handle the data here
				console.log(dataArray);
				// set data to view json model, combining V2 and V4 data
				const entitySets = [
					...dataArray[0].d.results.map((item: { name: string; url: string }) => ({
						name: item.name,
						url: item.url,
						version: "V2"
					})),
					...dataArray[1].value.map((item: { name: string; url: string }) => ({
						name: item.name,
						url: item.url,
						version: "V4"
					}))
				];

				entitySets.sort((a, b) => a.name.localeCompare(b.name));
				this.getView().setModel(new JSONModel(entitySets), "capInstances");
			})
			.catch(error => {
				console.error('Error fetching data:', error);
			});
	}

	public async onServiceChange(event: Event): Promise<void> {
		const selectedService = (event.getSource() as Select).getSelectedItem().getBindingContext("capInstances").getObject();
        const selectedServiceModel = new ODataModel(`https://livedemo.spreadsheet-importer.com/odata/v2/orders/${selectedService}`);
        await selectedServiceModel.getMetaModel().loaded();
        const metadata = selectedServiceModel.getMetaModel().getObject("/");
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
