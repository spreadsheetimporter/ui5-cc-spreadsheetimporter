/* eslint-disable no-undef */
const fs = require("fs");
const yaml = require('js-yaml');
const util = require("./util")
const develop = process.argv.includes("--develop");

// Get the version from the parsed data
const path = "./packages/ui5-cc-excelUpload/package.json"
const version = util.getVersionDots(path)
const versionShort = util.getVersionDots(path).replaceAll(".", "")
const versionUnderscore = util.getVersionDots(path).replaceAll(".", "_")
const versionSlash = util.getVersionSlash(path)

// replace strings in publish folder
util.replaceYamlFileBuild(versionUnderscore, versionShort, versionUnderscore)
// create ui5.yaml with current version
util.replaceYamlFileComponent(versionUnderscore)
util.replaceYamlFileDeploy(versionUnderscore, versionUnderscore)
util.replaceVersionManifest(versionUnderscore)
// replace in docs
util.replaceSomething("docs/pages/GettingStartedTEMPLATE.md", "docs/pages/GettingStarted.md", ["**/docs/pages/GettingStarted.md"], [/XXXnamespaceXXX/g, /XXXnamespaceSlashXXX/g], [versionUnderscore, versionUnderscore])

replaceButton()


if (!develop) {
	let ui5Apps = ["ordersv2fe", "ordersv2fenondraft", "ordersv2freestylenondraft", "ordersv2freestylenondraftopenui5", "ordersv4fe", "ordersv4fpm"];
	util.replaceVersionInExamples(versionUnderscore, versionUnderscore, ui5Apps);
}

function replaceButton() {
	// Get the version from the parsed data
	const path = "./packages/ui5-cc-excelUpload-Button/package.json"
	const version = util.getVersionDots(path)
	const versionShort = version.replaceAll(".", "")
	const versionUnderscore = version.replaceAll(".", "_")
	const versionSlash = util.getVersionSlash(path)

	const namespace = `cc.excelUploadButton.${versionUnderscore}.ExcelUpload`

	const filePath = 'packages/ui5-cc-excelUpload-Button/ExcelUpload.js';
	const searchString = /Button\.extend\((["'])(?:(?!\1|\\.|\n).|\\.)*\1\s*,\s*{/s;
	const replacementString = `Button.extend("${namespace}", {`;

	let code = fs.readFileSync(filePath, 'utf8');

	code = code.replace(searchString, replacementString);

	fs.writeFileSync(filePath, code, 'utf8');

	// Load the ui5-build.yaml file
	const pathYaml = './packages/ui5-cc-excelUpload-Button/ui5.yaml'
	const fileContents = fs.readFileSync(pathYaml, 'utf8');

	// Parse the YAML into a JavaScript object
	const ui5Build = yaml.load(fileContents);
	const key = "/thirdparty/customControl/excelUploadButton/" + versionUnderscore + "/"
	// Replace the values
	ui5Build.resources.configuration.paths = {
		[key]: "./"
	};


	// Serialize the modified object back to YAML
	const updatedYaml = yaml.dump(ui5Build);

	// Save the updated ui5-build.yaml file
	fs.writeFileSync(pathYaml, updatedYaml, 'utf8');
}