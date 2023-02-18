/* eslint-disable no-undef */
const chokidar = require("chokidar");
var shell = require("shelljs");
var execAsync = require("./execAsync")
let timeoutId;
execAsync("npx @ui5/ts-interface-generator --watch")
shell.exec(
	"ui5 build --config=ui5-build.yaml --all --clean-dest --dest dist  --exclude-task=replaceCopyright replaceVersion generateFlexChangesBundle generateVersionInfo minify escapeNonAsciiCharacters "
);
// One-liner for current directory
chokidar
	.watch("./src/", {
		awaitWriteFinish: {
			stabilityThreshold: 1000,
			pollInterval: 100,
		},
		ignoreInitial: true
	})
	.on("change", (event, path) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => {
			shell.exec(
				"ui5 build --config=ui5-build.yaml --all --clean-dest --dest dist  --exclude-task=replaceCopyright replaceVersion generateFlexChangesBundle generateVersionInfo minify escapeNonAsciiCharacters "
			);
		}, 100);

	});
