# Deep Download Feature

This feature is experimental and only available with an OData V4 backend. It allows downloading data from OData V4 backends with support for nested entities and relationships, handling complex data structures efficiently.

## Triggering the Download

The spreadsheet download is triggered by a button in the spreadsheet upload dialog. This process is managed by the `SpreadsheetUploadDialog.ts` file.

- **onInitDownloadSpreadsheetProcess**: This method initializes the download process. If `config.showOptions` is true, it opens the `SpreadsheetDownloadDialog` to allow users to set options. Otherwise, it triggers the download directly with default settings.

- **onSave**: This method in `SpreadsheetDownloadDialog.ts` sets the `deepDownloadConfig` and calls `onDownloadDataSpreadsheet`.

## Method onDownloadDataSpreadsheet

This method checks for errors before proceeding with the download. Errors can occur in the `setContext` method of `SpreadsheetUpload.ts`.

## MetadataHandlerV4

The `MetadataHandlerV4` class builds the metadata model, which is a tree of all entities and their properties. The `entityName` should be the root entity of the download, and `deepLevel` should be the maximum depth of the download.

- **\_findEntitiesByNavigationProperty**: This method traverses the metadata model and collects all entities related to the root entity by navigation properties. If the `$kind` and `$Partner` properties are present and the `$ReferentialConstraint` is not, the full entity is added to the parent entity as `$XYZEntity`, making it explicitly fetchable with `$XYZFetchableEntity`.

### JSON Sample

This is the root entity without some properties for brevity before the navigation property was added:

```json
{
  "$kind": "EntityType",
  "$Key": ["ID", "IsActiveEntity"],
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
  "$Key": ["ID", "IsActiveEntity"],
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
      "$Key": ["ID", "IsActiveEntity"],
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
          "$Key": ["ID", "IsActiveEntity"],
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
      "$Key": ["ID", "IsActiveEntity"],
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

With this metadata model, it is much easier to fetch data and have an overview of all the entities related to the root entity.

### Expands

The method `_getExpandsRecursive` is called to traverse the metadata model and create a list of expands for the OData binding, which is created in `getBindingFromBinding` in `ODataV4.ts`. The expands are used to fetch related entities in one request.

### Binding

With the binding from the root entity, a custom binding is created with the expands in `getBindingFromBinding` in `ODataV4.ts` to fetch the data.

### fetchBatch

The method `fetchBatch` in `ODataV4.ts` is used to fetch the data in batches of 1000. This is done to prevent the OData V4 backend from timing out. The data is requested with `requestContexts` from the binding, and the results are of type `sap.ui.model.odata.v4.Context[]` and returned in the variable `totalResults`.

### extractObjects Method

The `extractObjects` method is used to process the fetched data and prepare it for spreadsheet generation.

## Spreadsheet Generation

The `SpreadsheetGenerator` class handles the creation of the spreadsheet file. It uses the fetched data to generate sheets for each entity and its related entities, ensuring that all necessary data is included in the final output.
