import OData from "./OData";


export default class ODataV271 extends OData {

    constructor(ui5version: number) { 
        super(ui5version);
    }
    
    create(model: any, binding: any, payload: any) {
        throw new Error("Method not implemented.");
    }
}