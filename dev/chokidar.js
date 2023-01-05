/* eslint-disable no-undef */
const chokidar = require("chokidar");
var shell = require("shelljs");
shell.exec("babel src --out-dir webapp --source-maps true --extensions \".ts,.js\" --copy-files")
shell.exec("node ./dev/replace-string.js --develop");
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
	})
	.on("change", (event, path) => {
		console.log(event, path);
		shell.exec("babel src --out-dir webapp --source-maps true --extensions \".ts,.js\" --copy-files")
		shell.exec("node ./dev/replace-string.js --develop");
		shell.exec(
			"ui5 build --config=ui5-build.yaml --all --clean-dest --dest dist  --exclude-task=replaceCopyright replaceVersion generateFlexChangesBundle generateVersionInfo minify escapeNonAsciiCharacters "
		);
	});
