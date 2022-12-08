
There are extension points in form of events, where you can intervine to manipulate data.

### Check Data before Upload to App

As soon as you upload the File to the App, the `checkBeforeRead` is fired.

#### Example

This sample is from the [sample app](https://github.com/marianfoo/ui5-cc-excelUpload-sampleapp/blob/744f008b1b052a3df5594215d8d11811a8e646b7/packages/orders/webapp/ext/ObjectPageExtController.js#L26-L44).  
It checks if the price is over 100.  

````javascript
this.excelUpload.attachCheckBeforeRead(function(oEvent) {
    // example
    const sheetData = oEvent.getParameter("sheetData");
    let errorArray = [
            {
                title: "Price to high (max 100)",
                counter: 0,
            },
        ];
        for (const row of sheetData) {
            //check for invalid date
            if (row.UnitPrice) {
                if(row.UnitPrice > 100){
                    errorArray[0].counter = errorArray[0].counter + 1
                }
            }
        }
    oEvent.getSource().addToErrorsResults(errorArray)
}, this)
````

### Manipulate Data before it is send to the backend

As you as you press the `Upload` Button, the `changeBeforeCreate` is fired.

#### Example

This sample is from the [sample app](https://github.com/marianfoo/ui5-cc-excelUpload-sampleapp/blob/744f008b1b052a3df5594215d8d11811a8e646b7/packages/orders/webapp/ext/ObjectPageExtController.js#L47-L54).  
This is a sample to overwrite the payload.  

````javascript
this.excelUpload.attachChangeBeforeCreate(function(oEvent) {
    oEvent.getSource().setPayload({
        "product_ID": "123",
        "quantity": 1,
        "title": "Test",
        "price": 25
    })
}, this)
````