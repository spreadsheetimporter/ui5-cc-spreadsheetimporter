There are extension points in form of events, where you can intervene and manipulate data.

| Event | Description |
| ------ | --- |
| `checkBeforeRead` | Check Data before data uploaded to the UI5  |
| `changeBeforeCreate` | Change Data before send to the backend |
| `uploadButtonPress` | Fire when `Upload` Button is pressed, possible to prevent data send to backend |

## Check Data before Upload to App
When the file is uploaded to the App, the `checkBeforeRead` is fired.

### Example
This sample is from the [sample app](https://github.com/marianfoo/ui5-cc-excelUpload/blob/47d22cdc42aa1cacfd797bdc0e025b830330dc5e/examples/packages/ordersv4fe/webapp/ext/ObjectPageExtController.js#L24-L42). 
It checks whether the price is over 100. 
````javascript
this.excelUpload.attachCheckBeforeRead(function(oEvent) {
    // example
    const sheetData = oEvent.getParameter("sheetData");
    let errorArray = [];
    for (const [index, row] of sheetData.entries()) {
        //check for invalid price
        if (row.UnitPrice) {
            if (row.UnitPrice > 100) {
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

You can add errors to the `errorResults` property of the `ExcelUpload` control. After the event the upload is canceled and the errors are displayed in the Error Dialog.  
With the method `addToErrorsResults` you can add errors to the `errorResults` property. It expects an array of objects with the following properties:

- `title` - the title of the error
- `row` - the row number of the error
- `group` - if you want to group the errors, set `true` or `false`. (Grouping is by title)

The Errors with the same title will be grouped.

![Error Dialog](./../images/error_dialog.png){ loading=lazy }

## Manipulate Data before it is send to the backend
When the `Upload` button is pressed, the `changeBeforeCreate` is fired.

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

## Event when Upload Button is pressed
When the `Upload` button is pressed, the `uploadButtonPress` is fired. The Event is fired before the `changeBeforeCreate` event.


### Example


````javascript
this.excelUpload.attachChangeBeforeCreate(function (oEvent) {
    // prevent data send to backend
    oEvent.preventDefault();
}, this);
````