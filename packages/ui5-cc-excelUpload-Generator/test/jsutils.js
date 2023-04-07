const assert = require("yeoman-assert");
const jsUtils = require("../helpers/jsutils");

describe("", function () {
	it("Should transform file path to relative path", function () {
		assert.textEqual(jsUtils.transformToPathWithLeadingSlash("path/file"), "/path/file");
		assert.textEqual(jsUtils.transformToPathWithLeadingSlash("/path/file"), "/path/file");
		assert.textEqual(jsUtils.transformToPathWithLeadingSlash("./path/file"), "/path/file");
		assert.textEqual(jsUtils.transformToPathWithLeadingSlash("path/file.js"), "/path/file.js");
		assert.textEqual(jsUtils.transformToPathWithLeadingSlash(""), "/");
	});
});
