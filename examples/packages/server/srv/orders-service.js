const cds = require("@sap/cds");
class OrdersService extends cds.ApplicationService {
	/** register custom handlers */
	init() {
		const { OrderItems, Orders, ShippingDetails } = this.entities;

		// Register action handler for checking shipping details
		this.on("checkShippingDetails", async (req) => {
			const { shippingDetails } = req.data;
			const errors = [];

			// Process each shipping detail entry
			for (const shippingDetail of shippingDetails) {
				// Extract data from shipping detail
				const { city, row } = shippingDetail;

				if (city) {
					try {
						// Use proper CDS query syntax instead of object-based where clause
						// This matches the documentation examples for CDS queries
						const orderItems = await SELECT.from(OrderItems).where(`title like '%${city}%'`);

						if (orderItems && orderItems.length > 0) {
							// Create error for city found in product titles
							errors.push({
								title: `City "${city}" found in product title`,
								row: row || 0,
								group: true,
								rawValue: city,
								ui5type: "Warning",
								messageType: "Warning",
								value: city
							});
						}
					} catch (error) {
						console.error("Error in city check:", error);
						// Add generic error if query fails
						errors.push({
							title: `Error checking city "${city}"`,
							row: row || 0,
							group: true,
							rawValue: city,
							ui5type: "Error",
							messageType: "Error",
							value: city
						});
					}
				}
			}

			// Return the list of errors/warnings
			return { value: errors };
		});

		return super.init();
	}
}
module.exports = OrdersService;
