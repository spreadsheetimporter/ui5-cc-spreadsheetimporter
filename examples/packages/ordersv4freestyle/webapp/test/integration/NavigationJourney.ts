import opaTest from "sap/ui/test/opaQunit";
import QUnit from "sap/ui/thirdparty/qunit-2";
import AppPage from "./pages/AppPage";
import MainViewPage from "./pages/MainViewPage";

const onTheAppPage = new AppPage();
const onTheViewPage = new MainViewPage();

QUnit.module("Navigation Journey");

opaTest("Should see the initial page of the app", function () {
	// Arrangements
	onTheAppPage.iStartMyApp();

	// Assertions
	onTheAppPage.iShouldSeeTheApp();
	onTheViewPage.iShouldSeeThePageView();

	// Cleanup
	onTheAppPage.iTeardownMyApp();
});
