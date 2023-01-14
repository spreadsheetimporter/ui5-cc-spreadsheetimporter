import OData from "./OData";

export default class ODataV284 extends OData {
    
    constructor(ui5version: number) { 
        super(ui5version);
    }
    create(model: any, binding: any, payload: any) {
        const submitChangesPromise = (binding,payload) => {
            return new Promise((resolve, reject) => {
                let context = binding.getModel().createEntry(binding.sDeepPath, { properties: payload,
                    success: (data) => {
                        resolve(context);
                    },
                    error: (oError) => {
                        reject(oError);
                    },
                });
            });
        };
        return submitChangesPromise(binding,payload)
    }
}