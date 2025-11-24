import Opa5 from "sap/ui/test/Opa5";
import Startup from "./arrangements/Startup";
import "integration/NavigationJourney";

Opa5.extendConfig({
	arrangements: new Startup(),
	viewNamespace: "ordersv4freestyle.view.",
	autoWait: true
});
