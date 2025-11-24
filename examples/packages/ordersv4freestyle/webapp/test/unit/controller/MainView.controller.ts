import QUnit from "sap/ui/thirdparty/qunit-2";
import MainViewController from "ordersv4freestyle/controller/MainView.controller";

QUnit.module("MainView Controller");

QUnit.test("I should test the MainView controller", function (assert: Assert) {
	const oAppController = new MainViewController();
	oAppController.onInit();
	assert.ok(oAppController);
});
