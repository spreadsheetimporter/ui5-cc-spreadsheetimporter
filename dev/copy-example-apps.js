const util = require("./util");
const replace = require("replace-in-file");
const fs = require("fs");
const yaml = require('js-yaml');
const action = process.argv[2];

const testAppFile = fs.readFileSync("./dev/testapps.json", "utf8");
let testAppData = JSON.parse(testAppFile);

testAppsAction(action);

function testAppsAction(action) {
	let addToGitignore = [];
	for (let index = 0; index < testAppData.length; index++) {
		const rootApp = testAppData[index];
		const rootAppPath = `${rootApp.path}${rootApp.rootAppName}`;
		const targetVersions = rootApp.copyVersions;
		replaceInFile(rootAppPath +"/webapp/i18n/i18n.properties",rootApp.appTitel)
		// change gitignore file before the copy action
		for (let indey = 0; indey < targetVersions.length; indey++) {
			const targetVersion = targetVersions[indey];
			const versionName = rootApp.rootAppName + targetVersion.version.split(".")[1];
			const versionPath = `${rootApp.path}${versionName}`;
			addToGitignore.push(versionPath);
		}
		updateGitIgnore(action, addToGitignore);
		// copy root apps with different versions
		for (let indey = 0; indey < targetVersions.length; indey++) {
			const targetVersion = targetVersions[indey];
			const versionName = rootApp.rootAppName + targetVersion.version.split(".")[1];
			const versionPath = `${rootApp.path}${versionName}`;
			if (action === "create") {
				util.deleteFolderRecursive(versionPath);
				copyApps(rootAppPath, versionPath, targetVersion.version, targetVersion.port, versionName);
				replaceInFile(versionPath +"/webapp/i18n/i18n.properties",targetVersion.appTitel)
			}
			if (action === "delete") {
				util.deleteFolderRecursive(versionPath);
			}
		}
	}
}
function copyApps(versionPathRoot, versionPathNew, version, port, versionName) {
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
	// replace ui5 version in yaml
	// Read YAML file
    const yamlPath = `${versionPathNew}/ui5.yaml`;
    const yamlData = fs.readFileSync(yamlPath, 'utf8');
    let doc = yaml.load(yamlData);
    // Replace version
	if(doc.framework && doc.framework.version){
		doc.framework.version = version;
		// Write YAML file
		let yamlStr = yaml.dump(doc);
		fs.writeFileSync(yamlPath, yamlStr, 'utf8');
	}
	// replace port number
	const pathPackageJson = `${versionPathNew}/package.json`;
	const packageJson = fs.readFileSync(pathPackageJson, "utf8");
	let packageJsonData = JSON.parse(packageJson);
	let startScript = packageJsonData["scripts"]["start"];
	startScript = startScript.replace(/\b\d{1,4}\b/, port);
	packageJsonData["scripts"]["start"] = startScript;
	// replace port number in scripts
	let startSilentScript = packageJsonData["scripts"]["start:silent"];
	startSilentScript = startSilentScript.replace(/\b\d{1,4}\b/, port);
	packageJsonData["scripts"]["start:silent"] = startSilentScript;
	let startFLPScript = packageJsonData["scripts"]["start-flp"];
	if (startFLPScript) {
		startFLPScript = startFLPScript.replace(/\b\d{1,4}\b/, port);
	packageJsonData["scripts"]["start-flp"] = startFLPScript;
	}
	// change package.json name
	packageJsonData["name"] = versionName;
	packageJsonData = JSON.stringify(packageJsonData, null, 2);
	fs.writeFileSync(pathPackageJson, packageJsonData, "utf8");
	// replace i18n title
	replaceInFile(`${versionPathNew}/webapp/i18n/i18n.properties`, 'appTitle=', 'appTitle=Test');
	// replace theme to sap_fiori_3 in 1.71 and 1.84
	if(version.split(".")[1] === "71" || version.split(".")[1] === "84"){
		util.searchAndReplace(`${versionPathNew}/webapp/test/flpSandbox.html`,/sap_horizon/g,"sap_fiori_3")
		util.searchAndReplace(`${versionPathNew}/webapp/index.html`,/sap_horizon/g,"sap_fiori_3")
	}
	// special script only for 1.71
	if(version.split(".")[1] === "71"){
		util.searchAndReplace(`${versionPathNew}/webapp/test/flpSandbox.html`,/<!-- only for 1.71 -->/g,`<script src="changes_preview.js"></script>`)
	}
	if(versionName.startsWith("ordersv4") && version.split(".")[1] === "84"){
		util.searchAndReplace(`${versionPathNew}/webapp/ext/ListReportExtController.js`, /this.editFlow.getView\(\)/g, `this._view`);
		util.searchAndReplace(`${versionPathNew}/webapp/ext/ObjectPageExtController.js`, /this.editFlow.getView\(\)/g, `this._view`);
	}
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
	fs.readFileSync(".gitignore", "utf8", (error, data) => {
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

function replaceInFile(filePath, replaceValue) {

    const i18n = fs.readFileSync(filePath, 'utf8')
    // Use a regular expression to match the line with the search value
    const regex = /^appTitle=.*/gm;
    // Replace the matched line with the replace value
    const result = i18n.replace(regex, (match) => {
        return 'appTitle=' + replaceValue;
    });
    // Write the modified contents back to the file
    fs.writeFileSync(filePath, result, 'utf8')
}


