
export default  abstract class OData{
    UI5MinorVersion: number;

    constructor(ui5version: number){
        this.UI5MinorVersion = ui5version
    }

    public getBinding(tableObject:any): any{
        if(tableObject.getMetadata().getName() === "sap.m.Table"){
            return tableObject.getBinding("items")
        }
        if(tableObject.getMetadata().getName() === "sap.ui.table.Table"){
            return tableObject.getBinding("rows")
        }

    }

    abstract create(model:any,binding:any,payload:any):any
}