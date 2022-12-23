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
const version = packageData.version;

// replace strings
const options = {
	// files: [
	// 		"**/*.html",
	// 		"**/*.json",
	// 		"**/*.js",
	// 		"**/*.xml"
	// ],
	files: ["**/webapp/**"],
	from: [/XXXnamespaceXXX/g, /XXXnamespaceSlashXXX/g],
	to: ["v0.3.4", "v0/3/4"],
};
replace.sync(options);
