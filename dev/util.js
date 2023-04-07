const replace = require("replace-in-file");
const fs = require("fs");
const path = require('path')
const yaml = require('js-yaml');

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

function replaceSomething(copyFrom, copyTo, files, from, to) {
	fs.copyFileSync(copyFrom, copyTo);
	const options = {
		files: files,
		from: from,
		to: to,
	};
	return replace.sync(options);
}

// replace version in examples folder
function replaceVersionInExamples(versionSlash, version, ui5Apps) {
	let manifests = [];
	ui5Apps.forEach((app) => {
		let path = "examples/packages/" + app + "/webapp/manifest.json";
		// Read the contents of the package.json file
		let manifest = fs.readFileSync(path, "utf8");
		// Parse the JSON content
		let manifestData = JSON.parse(manifest);
		// Replace with current version
		const resourceRoots = manifestData["sap.ui5"].resourceRoots;
		const updatedResourceRoots = {};
		Object.keys(resourceRoots)
			.filter(key => !key.startsWith("cc.excelUpload"))
			.forEach(key => {
				updatedResourceRoots[key] = resourceRoots[key];
			});
		updatedResourceRoots[`cc.excelUpload.${version}`] = `./thirdparty/customControl/excelUpload/${versionSlash}`;
		manifestData["sap.ui5"].resourceRoots = updatedResourceRoots
		manifestData["sap.ui5"]["componentUsages"]["excelUpload"].name = `cc.excelUpload.${version}`;
		// Stringify manifest data back to string
		manifestData = JSON.stringify(manifestData, null, 2);
		// Write back manifest file
		fs.writeFileSync(path, manifestData, "utf8");
	});
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

function getPackageJson() {
	// Read the contents of the package.json file
	const packageJson = fs.readFileSync("./packages/ui5-cc-excelUpload/package.json", "utf8");

	// Parse the JSON content
	return JSON.parse(packageJson);
}

function getVersionDots() {
	const packageData = getPackageJson();
	// Get the version from the parsed data
	return `v${packageData.version}`;
}

function getVersionSlash() {
	const version = getVersionDots();
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
						return subObject;
					}
				}
			}
			break;
		}
	}
}

function replaceYamlFileBuild(version, versionShort, versionSlash) {
	// Load the ui5-build.yaml file
	const fileContents = fs.readFileSync('./packages/ui5-cc-excelUpload/ui5-build.yaml', 'utf8');

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

	// Save the updated ui5-build.yaml file
	fs.writeFileSync('./packages/ui5-cc-excelUpload/ui5-build.yaml', updatedYaml, 'utf8');

}

function replaceYamlFileComponent(versionSlash) {
	// Load the ui5-build.yaml file
	const fileContents = fs.readFileSync('./packages/ui5-cc-excelUpload/ui5.yaml', 'utf8');

	// Parse the YAML into a JavaScript object
	const ui5Build = yaml.load(fileContents);
	const key = "/thirdparty/customControl/excelUpload/" + versionSlash + "/"
	// Replace the values
	ui5Build.resources.configuration.paths = {
		[key]: "./dist/"
	  };


	// Serialize the modified object back to YAML
	const updatedYaml = yaml.dump(ui5Build);

	// Save the updated ui5-build.yaml file
	fs.writeFileSync('./packages/ui5-cc-excelUpload/ui5.yaml', updatedYaml, 'utf8');

}

function replaceYamlFileDeploy(version, versionShort) {
	// Load the ui5-build.yaml file
	const fileContents = fs.readFileSync('./packages/ui5-cc-excelUpload/ui5-deploy.yaml', 'utf8');

	// Parse the YAML into a JavaScript object
	const ui5Build = yaml.load(fileContents);

	// Replace the values
	// Update the paths
	ui5Build.metadata.name = `cc.excelUpload.${version}`
	ui5Build.builder.customTasks.forEach(task => {
		if (task.name === 'deploy-to-abap') {
			task.configuration.app.name = `Z_XUP_${versionShort}`
		}
	});


	// Serialize the modified object back to YAML
	const updatedYaml = yaml.dump(ui5Build, { lineWidth: -1 });

	// Save the updated ui5-build.yaml file
	fs.writeFileSync('./packages/ui5-cc-excelUpload/ui5-deploy.yaml', updatedYaml, 'utf8');

}

function replaceVersionManifest(version) {
	// Read the JSON file
	const jsonFile = fs.readFileSync('./packages/ui5-cc-excelUpload/src/manifest.json', 'utf8');
	const jsonData = JSON.parse(jsonFile);
	// Replace the version

	jsonData['sap.app']['id'] = `cc.excelUpload.${version}`;
	jsonData['sap.ui5']['componentName'] = `cc.excelUpload.${version}`;
	jsonData['sap.ui5']['models']['i18n']['settings']['bundleName'] = `cc.excelUpload.${version}.i18n.i18n`;

	// Write the updated JSON to file
	fs.writeFileSync('./packages/ui5-cc-excelUpload/src/manifest.json', JSON.stringify(jsonData, null, 2));
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
module.exports.replaceYamlFileComponent = replaceYamlFileComponent;
module.exports.replaceVersionManifest = replaceVersionManifest;
module.exports.deleteNodeModules = deleteNodeModules;
