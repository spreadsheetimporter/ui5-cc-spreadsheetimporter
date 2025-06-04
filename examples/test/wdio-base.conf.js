const { escape } = require("querystring");
const path = require('path');
const downloadDir = path.resolve(__dirname, 'downloads');
const util = require("./../../dev/util");
const { TimelineService } = require('wdio-timeline-reporter/timeline-service');
let scenario = "";
let version = 0;

// Check for watch mode flag
const isWatchMode = process.argv.indexOf("--watch") > -1;
const isDebugEnabled = true;

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
let baseUrl = `http://localhost:${port}/index.html?sap-language=EN`;
global.scenario = scenario;

module.exports.config = {
	wdi5: {
		logLevel: "error",
		waitForUI5Timeout: 180000
	},
	specs: specs,
	exclude: [
		// 'path/to/excluded/files'
	],
	// Reduce instances for watch mode to keep browser stable
	maxInstances: isWatchMode ? 1 : 10,
	//
	capabilities: [
		{
			maxInstances: isWatchMode ? 1 : 5,
			//
			browserName: "chrome",
			browserVersion: 'stable',
			"goog:chromeOptions": {
				args:
					process.argv.indexOf("--headless") > -1
						? ["--headless=new", "--window-size=1920,1080", "--no-sandbox"]
						: process.argv.indexOf("--debug") > -1
						? ["--window-size=1920,1080", "--auto-open-devtools-for-tabs"]
						: ["--window-size=1920,1080"],
            prefs: {
                'download.default_directory': downloadDir,
                'download.prompt_for_download': false,
                'download.directory_upgrade': true
            }
			},
			acceptInsecureCerts: true
		}
	],
	logLevel: "error",
	bail: isWatchMode ? 0 : 0, // Don't bail in watch mode
	baseUrl: baseUrl,
	waitforTimeout: 60000,
	connectionRetryTimeout: process.argv.indexOf("--debug") > -1 ? 1200000 : 120000,
	connectionRetryCount: 3,

	// Watch mode configuration
	watch: isWatchMode,
	watchInterval: isWatchMode ? 1000 : undefined,
	filesToWatch: isWatchMode ? [
		'./test/specs/**/*.js',
		'./specs/**/*.js',
		'./test/specs/**/*.test.js',
		'../packages/ui5-cc-spreadsheetimporter/src/**/*.js',
		'../packages/ui5-cc-spreadsheetimporter/src/**/*.ts'
	] : undefined,

	services: isDebugEnabled
		? ["ui5", [TimelineService, {
			screenshotStrategy: "none"
		  }]]
		: ["ui5"],
	framework: "mocha",
	reporters: isDebugEnabled
		? [
			"spec",
			["timeline", {
				outputDir: "./reports/timeline",
				embedImages: true,
				screenshotStrategy: "none"
			}]
		]
		: ["spec"],
	mochaOpts: {
		ui: "bdd",
		timeout: process.argv.indexOf("--debug") > -1 ? 600000 : 600000,
		bail: isWatchMode ? false : false // Don't stop on first failure in watch mode
	},

	// Hooks for better watch mode experience
	beforeSession: function (config, capabilities, specs) {
		if (isWatchMode) {
			console.log('\n🔄 Watch mode enabled - tests will rerun on file changes');
			console.log('📝 Press Ctrl+C to stop watching\n');
		}
	},

	afterTest: function (test, context, { error, result, duration, passed, retries }) {
		if (isWatchMode) {
			if (!passed) {
				console.log(`\n❌ Test failed: ${test.title}`);
			} else {
				console.log(`\n✅ Test passed: ${test.title}`);
			}
		}
	},

	afterSuite: function (suite) {
		if (isWatchMode) {
			console.log(`\n📊 Suite completed: ${suite.title}`);
			console.log('👀 Watching for file changes...\n');
		}
	}
};
