const axios = require("axios");

function validateAlhpaNumericStartingWithLetter(sInput) {
	if (/^\d*[a-z][a-z0-9]*$/gi.test(sInput)) {
		return true;
	}
	return "Please use alpha numeric characters only.";
}

function validatHttpUrl(sInput) {
	var url;
	try {
		url = new URL(sInput);
	} catch (e) {
		return e.message;
	}

	if (url.protocol === "http:" || url.protocol === "https:") {
		return true;
	} else {
		return "Please provide a valid http(s) url.";
	}
}

function isArrayWithMoreThanOneElement(aElements) {
	return !!aElements && aElements.length > 1;
}

function findEntitySetValue(json, value, template) {
	const targets = json["sap.ui5"].routing.targets;
	for (const target in targets) {
		if (targets.hasOwnProperty(target)) {
			if (targets[target].name === template) {
				const entitySet = targets[target].options.settings.entitySet;
				if (entitySet === value) {
					return targets[target];
				}
			}
		}
	}
	return null;
}

function getUniqueEntitySetValues(json, template) {
	const entities = [];
	const targets = json["sap.ui5"]["routing"]["targets"];
	for (const target in targets) {
		if (targets[target].name === template) {
			if (
				targets[target].hasOwnProperty("options") &&
				targets[target].options.hasOwnProperty("settings") &&
				targets[target].options.settings.hasOwnProperty("entitySet")
			) {
				entities.push(targets[target].options.settings.entitySet);
			}
		}
	}
	return [...new Set(entities)];
}

async function getLatestVersion() {
	try {
		const response = await axios.get("https://registry.npmjs.org/ui5-cc-spreadsheetimporter");
		const latestVersion = response.data["dist-tags"].latest;
		return latestVersion;
	} catch (error) {
		console.error(error);
	}
}

module.exports = {
	validateAlhpaNumericStartingWithLetter,
	validatHttpUrl,
	isArrayWithMoreThanOneElement,
	findEntitySetValue,
	getUniqueEntitySetValues,
	getLatestVersion
};
