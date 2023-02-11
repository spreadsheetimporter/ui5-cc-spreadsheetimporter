/* eslint-disable no-undef */
const util = require("./util")
const develop = process.argv.includes("--develop");

// Get the version from the parsed data
const version = util.getVersionDots()
const versionShort = util.getVersionDots().replaceAll(".", "")
const versionSlash = util.getVersionSlash()

// replace strings in publish folder
util.replaceSomething("webapp/i18n/i18n_en.properties", "webapp/i18n/i18n.properties",["**/webapp/**"],[/XXXnamespaceXXX/g, /XXXnamespaceSlashXXX/g],[version, versionSlash])
// create ui5.yaml with current version
util.replaceSomething("ui5-publish.yaml", "ui5.yaml",["**/ui5.yaml"],[/XXXnamespaceSlashXXX/g],[versionSlash])
util.replaceSomething("ui5-deploy-publish.yaml", "ui5-deploy.yaml",["**/ui5-deploy.yaml"],[/XXXnamespaceShortXXX/g],[versionShort])
// replace in docs
util.replaceSomething("docs/pages/GettingStartedTEMPLATE.md", "docs/pages/GettingStarted.md",["**/docs/pages/GettingStarted.md"],[/XXXnamespaceXXX/g, /XXXnamespaceSlashXXX/g],[version, versionSlash])


if (!develop) {
	let ui5Apps = ["ordersv2fe", "ordersv2fenondraft", "ordersv2freestyle", "ordersv4fe", "ordersv4fpm"];
	util.replaceVersionInExamples(versionSlash, version, ui5Apps);
}