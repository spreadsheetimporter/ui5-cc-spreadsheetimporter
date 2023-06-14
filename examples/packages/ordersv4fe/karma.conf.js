module.exports = function (config) {
	config.set({
		frameworks: ["ui5"
    // , "qunit", "sinon"
  ],
    plugins: [
      require("karma-ui5"),
      // require("karma-qunit"),
      // require("karma-sinon"),
      require("karma-chrome-launcher")
    ],
		ui5: {
			url: "http://localhost:8080",
      mode: "html",
      testpage: "webapp/test/integration/opaTests.qunit.html",
			type: "application",
      paths: {
        webapp: "webapp"
      },
			config: {
				async: true,
				resourceRoots: {
					"ui.v4.ordersv4fe": "./"
				}
			},
			tests: ["ui/v4/ordersv4fe/test/integration/FirstJourney"]
		},
		browsers: ["Chrome"]
	});
};
