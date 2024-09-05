const cds = require("@sap/cds");
const cov2ap = require("@cap-js-community/odata-v2-adapter");
cds.on("bootstrap", (app) => app.use(cov2ap()));
module.exports = cds.server;
const cors = require('cors');

cds.on("bootstrap", (app) => {
    // Enable CORS for all routes
    app.use(cors());
    
    // Apply OData V2 adapter
    app.use(cov2ap());
});
