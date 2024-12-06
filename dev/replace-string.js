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
const versionDash = util.getVersionDots(path).replaceAll(".", "-")

// replace strings in publish folder
util.replaceYamlFileBuild(versionUnderscore, versionShort, versionUnderscore,'./packages/ui5-cc-spreadsheetimporter/ui5-build.yaml')
util.replaceYamlFileBuild(versionUnderscore, versionShort, versionUnderscore,'./packages/ui5-cc-spreadsheetimporter/ui5-build-dev.yaml')
util.replaceYamlFileServe(versionUnderscore, versionShort, versionUnderscore,'./packages/ui5-cc-spreadsheetimporter/ui5-serve.yaml')
util.replaceYamlFileCF(versionUnderscore, versionShort, versionUnderscore,'./packages/ui5-cc-spreadsheetimporter/ui5-deploy-cf.yaml')
updateVersionDocs.updateVersionInFile('./packages/ui5-cc-spreadsheetimporter/ui5-serve.yaml', versionUnderscore, versionUnderscore)
updateVersionDocs.updateVersionInFile('./packages/ui5-cc-spreadsheetimporter/mta.yaml', versionUnderscore, versionUnderscore)
// create ui5.yaml with current version
util.replaceYamlFileComponent(versionUnderscore,'./packages/ui5-cc-spreadsheetimporter/ui5.yaml')
util.replaceYamlFileDeploy(versionUnderscore, versionUnderscore)
util.replaceVersionManifest(versionUnderscore)
util.replaceMetadataName(versionDash)
util.updateManifestVersion(version)

// replace in docs
updateVersionDocs.updateVersions(versionUnderscore)

if (!develop) {
	let ui5Apps = ["ordersv2fe", "ordersv2fenondraft", "ordersv2freestylenondraft", "ordersv2freestylenondraftopenui5", "ordersv4fe", "ordersv4fpm", "ordersv4fets", "anyupload", "ordersv4freestyle"];
	util.replaceVersionInExamples(versionUnderscore, versionUnderscore, ui5Apps);
}