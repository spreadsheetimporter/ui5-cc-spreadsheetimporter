// removes duplicates from an array
exports.removeDuplicates = function (aArray) {
	let sourceSet = new Set(aArray);
	let reducedSet = sourceSet.values();
	return Array.from(reducedSet);
};

exports.transformToPathWithLeadingSlash = function (sFilePath) {
	const regexCUT = /^[\.]?\/?([^.]+[\.]?[^.]+|)\/?$/;
	let result = sFilePath.replace(regexCUT, "/$1") || "./";
	return result;
};
