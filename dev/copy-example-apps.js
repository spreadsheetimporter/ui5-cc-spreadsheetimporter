const util = require("./util");
const replace = require("replace-in-file");
const fs = require("fs");
const action = process.argv[2];

const testAppFile = fs.readFileSync("./dev/testapps.json", "utf8");
let testAppData = JSON.parse(testAppFile);

testAppsAction(action);

function testAppsAction(action) {
	let addToGitignore = [];
	for (let index = 0; index < testAppData.length; index++) {
		const rootApp = testAppData[index];
		const rootAppPath = `./examples/packages/${rootApp.rootAppName}`;
		const targetVersions = rootApp.copyVersions;
		for (let indey = 0; indey < targetVersions.length; indey++) {
			const targetVersion = targetVersions[indey];
			const versionName = rootApp.rootAppName + targetVersion.version.split(".")[1];
			const versionPath = `./examples/packages/${versionName}`;
			addToGitignore.push(versionPath);
		}
		updateGitIgnore(action, addToGitignore);
		for (let indey = 0; indey < targetVersions.length; indey++) {
			const targetVersion = targetVersions[indey];
			const versionName = rootApp.rootAppName + targetVersion.version.split(".")[1];
			const versionPath = `./examples/packages/${versionName}`;
			if (action === "create") {
				util.deleteFolderRecursive(versionPath);
				copyApps(rootAppPath, versionPath, targetVersion.version, targetVersion.port);
			}
			if (action === "delete") {
				util.deleteFolderRecursive(versionPath);
			}
		}
	}
}
function copyApps(versionPathRoot, versionPathNew, version, port) {
	// create folder if
	fs.mkdirSync(versionPathNew);
	util.copyDirectorySync(versionPathRoot, versionPathNew, "node_modules");
	// replace minimal version for ui5
	const path = `${versionPathNew}/webapp/manifest.json`;
	const manifest = fs.readFileSync(path, "utf8");
	let manifestData = JSON.parse(manifest);
	manifestData["sap.ui5"]["dependencies"]["minUI5Version"] = version;
	manifestData = JSON.stringify(manifestData, null, 2);
	fs.writeFileSync(path, manifestData, "utf8");
	// replace port number
	const pathPackageJson = `${versionPathNew}/package.json`;
	const packageJson = fs.readFileSync(pathPackageJson, "utf8");
	let packageJsonData = JSON.parse(packageJson);
	let startScript = packageJsonData["scripts"]["start"];
	startScript = startScript.replace(/\b\d{1,4}\b/, port);
	packageJsonData["scripts"]["start"] = startScript;
	packageJsonData = JSON.stringify(packageJsonData, null, 2);
	fs.writeFileSync(pathPackageJson, packageJsonData, "utf8");
}

// Read the .gitignore file

// Replace "test1" and "test2" with the strings you want to check for

// Replace "startMarker" and "endMarker" with the start and end markers you want to use
const startMarker = "# test apps start";
const endMarker = "# test apps end";

function updateGitIgnore(action, testStrings) {
	testStrings.forEach((str, index) => {
		if (str[0] === ".") {
			testStrings[index] = str.slice(1);
		}
	});
	// Read the .gitignore file
	fs.readFile(".gitignore", "utf8", (error, data) => {
		if (error) {
			console.error(error);
			return;
		}

		// Split the file into lines
		const lines = data.split("\n");

		// Find the start and end indices of the section we're interested in
		let startIndex = -1;
		let endIndex = -1;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i] === startMarker) {
				startIndex = i;
			} else if (lines[i] === endMarker) {
				endIndex = i;
				break;
			}
		}

		// If the start or end marker was not found, log an error and return
		if (startIndex === -1 || endIndex === -1) {
			console.error("Start or end marker not found");
			return;
		}

		// Add the test strings if the "add" parameter is truthy
		if (action === "create") {
			testStrings.forEach((testString) => {
				if (!lines.includes(testString)) {
					lines.splice(endIndex, 0, testString);
					endIndex++;
				}
			});
		}

		// Delete the specified strings if the "deleteStrings" parameter is truthy
		if (action === "delete") {
			testStrings.forEach((deleteString) => {
				const deleteIndex = lines.indexOf(deleteString);
				if (deleteIndex !== -1) {
					lines.splice(deleteIndex, 1);
					endIndex--;
				}
			});
		}

		// Write the modified lines back to the file
		fs.writeFile(".gitignore", lines.join("\n"), "utf8", (error) => {
			if (error) {
				console.error(error);
			}
		});
	});
}
