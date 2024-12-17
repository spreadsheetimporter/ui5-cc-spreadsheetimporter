
Only V4 is supported for now.

## OData V4

The problem with Draft is that when updating lot of objects, the update will fail if one of the objects is not found because of the draft status.  
Draft status will determined with `IsActiveEntity` property.  
To make it as seamless as possible, the process will try to find every object with `IsActiveEntity=true`. This does not find objects that dont have a active entity (draft but not yet created).  
The finding of the object result in a get request to the OData service for each row.  
After that the process knows the state of the object and can update it.  
So if on the object `HasDraftEntity` is true or `IsActiveEntity` is false, the process will create a new context with `IsActiveEntity=false` and use the draft entity automatically to update the object.


## Technical Details

To get the all the objects that are imported from the spreadsheet, the process will create a new empty list binding with a filter of all the keys from the spreadsheet.
Technically is has to query for `IsActiveEntity=true` and `IsActiveEntity=false` and combine the results.  
This will result in two get requests to the OData service for each row combined in two batch request for each batch.
If a row is not found it is just not included in the List Binding.
So the process will not fail if a row is not found and can match which objects are not found from the List Binding.  
If a object was not found the user can then decide to continue with the found objects or to cancel the process.  
Each context will then be used to update the object with `setProperty`.

### Different States in Export

For the export the process determines the state of the object by checking the `IsActiveEntity` and `HasDraftEntity` properties.  


#### List Report

- `IsActiveEntity=true` and `HasDraftEntity=false` -> `IsActiveEntity` column is set to true
- `IsActiveEntity=true` and `HasDraftEntity=true` -> `IsActiveEntity` column is set to false

#### Object Page

- `IsActiveEntity=true` and `HasDraftEntity=false` -> `IsActiveEntity` column is set to true
- `IsActiveEntity=true` and `HasDraftEntity=true` -> `IsActiveEntity` column is set to false

### Different States in Upload

#### List Report

- `IsActiveEntity=true` and `HasDraftEntity=false` -> update the object (expecting `IsActiveEntity=true` in the spreadsheet import)
- `IsActiveEntity=true` and `HasDraftEntity=true` -> create a new context with `IsActiveEntity=false` and use the draft entity automatically to update the object (expecting `IsActiveEntity=false` in the spreadsheet import)

#### Table in Object Page

##### Not in Edit Mode

- `IsActiveEntity=true` and `HasDraftEntity=false` and `HasActiveEntity=false` -> update the object (expecting `IsActiveEntity=true` in the spreadsheet import)

##### In Edit Mode

- `IsActiveEntity=false` and `HasDraftEntity=false` and `HasActiveEntity=true` -> update the object (expecting `IsActiveEntity=false` in the spreadsheet import)
