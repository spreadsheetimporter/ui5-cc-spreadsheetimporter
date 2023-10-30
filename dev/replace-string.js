/* eslint-disable no-undef */
const fs = require("fs");
const yaml = require('js-yaml');
const util = require("./util")
const updateVersionDocs = require("./update-version-docs")
const develop = process.argv.includes("--develop");

// Get the version from the parsed data
const path = "./packages/ui5-cc-spreadsheetimporter/package.json"
const version = util.getVersionDots(path)
const versionShort = util.getVersionDots(path).replaceAll(".", "")
const versionUnderscore = util.getVersionDots(path).replaceAll(".", "_")

// replace strings in publish folder
util.replaceYamlFileBuild(versionUnderscore, versionShort, versionUnderscore,'./packages/ui5-cc-spreadsheetimporter/ui5-build.yaml')
util.replaceYamlFileBuild(versionUnderscore, versionShort, versionUnderscore,'./packages/ui5-cc-spreadsheetimporter/ui5-build-dev.yaml')
util.replaceYamlFileServe(versionUnderscore, versionShort, versionUnderscore,'./packages/ui5-cc-spreadsheetimporter/ui5-serve.yaml')
updateVersionDocs.updateVersionInFile('./packages/ui5-cc-spreadsheetimporter/ui5-serve.yaml', versionUnderscore, versionUnderscore)
// create ui5.yaml with current version
util.replaceYamlFileComponent(versionUnderscore,'./packages/ui5-cc-spreadsheetimporter/ui5.yaml')
util.replaceYamlFileDeploy(versionUnderscore, versionUnderscore)
util.replaceVersionManifest(versionUnderscore)

// replace in docs
updateVersionDocs.updateVersions(versionUnderscore)

if (!develop) {
	let ui5Apps = ["ordersv2fe", "ordersv2fenondraft", "ordersv2freestylenondraft", "ordersv2freestylenondraftopenui5", "ordersv4fe", "ordersv4fpm", "ordersv4fets"];
	util.replaceVersionInExamples(versionUnderscore, versionUnderscore, ui5Apps);
}