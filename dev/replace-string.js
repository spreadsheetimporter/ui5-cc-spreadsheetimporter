/* eslint-disable no-undef */
const replace = require("replace-in-file");
const fs = require("fs");

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

copyDirectorySync("src", "webapp");

// Read the contents of the package.json file
const packageJson = fs.readFileSync("package.json", "utf8");

// Parse the JSON content
const packageData = JSON.parse(packageJson);

// Get the version from the parsed data
const version = `v${packageData.version}`;
const versionSlash = version.replaceAll(".", "/");

// replace strings in publish folder
const options = {
	files: ["**/webapp/**"],
	from: [/XXXnamespaceXXX/g, /XXXnamespaceSlashXXX/g],
	to: [version, versionSlash],
};
replace.sync(options);

fs.copyFileSync("ui5-publish.yaml", "ui5.yaml");

const optionsYaml = {
	files: ["**/ui5.yaml"],
	from: [/XXXnamespaceSlashXXX/g],
	to: [versionSlash],
};
replace.sync(optionsYaml);

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
