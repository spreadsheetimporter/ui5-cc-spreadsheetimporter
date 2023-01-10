import OData from "./OData";

export default class ODataV284 extends OData {
    
    constructor(ui5version: number) { 
        super(ui5version);
    }
    create(model: any, binding: any, payload: any) {
        // let context = binding.getModel().createEntry("/" + binding.oEntityType.name, { properties: payload });
        let context = binding.getModel().createEntry(binding.sDeepPath, { properties: payload });
		return context
    }
}