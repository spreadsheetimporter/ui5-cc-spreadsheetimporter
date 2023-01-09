
export default  abstract class OData{
    UI5MinorVersion: number;

    constructor(ui5version: number){
        this.UI5MinorVersion = ui5version
    }

    abstract create(model:any,binding:any,payload:any):any
}