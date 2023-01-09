import OData from "./OData";

export default class ODataV2108 extends OData {
	constructor(ui5version: number) {
		super(ui5version);
	}

	create(model: any, binding: any, payload: any):any {
		let context = binding.create(payload, /*bAtEnd*/ true, { inactive: false, expand: "" });
        return {
            context: context,
            promise: context.created()
        }
	}
}
