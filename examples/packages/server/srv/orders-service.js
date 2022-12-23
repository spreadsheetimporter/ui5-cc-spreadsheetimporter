const cds = require("@sap/cds");
class OrdersService extends cds.ApplicationService {
	/** register custom handlers */
	init() {
		const { "Orders.Items": OrderItems } = this.entities;

		return super.init();
	}

	/** order changed -> broadcast event */
	orderChanged(product, deltaQuantity) {
		// Emit events to inform subscribers about changes in orders
		console.log("> emitting:", "OrderChanged", { product, deltaQuantity });
		return this.emit("OrderChanged", { product, deltaQuantity });
	}
}
module.exports = OrdersService;
