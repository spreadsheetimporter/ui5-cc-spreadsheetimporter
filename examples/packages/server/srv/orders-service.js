const cds = require("@sap/cds");
class OrdersService extends cds.ApplicationService {
	/** register custom handlers */
	init() {
		const { "Orders.Items": OrderItems } = this.entities;

		return super.init();
	}
}
module.exports = OrdersService;
