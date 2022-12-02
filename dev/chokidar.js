/* eslint-disable no-undef */
const chokidar = require("chokidar");
var shell = require("shelljs");

// One-liner for current directory
chokidar
	.watch("./src/", {
		awaitWriteFinish: {
			stabilityThreshold: 3000,
			pollInterval: 100,
		},
	})
	.on("change", (event, path) => {
		console.log(event, path);
		shell.exec(
			"ui5 build --config=ui5-build-files.yaml --dest dist --exclude-task=replaceCopyright replaceVersion createDebugFiles generateFlexChangesBundle uglify generateVersionInfo escapeNonAsciiCharacters generateComponentPreload"
		);
	});
