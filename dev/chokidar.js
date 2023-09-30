/* eslint-disable no-undef */
const chokidar = require("chokidar");
var shell = require("shelljs");
var execAsync = require("./execAsync")
let timeoutId;
// execAsync("npx @ui5/ts-interface-generator --watch")
shell.exec(
	"pnpm --filter ui5-cc-spreadsheetimporter build:dev:tooling"
);

chokidar
	.watch("./packages/ui5-cc-spreadsheetimporter/src/", {
		awaitWriteFinish: {
			stabilityThreshold: 1000,
			pollInterval: 100,
		},
		ignoreInitial: true,
		ignored: '**/*.dt.ts'
	})
	.on("change", (event, path) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => {
			// Remove everything in the dist directory except the thirdparty folder
			// shell.ls('packages/ui5-cc-spreadsheetimporter/dist').forEach(function (file) {
			// 	if (file !== 'thirdparty') {
			// 		shell.rm('-r', 'packages/ui5-cc-spreadsheetimporter/dist/' + file);
			// 	}
			// });
			shell.exec(
				"pnpm --filter ui5-cc-spreadsheetimporter build:dev:tooling "
			);
		}, 100);

	});