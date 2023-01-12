const util = require("./../../dev/util");

let scenario = process.argv[5];
let version = 0;
if (scenario === "--headless") {
	scenario = process.argv[6];
	version = process.argv[7];
} else {
	version = process.argv[6];
}
if (process.argv.length === 6) {
	scenario = process.argv[4];
	version = process.argv[5];
}

console.log("start XXX");
const testappObject = util.getTestappObject(scenario, version);
console.log(testappObject);
console.log("stop XXX");
const specs = testappObject["testMapping"]["specs"];
const port = testappObject.port;

module.exports.config = {
	specs: specs,
	exclude: [
		// 'path/to/excluded/files'
	],
	maxInstances: 1,
	//
	capabilities: [
		{
			maxInstances: 5,
			//
			browserName: "chrome",
			"goog:chromeOptions": {
				args:
					process.argv.indexOf("--headless") > -1
						? ["--headless", "--window-size=1920,1080"]
						: process.argv.indexOf("--debug") > -1
						? ["--window-size=1920,1080", "--auto-open-devtools-for-tabs"]
						: ["--window-size=1920,1080"]
			},
			acceptInsecureCerts: true
		}
	],
	logLevel: "error",
	bail: 0,
	baseUrl: `http://localhost:${port}/index.html?sap-language=EN`,
	waitforTimeout: 10000,
	connectionRetryTimeout: process.argv.indexOf("--debug") > -1 ? 1200000 : 120000,
	connectionRetryCount: 3,
	services: ["chromedriver", "ui5"],
	framework: "mocha",
	reporters: ["spec"],
	mochaOpts: {
		ui: "bdd",
		timeout: process.argv.indexOf("--debug") > -1 ? 600000 : 60000
	}
};
