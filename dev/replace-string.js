/* eslint-disable no-undef */
const replace = require("replace-in-file");
const fs = require("fs");
const develop = process.argv.includes("--develop");

// Read the contents of the package.json file
const packageJson = fs.readFileSync("package.json", "utf8");

// Parse the JSON content
const packageData = JSON.parse(packageJson);

// Get the version from the parsed data
const version = `v${packageData.version}`;
const versionSlash = version.replaceAll(".", "/");

// copy result to webapp folder
if (!fs.existsSync("webapp")) {
	fs.mkdirSync("webapp");
}

function copyDirectorySync(src, dest) {
	const files = fs.readdirSync(src);

	for (const file of files) {
		const srcPath = `${src}/${file}`;
		const destPath = `${dest}/${file}`;

		if (fs.statSync(srcPath).isFile()) {
			fs.copyFileSync(srcPath, destPath);
		} else if (fs.statSync(srcPath).isDirectory()) {
			fs.mkdirSync(destPath, { recursive: true });
			copyDirectorySync(srcPath, destPath);
		}
	}
}

// replace strings in publish folder
const webappPromise = replaceWebappFolder(version, versionSlash);

const yamlPromise = replaceYamlFile(versionSlash);

function replaceYamlFile(versionSlash) {
	fs.copyFileSync("ui5-publish.yaml", "ui5.yaml");
	const optionsYaml = {
		files: ["**/ui5.yaml"],
		from: [/XXXnamespaceSlashXXX/g],
		to: [versionSlash],
	};
	return replace(optionsYaml);
}

function replaceWebappFolder(version, versionSlash) {
	// copyDirectorySync("src", "webapp");
	fs.copyFileSync("webapp/i18n/i18n_en.properties", "webapp/i18n/i18n.properties");
	const options = {
		files: ["**/webapp/**"],
		from: [/XXXnamespaceXXX/g, /XXXnamespaceSlashXXX/g],
		to: [version, versionSlash],
	};
	return replace(options);
}

// replace version in examples folder
function replaceVersionInExamples(versionSlash) {
	let ui5Apps = ["ordersv2fe", "ordersv2fenondraft", "ordersv2freestyle", "ordersv4fe", "ordersv4fpm"];
	let manifests = [];
	ui5Apps.forEach((app) => {
		let path = "examples/packages/" + app + "/webapp/manifest.json";
		// Read the contents of the package.json file
		let manifest = fs.readFileSync(path, "utf8");
		// Parse the JSON content
		let manifestData = JSON.parse(manifest);
		// Replace with current version
		manifestData["sap.ui5"].resourceRoots["cc.excelUpload"] = `./thirdparty/customControl/excelUpload/${versionSlash}`;
		// Stringify manifest data back to string
		manifestData = JSON.stringify(manifestData, null, 2);
		// Write back manifest file
		fs.writeFileSync(path, manifestData, "utf8");
	});
}

if (!develop) {
	replaceVersionInExamples(versionSlash);
}
