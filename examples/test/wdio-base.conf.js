const { escape } = require("querystring");
const path = require("path");
const fs = require("fs");
const downloadDir = path.resolve(__dirname, "downloads");
const util = require("./../../dev/util");
const { TimelineService } = require("wdio-timeline-reporter/timeline-service");
let scenario = "";
let version = 0;

// Check for watch mode flag
const isWatchMode = process.argv.indexOf("--watch") > -1;
const isDebugEnabled = true;
// Docker mode: use system Chromium + chromedriver instead of auto-download
const isDocker = !!process.env.CHROME_BIN;

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
// UI5 log level for tests is opt-in: set WDI5_LOG_LEVEL=DEBUG to populate the component's
// debug dumps (Log.logSupportInfo) for failure diagnostics. Left at the framework default
// otherwise, so CI runs fast and logs stay small.
const ui5LogLevel = process.env.WDI5_LOG_LEVEL;
let baseUrl = `http://localhost:${port}/index.html?sap-language=EN${ui5LogLevel ? `&sap-ui-logLevel=${ui5LogLevel}` : ""}`;
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
	// Reduce instances for watch mode to keep browser stable. Cap CI parallelism low:
	// on a 2-core runner, too many parallel browsers starve FE rendering so busy overlays
	// (sap-ui-blocklayer-popup) linger and intercept Save/Upload clicks -> flaky failures.
	maxInstances: isWatchMode ? 1 : 4,
	//
	capabilities: [
		{
			maxInstances: isWatchMode ? 1 : 2,
			"wdio:enforceWebDriverClassic": true,
			// Capture browser console logs so afterTest can dump them on failure
			"goog:loggingPrefs": { browser: "ALL" },
			//
			browserName: "chrome",
			// In Docker: skip auto-download, use system Chromium + chromedriver
			...(isDocker ? {} : { browserVersion: "stable" }),
			"goog:chromeOptions": {
				...(isDocker ? { binary: process.env.CHROME_BIN } : {}),
				args:
					process.argv.indexOf("--headless") > -1
						? ["--headless=new", "--window-size=1920,1080", "--no-sandbox"]
						: process.argv.indexOf("--debug") > -1
							? ["--window-size=1920,1080", "--auto-open-devtools-for-tabs"]
							: ["--window-size=1920,1080"],
				prefs: {
					"download.default_directory": downloadDir,
					"download.prompt_for_download": false,
					"download.directory_upgrade": true,
					// 0 = ask (default) | 1 = allow | 2 = block
					"profile.default_content_setting_values.clipboard": 1
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
	// Retry whole spec files on failure to absorb flaky FE Object Page / List Report timing
	// interactions under parallel CI load; deferred so retries run after the initial queue.
	specFileRetries: isWatchMode ? 0 : 2,
	specFileRetriesDeferred: true,

	// Watch mode configuration
	watch: isWatchMode,
	watchInterval: isWatchMode ? 1000 : undefined,
	filesToWatch: isWatchMode
		? ["./test/specs/**/*.js", "./specs/**/*.js", "./test/specs/**/*.test.js", "../packages/ui5-cc-spreadsheetimporter/src/**/*.js", "../packages/ui5-cc-spreadsheetimporter/src/**/*.ts"]
		: undefined,

	services: isDebugEnabled
		? [
				"ui5",
				[
					TimelineService,
					{
						screenshotStrategy: "none"
					}
				]
			]
		: ["ui5"],
	framework: "mocha",
	reporters: isDebugEnabled
		? [
				"spec",
				[
					"timeline",
					{
						outputDir: "./reports/timeline",
						embedImages: true,
						screenshotStrategy: "none"
					}
				]
			]
		: ["spec"],
	mochaOpts: {
		ui: "bdd",
		timeout: process.argv.indexOf("--debug") > -1 ? 600000 : 600000,
		bail: isWatchMode ? false : false // Don't stop on first failure in watch mode
	},

	// Hooks for better watch mode experience
	before: async () => {
		// let the test read the clipboard without a prompt
		await browser.setPermissions({ name: "clipboard-read" }, "granted");
		// If your app also writes to the clipboard add:
		await browser.setPermissions({ name: "clipboard-write" }, "granted");
	},

	beforeSession: function (config, capabilities, specs) {
		if (isWatchMode) {
			console.log("\n🔄 Watch mode enabled - tests will rerun on file changes");
			console.log("📝 Press Ctrl+C to stop watching\n");
		}
	},

	afterTest: async function (test, context, { error, result, duration, passed, retries }) {
		if (isWatchMode) {
			if (!passed) {
				console.log(`\n❌ Test failed: ${test.title}`);
			} else {
				console.log(`\n✅ Test passed: ${test.title}`);
			}
		}

		// On failure, dump diagnostics so OData V2 (and other) issues are debuggable in CI.
		// Relies on the UI5 DEBUG log level set on baseUrl so the component's Log.debug dumps are present.
		if (!passed) {
			console.log(`\n================ FAILURE DIAGNOSTICS: ${test.title} ================`);
			if (error && error.message) {
				console.log(`Error: ${error.message}`);
			}

			// 1) Component log buffer, filtered to SpreadsheetUpload tags (incl. support-info object dumps)
			try {
				const ui5Logs = await browser.execute(() => {
					const LEVELS = { 0: "NONE", 1: "FATAL", 2: "ERROR", 3: "WARNING", 4: "INFO", 5: "DEBUG", 6: "TRACE" };
					const LogModule = typeof sap !== "undefined" && sap.ui && sap.ui.require ? sap.ui.require("sap/base/Log") : null;
					if (!LogModule || !LogModule.getLogEntries) return [];
					return LogModule.getLogEntries()
						.filter((e) => e.component && e.component.indexOf("SpreadsheetUpload") !== -1)
						.slice(-100)
						.map((e) => {
							let details = "";
							try {
								details = e.supportInfo !== undefined ? JSON.stringify(e.supportInfo) : "";
							} catch (err) {
								details = "[unserializable support info]";
							}
							return { level: LEVELS[e.level] || e.level, component: e.component, message: e.message, details: (details || "").slice(0, 2000) };
						});
				});
				if (ui5Logs && ui5Logs.length) {
					console.log(`\n--- SpreadsheetUpload log (${ui5Logs.length} entries) ---`);
					ui5Logs.forEach((e) => console.log(`[${e.level}] [${e.component}] ${e.message}${e.details ? " :: " + e.details : ""}`));
				} else {
					console.log("\n--- No SpreadsheetUpload log entries (is the UI5 log level >= DEBUG?) ---");
				}
			} catch (e) {
				console.log(`Could not read UI5 log buffer: ${e.message}`);
			}

			// 2) Raw browser console (last entries) — requires the goog:loggingPrefs capability
			try {
				const browserLogs = await browser.getLogs("browser");
				if (browserLogs && browserLogs.length) {
					console.log(`\n--- Browser console (last 40 of ${browserLogs.length}) ---`);
					browserLogs.slice(-40).forEach((l) => console.log(`[${l.level}] ${l.message}`));
				}
			} catch (e) {
				// getLogs may be unsupported depending on driver/protocol — ignore
			}

			// 3) Screenshot on failure (saved to reports/errorShots for CI artifact upload)
			try {
				const safeTitle = test.title.replace(/[^a-z0-9]/gi, "_").slice(0, 80);
				const shotDir = path.join(__dirname, "reports", "errorShots");
				fs.mkdirSync(shotDir, { recursive: true });
				const shotPath = path.join(shotDir, `${scenario}-${safeTitle}.png`);
				await browser.saveScreenshot(shotPath);
				console.log(`📸 Screenshot: ${shotPath}`);
			} catch (e) {
				console.log(`Could not save screenshot: ${e.message}`);
			}

			console.log(`================ END DIAGNOSTICS ================\n`);
		}
	},

	afterSuite: function (suite) {
		if (isWatchMode) {
			console.log(`\n📊 Suite completed: ${suite.title}`);
			console.log("👀 Watching for file changes...\n");
		}
	}
};
