# Table Chooser Implementation Documentation

!!! warning
        **Experimental**: This feature is still in development and may change!

The `TableChooser` is designed to help users select a table from a list of available tables in a SAP UI5 application. The tables are aggregated and presented in a dialog, from which a user can select a table.

## Usage
`TableChooser` is instantiated by passing the view object in the constructor. 

```js
const tableChooser = new TableChooser(this.editFlow.getView());
```

After instantiation, `TableChooser` collects all table objects present in the given view. These table objects can be retrieved with the `getTables()` method.  
The table object is the same as the one returned by the `byId()` method of the view.

```js
const tables =  tableChooser.getTables();
```

 To open the table selection dialog, use the `chooseTable()` method. 
 
```js
let chosenTable = await tableChooser.chooseTable();
```

This method returns a Promise that resolves to the chosen table object when a table is selected and the OK button is pressed. If the dialog is closed or cancelled, it rejects the Promise.

## Full Example

```js
openSpreadsheetUploadDialog: async function (oEvent) {
	this.editFlow.getView().setBusyIndicatorDelay(0);
	this.editFlow.getView().setBusy(true);
	const tableChooser = new TableChooser(this.editFlow.getView());
	// possible to get all tables found
	const tables =  tableChooser.getTables();
	let chosenTable;
	try {
		chosenTable = await tableChooser.chooseTable();
	} catch (error) {
		// user canceled or no table found
		this.editFlow.getView().setBusy(false);
		return
	}
	let spreadsheetImporterOptions;
	if (chosenTable.getId() === "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable") {
		spreadsheetImporterOptions = {
			context: this,
			tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
			columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal"],
			mandatoryFields: ["product_ID", "quantity"],
			spreadsheetFileName: "Test.xlsx",
			sampleData: [
				{
					product_ID: "HT-1000",
					quantity: 1,
					title: "Notebook Basic 15",
					price: 956,
					validFrom: new Date(),
					timestamp: new Date(),
					date: new Date(),
					time: new Date(),
					boolean: true,
					decimal: 1.1
				}
			]
		};
	}
	if (chosenTable.getId() === "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable") {
		spreadsheetImporterOptions = {
			context: this,
			tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable"
		};
	}

	// prettier-ignore
	this.spreadsheetUpload = await this.editFlow.getView()
			.getController()
			.getAppComponent()
			.createComponent({
				usage: "spreadsheetImporter",
				async: true,
				componentData: 
					spreadsheetImporterOptions
				
			});

	this.spreadsheetUpload.openSpreadsheetUploadDialog();
	this.editFlow.getView().setBusy(false);
}
```
