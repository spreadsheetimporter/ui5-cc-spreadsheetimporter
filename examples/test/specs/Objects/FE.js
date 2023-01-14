class OData {
	checkField(id, expectedValue) {
		if (this.method === undefined) {
			// or maybe test typeof this.method === "function"
			throw new TypeError("Must override method");
		}
	}
}
