import QUnit from "sap/ui/thirdparty/qunit-2";

QUnit.config.autostart = false;

void import("ordersv4freestyle/test/unit/AllTests").then(() => {
	QUnit.start();
});
