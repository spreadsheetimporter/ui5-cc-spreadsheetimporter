import Opa5 from "sap/ui/test/Opa5";

const sViewName = "App";

/**
 * @namespace integration.pages
 */
export default class AppPage extends Opa5 {
	public iStartMyApp(): Opa5 {
		return this.iStartMyUIComponent({
			componentConfig: {
				name: "ordersv4freestyle",
				async: true
			}
		});
	}

	public iShouldSeeTheApp(): Opa5 {
		return this.waitFor({
			id: "app",
			viewName: sViewName,
			success: function () {
				Opa5.assert.ok(true, "The " + sViewName + " view is displayed");
			},
			errorMessage: "Did not find the " + sViewName + " view"
		});
	}
}
