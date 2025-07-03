With this feature, you are able to upload a spreadsheet to create multiple entities and their relations.

## Configuration

| Option      | Description                                   | Details |
| ----------- | --------------------------------------------- | ------- |
| `operation` | Choose which method to use for uploading data | string  |
| `flatSheet` | Upload data in one sheet or multiple sheets   | object  |
| `columns`   | Choose which data to upload                   | object  |

### Sample Usage

```json
componentData: {
    context: this,
    pro: {
        operation: "deepCreate",
        deepCreateConfig:{
            flatSheet:false,
            columns : {
                "OrderNo":{
                    "order": 1,
                    "data": ""
                },
                "buyer": {
                    "order": 3,
                    "data": ""
                },
                "Items": {
                    "quantity" : {
                        "order": 2,
                        "data": ""
                    },
                    "title": {
                        "order": 4,
                        "data": ""
                    }
                },
                "Shipping": {
                    "address" : {
                        "order": 5,
                        "data": ""
                    },
                }
            }
        }
    }
}
```

### operation

**default:** `create`

Currently available options: `create`, `deepCreate`

This option defines the method to use for uploading data.

### flatSheet

**default:** `false`

This option determines whether you want to upload data in one sheet or multiple sheets.  
By default, every entity is in a separate sheet. If you want to upload data in one sheet, set this option to `true`.

### columns

This option determines which data to upload.
