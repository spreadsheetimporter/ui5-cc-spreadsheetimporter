const cds = require("@sap/cds");
const cors = require("cors");
const cov2ap = require("@cap-js-community/odata-v2-adapter");

cds.on("bootstrap", (app) => {
	// Enable CORS for all routes
	app.use(cors());

	// Apply OData V2 adapter
	app.use(cov2ap());
});

module.exports = cds.server;
