With this feature you are able to upload a spreadsheet to create with multiple entities and their relations.

## Configuration

| Option | Description | Details |
| ------ | --- | --- |
| `operation` | Choose which method to upload data you want to use | string |
| `flatSheet` | Upload data in one  | object |
| `columns` | Choose which data is uploaded | object |

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

This option defines which method to upload data you want to use. 

### flatSheet

**default:** `false`

This option defines if you want to upload data in one sheet or multiple sheets.  
By default every entity is in a separate sheet. If you want to upload data in one sheet, set this option to `true`.

### columns

This option defines which data is uploaded.



