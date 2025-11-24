/* global window, parent, location */

export default {
	name: "Testsuite for ordersv4freestyle",
	defaults: {
		page: "ui5://test-resources/ordersv4freestyle/test/{name}.qunit.html",
		qunit: {
			version: 2
		},
		loader: {
			paths: {
				ordersv4freestyle: "../",
				unit: "./unit",
				integration: "./integration"
			}
		}
	},
	tests: {
		"unit/unitTests": {
			title: "Unit Tests for ordersv4freestyle"
		},
		"integration/opaTests": {
			title: "Integration Tests for ordersv4freestyle"
		}
	}
};
