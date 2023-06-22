/* eslint-disable no-undef */
const chokidar = require("chokidar");
var shell = require("shelljs");
var execAsync = require("./execAsync")
let timeoutId;
// execAsync("npx @ui5/ts-interface-generator --watch")
shell.exec(
	"pnpm --filter ui5-cc-excelupload build:dev "
);
// One-liner for current directory
chokidar
	.watch("./packages/ui5-cc-excelUpload/src/", {
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
				"pnpm --filter ui5-cc-excelupload build:dev "
			);
		}, 100);

	});