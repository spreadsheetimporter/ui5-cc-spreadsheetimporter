import Opa5 from "sap/ui/test/Opa5";

const sViewName = "MainView";

/**
 * @namespace integration.pages
 */
export default class MainViewPage extends Opa5 {
	public iShouldSeeThePageView(): Opa5 {
		return this.waitFor({
			id: "page",
			viewName: sViewName,
			success: function () {
				Opa5.assert.ok(true, "The " + sViewName + " view is displayed");
			},
			errorMessage: "Did not find the " + sViewName + " view"
		});
	}
}
