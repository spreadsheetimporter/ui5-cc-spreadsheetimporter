
Only V4 is supported for now.

## OData V4

The problem with Draft is that when updating lot of objects, the update will fail if one of the objects is not found because of the draft status.  
Draft status will determined with `IsActiveEntity` property.  
To make it as seamless as possible, the process will try to find every object with `IsActiveEntity=true`. This does not find objects that dont have a active entity.  
The finding of the object result in a get request to the OData service for each batch.  
After that the process know the state of the object and can update it.