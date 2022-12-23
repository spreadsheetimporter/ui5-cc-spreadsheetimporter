/* eslint-disable no-undef */
const replace = require("replace-in-file");
const results = replace.sync({
	files: "path/to/files/*.html",
	from: /foo/g,
	to: "bar",
	countMatches: true,
});
