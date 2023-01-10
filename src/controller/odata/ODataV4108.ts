import OData from "./OData";

export default class ODataV4108 extends OData {

    constructor(ui5version: number) { 
        super(ui5version);
    }
    
    create(model: any, binding: any, payload: any) {
        const context = binding.create(payload);
        return {
            context: context,
            promise: context.created()
        }
    }
}