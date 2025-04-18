# Table Selector Implementation Documentation

!!! warning
    This feature is available since version 0.23.0 

The `TableSelector` is designed to help users select a table from a list of available tables in a SAP UI5 application. The tables are aggregated and presented in a dialog, from which a user can select a table.

## Usage

`TableSelector` is triggered when the option `useTableSelector` is set to `true` in the component options and multiple tables are in the view. It will open when you execute `openSpreadsheetUploadDialog`.  

```js
this.spreadsheetUpload = await this.editFlow.getView().getController().getAppComponent().createComponent({
  usage: "spreadsheetImporter",
  async: true,
  componentData: {
    context: this,
    useTableSelector: true
  }
});
this.spreadsheetUpload.openSpreadsheetUploadDialog();
```

## Custom Options for each Table

If you want to set custom options for each table, you have to trigger the Table Selector before opening the dialog to get the table id with `triggerInitContext()`.

```js
this.spreadsheetUpload = await this.editFlow.getView().getController().getAppComponent().createComponent({
  usage: "spreadsheetImporter",
  async: true,
  componentData: {
    context: this,
    useTableSelector: true
  }
});
// necessary to trigger Table Selector and get tableId
await this.spreadsheetUpload.triggerInitContext();
const selectedTable = this.spreadsheetUpload.getTableId();
```

The method `getTableId` returns the table id of the selected table. With the id, you can set custom options for each table.

### Full Example

Make sure you check if the user selected a table with `if (selectedTable)`.

```js
openSpreadsheetUploadDialog: async function (event) {
  let spreadsheetImporterOptions;
  this.editFlow.getView().setBusyIndicatorDelay(0);
  this.editFlow.getView().setBusy(true);
  // prettier-ignore
  this.spreadsheetUpload = await this.editFlow.getView()
      .getController()
      .getAppComponent()
      .createComponent({
        usage: "spreadsheetImporter",
        async: true,
        componentData: {
          context: this,
          useTableSelector: true
        }
      });
  // necessary to trigger Table Selector and get tableId
  await this.spreadsheetUpload.triggerInitContext();
  const selectedTable = this.spreadsheetUpload.getTableId();
  if (selectedTable) {
    // not necessary to have specific options for each table, but possible to set options for specific tables
    // check if selectedTable is available, if not, the user clicked on cancel
    if (selectedTable === "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable") {
      spreadsheetImporterOptions = {
        context: this,
        tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Items::LineItem-innerTable",
        columns: ["product_ID", "quantity", "title", "price", "validFrom", "timestamp", "date", "time", "boolean", "decimal"],
        mandatoryFields: ["product_ID", "quantity"],
        spreadsheetFileName: "Test.xlsx",
        hidePreview: true,
        sampleData: [{
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
        }]
      };
    }
    if (selectedTable === "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable") {
      spreadsheetImporterOptions = {
        context: this,
        tableId: "ui.v4.ordersv4fe::OrdersObjectPage--fe::table::Shipping::LineItem-innerTable"
      };
    }

    // possible to open dialog with options, option not necessary
    this.spreadsheetUpload.openSpreadsheetUploadDialog(spreadsheetImporterOptions);
  }
  this.editFlow.getView().setBusy(false);
},
```