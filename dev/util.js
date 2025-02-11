const fs = require("fs");
const path = require('path')
const yaml = require('js-yaml');

async function getReplaceInFile() {
    return await import('replace-in-file');
}

function copyDirectorySync(src, dest, excludedFolder) {
	const files = fs.readdirSync(src);

	for (const file of files) {
		const srcPath = `${src}/${file}`;
		const destPath = `${dest}/${file}`;

		if (file === excludedFolder) {
			continue;
		}

		if (fs.statSync(srcPath).isFile()) {
			fs.copyFileSync(srcPath, destPath);
		} else if (fs.statSync(srcPath).isDirectory()) {
			fs.mkdirSync(destPath, { recursive: true });
			copyDirectorySync(srcPath, destPath, excludedFolder);
		}
	}
}

async function replaceSomething(copyFrom, copyTo, files, from, to) {
    fs.copyFileSync(copyFrom, copyTo);
    const replace = await getReplaceInFile();
    const options = {
        files: files,
        from: from,
        to: to,
    };
    return replace.default.sync(options);
}

// replace version in examples folder
function replaceVersionInExamples(versionSlash, version, ui5Apps) {
	let manifests = [];
	ui5Apps.forEach((app) => {
		let rootPath = "examples/packages/" + app + "/";
		replaceVersioninApp(app, version, versionSlash, rootPath);
	});
}

function replaceVersioninApp(app, version, versionSlash, rootPath) {
	let path = rootPath + "webapp/manifest.json";
	// Read the contents of the package.json file
	let manifest = fs.readFileSync(path, "utf8");
	// Parse the JSON content
	let manifestData = JSON.parse(manifest);
	// Replace with current version
	const resourceRoots = manifestData["sap.ui5"].resourceRoots;
	const updatedResourceRoots = {};
	Object.keys(resourceRoots)
		.filter(key => !key.startsWith("cc.spreadsheetimporter"))
		.forEach(key => {
			updatedResourceRoots[key] = resourceRoots[key];
		});
	updatedResourceRoots[`cc.spreadsheetimporter.${version}`] = `./thirdparty/customcontrol/spreadsheetimporter/${versionSlash}`;
	// add to every app even if it is not used
	manifestData["sap.ui5"].resourceRoots = updatedResourceRoots;
	manifestData["sap.ui5"]["componentUsages"]["spreadsheetImporter"].name = `cc.spreadsheetimporter.${version}`;
	if(manifestData["sap.ui5"]["dependencies"]["components"]){
		manifestData["sap.ui5"]["dependencies"]["components"] = {};
		manifestData["sap.ui5"]["dependencies"]["components"][`cc.spreadsheetimporter.${version}`] = {};
	}
	
	// Stringify manifest data back to string
	manifestData = JSON.stringify(manifestData, null, 2);
	// Write back manifest file
	fs.writeFileSync(path, manifestData, "utf8");
}

function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach((file) => {
			const curPath = `${path}/${file}`;
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

function getPackageJson(path) {
	// Read the contents of the package.json file
	const packageJson = fs.readFileSync(path, "utf8");

	// Parse the JSON content
	return JSON.parse(packageJson);
}

function getVersionDots(path) {
	const packageData = getPackageJson(path);
	// Get the version from the parsed data
	return `v${packageData.version}`;
}

function getVersionSlash(path) {
	const version = getVersionDots(path);
	return version.replaceAll(".", "/");
}
function searchAndReplace(inputFile, search, replace) {
	const file = fs.readFileSync(inputFile, "utf8");
	let result = file.replace(search, replace);

	fs.writeFileSync(inputFile, result, "utf8");
}

function getTestappObject(scenario, version) {
	const testApps = fs.readFileSync(path.resolve(__dirname, 'testapps.json'), 'UTF-8');
	// const testApps = fs.readFileSync("./dev/testapps.json", "utf8");
	let json_data = JSON.parse(testApps);
	version = parseInt(version)

	for (let index = 0; index < json_data.length; index++) {
		const element = json_data[index];
		if (element.rootAppName === scenario) {
			const rootObject = element;
			if (rootObject.versionMinor === version) {
				return rootObject;
			} else {
				const rootVersions = rootObject.copyVersions
				for (let index = 0; index < rootVersions.length; index++) {
					const subObject = rootVersions[index];
					if (subObject.versionMinor === version) {
						subObject.rootAppObject = rootObject;
						return subObject;
					}
				}
			}
			break;
		}
	}
}

function replaceYamlFileBuild(version, versionShort, versionSlash, filePath) {
    // Load the specified yaml file
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Parse the YAML into a JavaScript object
    const ui5Build = yaml.load(fileContents);

    // Replace the values
    ui5Build.builder.customTasks.forEach(task => {
        if (task.name === 'ui5-tooling-stringreplace-task') {
            task.configuration.replace.forEach(replacement => {
                if (replacement.placeholder === 'XXXnamespaceXXX') {
                    replacement.value = version;
                }
                if (replacement.placeholder === 'XXXnamespaceShortXXX') {
                    replacement.value = versionShort;
                }
                if (replacement.placeholder === 'XXXnamespaceSlashXXX') {
                    replacement.value = versionSlash;
                }
            });
        }
    });

    // Serialize the modified object back to YAML
    const updatedYaml = yaml.dump(ui5Build, { lineWidth: -1 });

    // Save the updated file
    fs.writeFileSync(filePath, updatedYaml, 'utf8');
}

function replaceYamlFileServe(version, versionShort, versionSlash, filePath) {
    // Load the specified yaml file
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Parse the YAML into a JavaScript object
    const ui5Build = yaml.load(fileContents);

    // Replace the values
    ui5Build.server.customMiddleware.forEach(task => {
        if (task.name === 'ui5-tooling-stringreplace-middleware') {
            task.configuration.replace.forEach(replacement => {
                if (replacement.placeholder === 'XXXnamespaceXXX') {
                    replacement.value = version;
                }
                if (replacement.placeholder === 'XXXnamespaceShortXXX') {
                    replacement.value = versionShort;
                }
                if (replacement.placeholder === 'XXXnamespaceSlashXXX') {
                    replacement.value = versionSlash;
                }
            });
        }
    });

    // Serialize the modified object back to YAML
    const updatedYaml = yaml.dump(ui5Build, { lineWidth: -1 });

    // Save the updated file
    fs.writeFileSync(filePath, updatedYaml, 'utf8');
}

function replaceYamlFileCF(version, versionShort, versionSlash, filePath) {
    // Load the specified yaml file
    const fileContents = fs.readFileSync(filePath, 'utf8');

    // Parse the YAML into a JavaScript object
    const ui5Build = yaml.load(fileContents);

    // Replace the values
    ui5Build.builder.customTasks.forEach(task => {
        if (task.name === 'ui5-tooling-stringreplace-task') {
            task.configuration.replace.forEach(replacement => {
                if (replacement.placeholder === 'XXXnamespaceXXX') {
                    replacement.value = version;
                }
                if (replacement.placeholder === 'XXXnamespaceShortXXX') {
                    replacement.value = versionShort;
                }
                if (replacement.placeholder === 'XXXnamespaceSlashXXX') {
                    replacement.value = versionSlash;
                }
            });
        }
    });

    // Serialize the modified object back to YAML
    const updatedYaml = yaml.dump(ui5Build, { lineWidth: -1 });

    // Save the updated file
    fs.writeFileSync(filePath, updatedYaml, 'utf8');
}

function replaceYamlFileComponent(versionSlash, path) {
	// Load the ui5-build.yaml file
	const fileContents = fs.readFileSync(path, 'utf8');

	// Parse the YAML into a JavaScript object
	const ui5Build = yaml.load(fileContents);
	const key = "/thirdparty/customcontrol/spreadsheetimporter/" + versionSlash + "/"
	// Replace the values
	ui5Build.resources.configuration.paths = {
		[key]: "./dist/"
	};


	// Serialize the modified object back to YAML
	const updatedYaml = yaml.dump(ui5Build);

	// Save the updated ui5-build.yaml file
	fs.writeFileSync(path, updatedYaml, 'utf8');

}

function replaceYamlFileDeploy(version, versionShort) {
	// Load the ui5-build.yaml file
	const fileContents = fs.readFileSync('./packages/ui5-cc-spreadsheetimporter/ui5-deploy.yaml', 'utf8');

	// Parse the YAML into a JavaScript object
	const ui5Build = yaml.load(fileContents);

	// Replace the values
	// Update the paths
	ui5Build.metadata.name = `cc.spreadsheetimporter.${version}`
	ui5Build.builder.customTasks.forEach(task => {
		if (task.name === 'deploy-to-abap') {
			task.configuration.app.name = `Z_XUP_${versionShort}`
		}
	});


	// Serialize the modified object back to YAML
	const updatedYaml = yaml.dump(ui5Build, { lineWidth: -1 });

	// Save the updated ui5-build.yaml file
	fs.writeFileSync('./packages/ui5-cc-spreadsheetimporter/ui5-deploy.yaml', updatedYaml, 'utf8');

}

function replaceVersionManifest(version) {
	// Read the JSON file
	const jsonFile = fs.readFileSync('./packages/ui5-cc-spreadsheetimporter/src/manifest.json', 'utf8');
	const jsonData = JSON.parse(jsonFile);
	// Replace the version

	jsonData['sap.app']['id'] = `cc.spreadsheetimporter.${version}`;
	jsonData['sap.cloud']['service'] = `spreadsheetimporter_${version}`;
	jsonData['sap.ui5']['componentName'] = `cc.spreadsheetimporter.${version}`;
	jsonData['sap.ui5']['models']['i18n']['settings']['bundleName'] = `cc.spreadsheetimporter.${version}.i18n.i18n`;

	// Write the updated JSON to file
	fs.writeFileSync('./packages/ui5-cc-spreadsheetimporter/src/manifest.json', JSON.stringify(jsonData, null, 2));
}

function deleteNodeModules(folderPath) {
	const stack = [folderPath];

	while (stack.length) {
		const curPath = stack.pop();

		if (fs.existsSync(curPath)) {
			const files = fs.readdirSync(curPath);

			for (const file of files) {
				const filePath = path.join(curPath, file);

				if (fs.lstatSync(filePath).isDirectory()) {
					stack.push(filePath);
				} else {
					fs.unlinkSync(filePath);
				}
			}

			fs.rmdirSync(curPath);
		}
	}
}

function replaceMetadataName(versionDash){
	// replace the metadata in yaml packages/ui5-cc-spreadsheetimporter/ui5.yaml
	const fileContents = fs.readFileSync('./packages/ui5-cc-spreadsheetimporter/ui5.yaml', 'utf8');
	const ui5Build = yaml.load(fileContents);
	ui5Build.metadata.name = `ui5-cc-spreadsheetimporter-${versionDash}`
	const updatedYaml = yaml.dump(ui5Build, { lineWidth: -1 });
	fs.writeFileSync('./packages/ui5-cc-spreadsheetimporter/ui5.yaml', updatedYaml, 'utf8');
}

function updateManifestVersion(version){
	// remove 'v' from version
	version = version.replace('v', '');
	// Read the JSON file
	const jsonFile = fs.readFileSync('./packages/ui5-cc-spreadsheetimporter/src/manifest.json', 'utf8');
	const jsonData = JSON.parse(jsonFile);
	// Replace the version
	jsonData['sap.app']['applicationVersion']['version'] = version;
	// Write the updated JSON to file
	fs.writeFileSync('./packages/ui5-cc-spreadsheetimporter/src/manifest.json', JSON.stringify(jsonData, null, 2));

}

function replaceReleasePleaseManifest(version){
	// remove 'v' from version
	version = version.replace('v', '');
	// Define the file path for the .release-please-manifest.json file
	const filePath = './.release-please-manifest.json';

	// Read the JSON file
	const jsonFile = fs.readFileSync(filePath, 'utf8');
	const jsonData = JSON.parse(jsonFile);
	
	// Replace the version for the package "packages/ui5-cc-spreadsheetimporter"
	const packageName = "packages/ui5-cc-spreadsheetimporter";
	jsonData[packageName] = version;

	// Write the updated JSON back to the .release-please-manifest.json file
	fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf8");
}



module.exports.getPackageJson = getPackageJson;
module.exports.getVersionDots = getVersionDots;
module.exports.getVersionSlash = getVersionSlash;
module.exports.replaceVersionInExamples = replaceVersionInExamples;
module.exports.replaceSomething = replaceSomething;
module.exports.copyDirectorySync = copyDirectorySync;
module.exports.deleteFolderRecursive = deleteFolderRecursive;
module.exports.searchAndReplace = searchAndReplace;
module.exports.getTestappObject = getTestappObject;
module.exports.replaceYamlFileBuild = replaceYamlFileBuild;
module.exports.replaceYamlFileDeploy = replaceYamlFileDeploy;
module.exports.replaceYamlFileServe = replaceYamlFileServe;
module.exports.replaceYamlFileCF = replaceYamlFileCF;
module.exports.replaceYamlFileComponent = replaceYamlFileComponent;
module.exports.replaceVersionManifest = replaceVersionManifest;
module.exports.deleteNodeModules = deleteNodeModules;
module.exports.replaceMetadataName = replaceMetadataName;
module.exports.updateManifestVersion = updateManifestVersion;
module.exports.replaceReleasePleaseManifest = replaceReleasePleaseManifest;