/* eslint-disable no-undef */
const util = require("./util")
const develop = process.argv.includes("--develop");

// Get the version from the parsed data
const version = util.getVersionDots()
const versionSlash = util.getVersionSlash()

// replace strings in publish folder
const webappPromise = util.replaceWebappFolder(version, versionSlash);
// create ui5.yaml with current version
const yamlPromise = util.replaceYamlFile(versionSlash);


if (!develop) {
	let ui5Apps = ["ordersv2fe", "ordersv2fenondraft", "ordersv2freestyle", "ordersv4fe", "ordersv4fpm"];
	util.replaceVersionInExamples(versionSlash, version, ui5Apps);
}