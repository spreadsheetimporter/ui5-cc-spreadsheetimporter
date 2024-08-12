The following events can be used as extension points to intervene and manipulate data:

| Event                | Description                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `preFileProcessing`  | Execute custom logic before processing the spreadsheet file starts                                 |
| `checkBeforeRead`    | Check data before it is uploaded to the UI5                                                        |
| `changeBeforeCreate` | Change data before it is sent to the backend                                                       |
| `requestCompleted`   | Event when the request is completed                                                                |
| `uploadButtonPress`  | Fired when the `Upload` button is pressed, possible to prevent data from being sent to the backend |

You can attach async functions to the events by wrapping the function in a `Promise`. See [Attach async functions to events](#attach-async-functions-to-events) for more information.

## Execute custom logic before processing the spreadsheet file starts

When the file is uploaded to the app, the `preFileProcessing` event is fired. Use this event to execute custom logic before processing the spreadsheet file starts.
The `file` is available in the event and can be manipulated. If you want to prevent the processing of the file, call the `preventDefault` method of the event. If you want to change the file that will be processed, return the new file.

### Example

```javascript
this.spreadsheetUpload.attachPreFileProcessing(function (event) {
// example
let file = event.getParameter("file");
if (file.name.endsWith(".txt")) {
    // prevent processing of file
    event.preventDefault();
    // show custom ui5 error message
    new MessageToast.show("File with .txt extension is not allowed");
    // change the file that will be processed
    // Create a Blob with some text content
    const blob = new Blob(["This is some dummy text content"], { type: "text/plain" });
    // Create a File object from the Blob
    const file2 = new File([blob], "TEXT.txt", { type: "text/plain" });
    return file2;
}
});
```

## Check data before upload to app

When the file is uploaded to the app, the `checkBeforeRead` event is fired.

### Example

This sample is from the [sample app](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/47d22cdc42aa1cacfd797bdc0e025b830330dc5e/examples/packages/ordersv4fe/webapp/ext/ObjectPageExtController.js#L24-L42). It checks whether the price is over 100.

```javascript
this.spreadsheetUpload.attachCheckBeforeRead(function(event) {
    // example
    const sheetdata = event.getParameter("sheetData");
    let errorArray = [];
    for (const [index, row] of sheetData.entries()) {
        // Check for invalid price
        for (const key in row) {
            if (key.endsWith("[price]") && row[key].rawValue > 100) {
                const error = {
                    title: "Price too high (max 100)",
                    row: index + 2,
                    group: true,
                    rawValue: row[key].rawValue,
                    ui5type: "Error"
                };
                errorArray.push(error);
            }
        }
    }
    event.getSource().addArrayToMessages(errorArray);
}, this);
```

You can add errors to the `messages` property of the `SpreadsheetUpload` control. After the event, the upload is canceled and the errors are displayed in the error dialog. Use the `addArrayToMessages` method to add errors to the `messages` property. It expects an array of objects with the following properties:

- `title` - the title of the error
- `row` - the row number of the error
- `group` - set to `true` or `false` to group the errors by title
- `rawValue` - the raw value of the data from the spreadsheet
- `ui5type` - the type of the error, can be `Error`, `Warning`, `Success`, `Information` or `None` from the [`MessageType](https://ui5.sap.com/#/api/sap.ui.core.MessageType) enum

Errors with the same title will be grouped.

![Error Dialog](./../images/error_dialog.png){ loading=lazy }

## Manipulate data before it is sent to the backend

When the `Upload` button is pressed, the `changeBeforeCreate` event is fired.  Use this event to manipulate the data before it is sent to the backend. The event expects a payload object to be returned.  
Make sure only one handler is attached to this event. If multiple handlers are attached, only the first payload will be used.

### Example

This sample is from the [sample app](https://github.com/spreadsheetimporter/ui5-cc-spreadsheetimporter/blob/47d22cdc42aa1cacfd797bdc0e025b830330dc5e/examples/packages/ordersv4fe/webapp/ext/ObjectPageExtController.js#L45-L52). It overwrites the payload.

```javascript
this.spreadsheetUpload.attachChangeBeforeCreate(function (event) {
    let payload = event.getParameter("payload");
    // round number from 12,56 to 12,6
    if (payload.price) {
        payload.price = Number(payload.price.toFixed(1));
    }
    return payload;
}, this);
```

## Event when the request is completed

When the request is completed, the `requestCompleted` event is fired. Use the `success` parameter to check if the request was successful.

### Example

```javascript
this.spreadsheetUpload.attachRequestCompleted(function (event) {
    const success = event.getParameter("success");
    if (success) {
        console.log("Request Completed");
    } else {
        console.log("Request Failed");
    }
}, this);
```

## Event when the upload button is pressed

When the `Upload` button is pressed, the `uploadButtonPress` event is fired. The event is fired before the `changeBeforeCreate` event. Prevent the data from being sent to the backend by calling the `preventDefault` method of the event.

### Example 1

```javascript
this.spreadsheetUpload.attachUploadButtonPress(function (event) {
    // Prevent data from being sent to the backend
    event.preventDefault();
    // Get payload
    const payload = event.getParameter("payload");
}, this);
```

### Example 2

You can also use this event to sent the data to the backend and add possible errors to the component. Use the `addArrayToMessages` method to add errors. It will display the errors in the error dialog after the execution of the event.

```javascript
this.spreadsheetUpload.attachUploadButtonPress(async function (event) {
    event.preventDefault();
    
    event.getSource().addArrayToMessages([{
        title: "Error on creating",
        group: false,
        ui5type: "Error"
    }]);

    // simulate async call
    await new Promise((resolve) => {
        // Wait for 2 seconds
        setTimeout(() => {
            resolve();
        }, 2000);
    });

    // Code here will execute after the 2-second wait
}, this);
```

## Attach async functions to events

You can attach async functions to the events by wrapping the function in a `Promise`. This allows you to send a request to the backend for checks that are not possible in the frontend, for example with a function import.

```javascript
// Init spreadsheet upload
this.spreadsheetUpload = await this.editFlow.getView()
        .getController()
        .getAppComponent()
        .createComponent({
            usage: "spreadsheetImporter",
            async: true,
            componentData: {
                context: this,
                activateDraft: true
            }
        });

// Event to check before uploading to app
this.spreadsheetUpload.attachCheckBeforeRead(async function (event) {
    return new Promise(async (resolve, reject) => {
        // Example
        console.log("Start async wait");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        console.log("End async wait");
        // Don't forget to resolve the promise
        resolve();
    });
}, this);
```
