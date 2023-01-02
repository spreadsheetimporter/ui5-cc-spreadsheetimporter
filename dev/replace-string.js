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
	copyDirectorySync("src", "webapp");
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
	// Read the contents of the package.json file
	const manifestV4 = fs.readFileSync("examples/packages/orders/webapp/manifest.json", "utf8");
	// Parse the JSON content
	let manifestV4Data = JSON.parse(manifestV4);
	// Read the contents of the package.json file
	const manifestV2 = fs.readFileSync("examples/packages/ordersv2/webapp/manifest.json", "utf8");
	// Parse the JSON content
	let manifestV2Data = JSON.parse(manifestV2);

	manifestV4Data["sap.ui5"].resourceRoots["cc.excelUpload"] = `./thirdparty/customControl/excelUpload/${versionSlash}`;
	manifestV2Data["sap.ui5"].resourceRoots["cc.excelUpload"] = `./thirdparty/customControl/excelUpload/${versionSlash}`;

	manifestV4Data = JSON.stringify(manifestV4Data, null, 2);
	manifestV2Data = JSON.stringify(manifestV2Data, null, 2);

	fs.writeFileSync("examples/packages/orders/webapp/manifest.json", manifestV4Data, "utf8");
	fs.writeFileSync("examples/packages/ordersv2/webapp/manifest.json", manifestV2Data, "utf8");
}

if (!develop) {
	replaceVersionInExamples(versionSlash);
}
