/* eslint-disable no-undef */
const chokidar = require("chokidar");
var shell = require("shelljs");
shell.exec("npm run build");
// One-liner for current directory
chokidar
	.watch("./src/", {
		awaitWriteFinish: {
			stabilityThreshold: 1000,
			pollInterval: 100,
		},
	})
	.on("change", (event, path) => {
		console.log(event, path);
		shell.exec("npm run build");
	});
