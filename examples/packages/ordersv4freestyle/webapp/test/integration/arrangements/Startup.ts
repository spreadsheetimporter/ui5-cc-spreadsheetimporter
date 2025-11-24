import Opa5 from "sap/ui/test/Opa5";

interface StartOptions {
	delay?: number;
	hash?: string;
	autoWait?: boolean;
}

/**
 * @namespace integration.arrangements
 */
export default class Startup extends Opa5 {
	public iStartMyApp(oOptionsParameter?: StartOptions): void {
		const oOptions = oOptionsParameter || {};

		// start the app with a minimal delay to make tests fast but still async to discover basic timing issues
		const delay = oOptions.delay || 50;

		// start the app UI component
		this.iStartMyUIComponent({
			componentConfig: {
				name: "ordersv4freestyle",
				async: true
			},
			hash: oOptions.hash,
			autoWait: oOptions.autoWait
		});
	}
}
