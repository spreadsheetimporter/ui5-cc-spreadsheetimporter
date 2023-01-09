import OData from "./OData";

export default class ODataV296 extends OData {

    constructor(ui5version: number) { 
        super(ui5version);
    }

    create(model: any, binding: any, payload: any) {
        let context = binding.create(payload);
        return {
            context: context,
            promise: context.created()
        }
    }
}