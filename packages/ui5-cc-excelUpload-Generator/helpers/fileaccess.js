const objectAssignDeep = require("object-assign-deep"),
	yaml = require("yaml"),
	fs = require("fs");

exports.getJSON = function (filePath) {
	try {
		const fullFilePath = process.cwd() + filePath;
		try {
			fs.accessSync(fullFilePath, fs.constants.F_OK);
			const fileData = fs.readFileSync(fullFilePath, "utf-8");
			const parsedData = JSON.parse(fileData);
			return parsedData;
		} catch (error) {
			console.error(`Error: ${filePath} does not exist or could not be read`);
		}
	} catch (e) {
		// this.log(`Error getting JSON file of the ${filePath} file: ${e}`);
		throw e;
	}
};

// overide can be an object or a function that receives the current object
exports.writeJSON = async function (filePath, override) {
	try {
		const fullFilePath = process.cwd() + filePath;
		let oldContent = {};
		if (this.fs.exists(fullFilePath)) {
			oldContent = this.fs.readJSON(fullFilePath);
		}

		const newContent =
			typeof override === "function"
				? override(oldContent)
				: objectAssignDeep.withOptions(oldContent, [override], { arrayBehaviour: "merge" });

		this.fs.writeFile(fullFilePath, JSON.stringify(newContent, null, 2));
		if (!this.options.isSubgeneratorCall && this.config.get("setupCompleted")) {
			this.log(`Updated file: ${filePath}`);
		}
	} catch (e) {
		this.log(`Error during the manipulation of the ${filePath} file: ${e}`);
		throw e;
	}
};

// overide can be an object or a function that receives the current object
exports.writeYAML = async function (filePath, override) {
	try {
		const fullFilePath = process.cwd() + filePath;
		let oldContent = {};
		if (this.fs.exists(fullFilePath)) {
			oldContent = yaml.parse(this.fs.read(fullFilePath));
		}

		const newContent =
			typeof override === "function"
				? override(oldContent)
				: objectAssignDeep.withOptions(oldContent, [override], { arrayBehaviour: "merge" });

		this.fs.write(fullFilePath, yaml.stringify(newContent, null, 2));

		if (!this.options.isSubgeneratorCall && this.config.get("setupCompleted")) {
			this.log(`Updated file: ${filePath}`);
		}
	} catch (e) {
		this.log(`Error during the manipulation of the ${filePath} file: ${e}`);
		throw e;
	}
};

// overide can be an object or a function that receives the current object
exports.manipulateJSON = async function (filePath, override) {
	try {
		const fullFilePath = process.cwd() + filePath;
		const oldContent = this.fs.readJSON(fullFilePath);

		const newContent =
			typeof override === "function"
				? override(oldContent)
				: objectAssignDeep.withOptions(oldContent, [override], { arrayBehaviour: "merge" });

		this.fs.writeJSON(fullFilePath, newContent);
		if (!this.options.isSubgeneratorCall && this.config.get("setupCompleted")) {
			this.log(`Updated file: ${filePath}`);
		}
	} catch (e) {
		this.log(`Error during the manipulation of the ${filePath} file: ${e}`);
		throw e;
	}
};

// overide can be an object or a function that receives the current object
exports.manipulateYAML = async function (filePath, override) {
	try {
		const fullFilePath = process.cwd() + filePath;
		const oldContent = yaml.parse(this.fs.read(fullFilePath));

		const newContent =
			typeof override === "function"
				? override(oldContent)
				: objectAssignDeep.withOptions(oldContent, [override], { arrayBehaviour: "merge" });

		this.fs.write(fullFilePath, yaml.stringify(newContent, null, 2));

		!this.options.isSubgeneratorCall && this.log(`Updated file: ${filePath}`);
	} catch (e) {
		this.log(`Error during the manipulation of the ${filePath} file: ${e}`);
		throw e;
	}
};
