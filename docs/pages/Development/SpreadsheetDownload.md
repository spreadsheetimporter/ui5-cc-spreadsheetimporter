This feature is experimental and only available with a OData V4 backend.

## Triggering the download

The spreadsheet download is triggered by a button in the spreadsheet upload dialog.

This will run onInitDownloadSpreadsheetProcess in SpreadsheetUploadDialog.ts.  
If config.showOptions is true, the SpreadsheetDownloadDialog will be created and opened. With this dialog it is possible to set options as a user.
From the SpreadsheetDownloadDialog the method onSave is triggered, which sets the deepDownloadConfig and then calls onDownloadDataSpreadsheet.

If config.showOptions is false, the SpreadsheetDownload will be triggered directly with the default or developer defined options.

## Method onDownloadDataSpreadsheet

The method first checks if there are any errors. Errors can occur in the setContext method of SpreadsheetUpload.ts.

## MetadataHandlerV4

In the MetadataHandler the code builds the metadata model, which is a tree of all the entities and their properties.  
Here the entityName should be the root entity of the download and deepLevel should be the maximum depth of the download.

From the rootEntity the method _findEntitiesByNavigationProperty is called. This method traverses the metadata model and collects all the entities that are related to the rootEntity by navigation properties.  
If the `$kind` and `$Partner` properties are present and the `$ReferentialConstraint` is not, the full entity is added to the parent entity (or root entity) as property name `$XYZEntity` and making it explicitly fetchable with `$XYZFetchableEntity` property.

In this example to the entity `OrdersService.Order` the entity `OrdersService.OrderItems` is added as `$XYZEntity` and `$XYZFetchableEntity` is set to true.

This is the root entity without some properties for brevity before the navigation property was added:

```json
{
    "$kind": "EntityType",
    "$Key": [
        "ID",
        "IsActiveEntity"
    ],
    "OrderNo": {
        "$kind": "Property",
        "$Type": "Edm.String",
        "$MaxLength": 22
    },
    "Items": {
        "$kind": "NavigationProperty",
        "$isCollection": true,
        "$Type": "OrdersService.OrderItems",
        "$Partner": "order",
        "$OnDelete": "Cascade"
    },
    "Shipping": {
        "$kind": "NavigationProperty",
        "$isCollection": true,
        "$Type": "OrdersService.ShippingDetails",
        "$Partner": "order",
        "$OnDelete": "Cascade"
    },
    "buyer": {
        "$kind": "Property",
        "$Type": "Edm.String",
        "$MaxLength": 255
    }
}
```

This is the root entity after navigation properties for `Items` (here `Infos` under `Items`) and `Shipping` were added:

```json
{
    "$kind": "EntityType",
    "$Key": [
        "ID",
        "IsActiveEntity"
    ],
    "ID": {
        "$kind": "Property",
        "$Type": "Edm.Guid",
        "$Nullable": false
    },
    "OrderNo": {
        "$kind": "Property",
        "$Type": "Edm.String",
        "$MaxLength": 22
    },
    "Items": {
        "$kind": "NavigationProperty",
        "$isCollection": true,
        "$Type": "OrdersService.OrderItems",
        "$Partner": "order",
        "$OnDelete": "Cascade",
        "$XYZEntity": {
            "$kind": "EntityType",
            "$Key": [
                "ID",
                "IsActiveEntity"
            ],
            "ID": {
                "$kind": "Property",
                "$Type": "Edm.Guid",
                "$Nullable": false
            },
            "order": {
                "$kind": "NavigationProperty",
                "$Type": "OrdersService.Orders",
                "$Partner": "Items",
                "$ReferentialConstraint": {
                    "order_ID": "ID"
                }
            },
            "order_ID": {
                "$kind": "Property",
                "$Type": "Edm.Guid"
            },
            "product_ID": {
                "$kind": "Property",
                "$Type": "Edm.String"
            },
            "Infos": {
                "$kind": "NavigationProperty",
                "$isCollection": true,
                "$Type": "OrdersService.OrderItemsInfo",
                "$Partner": "orderItem",
                "$OnDelete": "Cascade",
                "$XYZEntity": {
                    "$kind": "EntityType",
                    "$Key": [
                        "ID",
                        "IsActiveEntity"
                    ],
                    "ID": {
                        "$kind": "Property",
                        "$Type": "Edm.Guid",
                        "$Nullable": false
                    },
                    "orderItem": {
                        "$kind": "NavigationProperty",
                        "$Type": "OrdersService.OrderItems",
                        "$Partner": "Infos",
                        "$ReferentialConstraint": {
                            "orderItem_ID": "ID"
                        }
                    },
                    "orderItem_ID": {
                        "$kind": "Property",
                        "$Type": "Edm.Guid"
                    },
                    "comment": {
                        "$kind": "Property",
                        "$Type": "Edm.String"
                    }
                },
                "$XYZFetchableEntity": true
            },
            "quantity": {
                "$kind": "Property",
                "$Type": "Edm.Int32"
            }
        },
        "$XYZFetchableEntity": true
    },
    "Shipping": {
        "$kind": "NavigationProperty",
        "$isCollection": true,
        "$Type": "OrdersService.ShippingDetails",
        "$Partner": "order",
        "$OnDelete": "Cascade",
        "$XYZEntity": {
            "$kind": "EntityType",
            "$Key": [
                "ID",
                "IsActiveEntity"
            ],
            "ID": {
                "$kind": "Property",
                "$Type": "Edm.Guid",
                "$Nullable": false
            },
            "order": {
                "$kind": "NavigationProperty",
                "$Type": "OrdersService.Orders",
                "$Partner": "Shipping",
                "$ReferentialConstraint": {
                    "order_ID": "ID"
                }
            },
            "order_ID": {
                "$kind": "Property",
                "$Type": "Edm.Guid"
            }
        },
        "$XYZFetchableEntity": true
    },
    "buyer": {
        "$kind": "Property",
        "$Type": "Edm.String",
        "$MaxLength": 255
    }
}
```

With this metadata model it is much easier to fetch data and have a overview of all the entities that are related to the root entity.

### Expands

In the next step the method _getExpandsRecursive is called. This method traverses the metadata model and creates a list of expands for the Odata Binding which is created in getBindingFromBinding in ODataV4.ts.  
The expands are used to fetch the related entities in one request.

### Binding

With the binding from the root entity a custom binding is created with the expands in getBindingFromBinding in ODataV4.ts to fetch the data.

### fetchBatch

The method fetchBatch in ODataV4.ts is used to fetch the data in batches of 1000. This is done to prevent the OData V4 backend from timing out.  
This is done inside the current context and might be failing on memory issues.  
The data is requested with `requestContexts` from the binding and the results are of type `sap.ui.model.odata.v4.Context[]`and returned in the variable `totalResults`.

### extractObjects Method

The variable `totalResults` is then processed with the method `extractObjects` in Util.ts. This method converts the `sap.ui.model.odata.v4.Context` to the requested object with requesting `getObject` from the binding. With this method the data is converted to an array of objects.

