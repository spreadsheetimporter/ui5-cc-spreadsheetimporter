The following events can be used as extension points to intervene and manipulate data:

| Event | Description |
| ------ | --- |
| `checkBeforeRead` | Check data before data is uploaded to the UI5  |
| `changeBeforeCreate` | Change data before it is sent to the backend |
| `uploadButtonPress` | Fired when the `Upload` button is pressed, possible to prevent data send to backend |

## Check data before upload to app
When the file is uploaded to the App, the `checkBeforeRead` event is fired.

### Example
This sample is from the [sample app](https://github.com/marianfoo/ui5-cc-excelUpload/blob/47d22cdc42aa1cacfd797bdc0e025b830330dc5e/examples/packages/ordersv4fe/webapp/ext/ObjectPageExtController.js#L24-L42). 
It checks whether the price is over 100. 
````javascript
this.excelUpload.attachCheckBeforeRead(function(oEvent) {
    // example
    const sheetdata = oEvent.getParameter("sheetdata");
    let errorArray = [];
    for (const [index, row] of sheetdata.entries()) {
        //check for invalid price
        if (row["UnitPrice[price]"]) {
            if (row["UnitPrice[price]"] > 100) {
                const error = {
                    title: "Price to high (max 100)",
                    row: index + 2,
                    group: true
                }
                errorArray.push(error);
            }
        }
    }
    oEvent.getSource().addToErrorsResults(errorArray)
}, this)
````

You can add errors to the `errorResults` property of the `ExcelUpload` control. After the event the upload is canceled and the errors are displayed in the error dialog.  
With the method `addToErrorsResults` you can add errors to the `errorResults` property. It expects an array of objects with the following properties:

- `title` - the title of the error
- `row` - the row number of the error
- `group` - if you want to group the errors, set `true` or `false`. (Grouping is by title)

The Errors with the same title will be grouped.

![Error Dialog](./../images/error_dialog.png){ loading=lazy }

## Manipulate data before it is sent to the backend
When the `Upload` button is pressed, the `changeBeforeCreate` event is fired.

### Example
This sample is from the [sample app](https://github.com/marianfoo/ui5-cc-excelUpload/blob/47d22cdc42aa1cacfd797bdc0e025b830330dc5e/examples/packages/ordersv4fe/webapp/ext/ObjectPageExtController.js#L45-L52).
This is a sample to overwrite the payload.  

````javascript
this.excelUpload.attachChangeBeforeCreate(function (oEvent) {
    let payload = oEvent.getParameter("payload");
    // round number from 12,56 to 12,6
    if (payload.price) {
        payload.price = Number(payload.price.toFixed(1));
    }
    oEvent.getSource().setPayload(payload);
}, this);
````

## Event when the upload button is pressed
When the `Upload` button is pressed, the `uploadButtonPress` event is fired. The event is fired before the `changeBeforeCreate` event.  
It is possible to prevent the data from being sent to the backend with the method `preventDefault` of the event.


### Example


````javascript
this.excelUpload.attachChangeBeforeCreate(function (oEvent) {
    // prevent data send to backend
    oEvent.preventDefault();
    // get payload
    const payload = oEvent.getParameter("payload")
}, this);
````