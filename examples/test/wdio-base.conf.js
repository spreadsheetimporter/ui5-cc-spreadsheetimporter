const util = require("./../../dev/util");
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

module.exports.config = {
	wdi5: {
        logLevel: "error",
        waitForUI5Timeout: 29000
    },
	scenario: scenario,
	specs: specs,
	exclude: [
		// 'path/to/excluded/files'
	],
	maxInstances: 1,
	//
	capabilities: [{
		"acceptInsecureCerts": true,
		"browserName": "firefox",
		"browserVersion": "102",
		"moz:firefoxOptions": {
		  "binary": '/extbin/bin/firefox',
		  "args": ['-headless'],
		  "log": {"level": "trace"},
			},
	}],
	logLevel: "error",
	bail: 0,
	baseUrl: `http://localhost:${port}/index.html?sap-language=EN`,
	waitforTimeout: 20000,
	connectionRetryTimeout: process.argv.indexOf("--debug") > -1 ? 1200000 : 120000,
	connectionRetryCount: 3,
	services: [ 
		[
		'geckodriver', 
		// service options 
		{
		// OPTIONAL: Arguments passed to geckdriver executable.
		// Check geckodriver --help for all options. Example:
		// ['--log=debug', '--binary=/var/ff50/firefox'] 
		// Default: empty array
		args: ['--log=trace'],
		
		// The path where the output of the Geckodriver server should
		// be stored (uses the config.outputDir by default when not set).
		 outputDir: './logs' 
		 }
		],'ui5'
	],
	framework: "mocha",
	reporters: ["spec"],
	mochaOpts: {
		ui: "bdd",
		timeout: process.argv.indexOf("--debug") > -1 ? 600000 : 60000
	}
};
