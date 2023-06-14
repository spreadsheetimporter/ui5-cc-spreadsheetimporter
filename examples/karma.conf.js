const util = require("../dev/util");
let scenario = "";
let version = 0;

for (let index = 0; index < process.argv.length; index++) {
	const arg = process.argv[index];
	if (arg.startsWith("orders")) {
		scenario = arg;
		version = process.argv[index + 1];
	}
}

const testappObject = util.getTestappObject(scenario, version);
const specs = testappObject["testMapping"]["specs"];
const port = testappObject.port;
const id = testappObject.id;
const rootAppName = testappObject.rootAppName;
// replace point with slashes from id
const idSlash = id.replace(/\./g, "/");

module.exports = function (config) {
	let configuration = {
		frameworks: ["ui5"],
		plugins: [require("karma-ui5"), require("karma-chrome-launcher")],
		ui5: {
			url: `http://localhost:${port}`,
			mode: "html",
			testpage: "../test/integration/opaTests.qunit.html",
			type: "application",
			paths: {
				webapp: `packages/${rootAppName}/webapp/`
			},
			config: {
				async: true,
				resourceRoots: {},
			}
		},
		browsers: ["Chrome"]
	};

	configuration.ui5.config.resourceRoots[id] = "./";

	config.set(configuration);
};
