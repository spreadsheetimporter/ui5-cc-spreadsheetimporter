// removes duplicates from an array
exports.removeDuplicates = function (aArray) {
	const sourceSet = new Set(aArray);
	const reducedSet = sourceSet.values();
	return Array.from(reducedSet);
};

exports.transformToPathWithLeadingSlash = function (sFilePath) {
	const regexCUT = /^[\.]?\/?([^.]+[\.]?[^.]+|)\/?$/;
	const result = sFilePath.replace(regexCUT, "/$1") || "./";
	return result;
};
