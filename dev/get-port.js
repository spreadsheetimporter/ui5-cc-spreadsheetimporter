const fs = require("fs");

function getPortByAppVersion(rootAppName, versionMinor) {
	const testApps = fs.readFileSync("dev/testapps.json", "utf8");
	let json_data = JSON.parse(testApps);
	let port = undefined;

	// Iterate through the objects in the JSON data
	json_data.forEach((obj) => {
		if (obj.rootAppName === rootAppName) {
            if(versionMinor === 108){
                port = obj.port;
                return
            }
			obj.copyVersions.forEach((version) => {
				if (version.versionMinor === versionMinor) {
					port = version.port;
				}
			});
		}
	});
	return port;
}
const myMethod = (appName, version) => {
	return getPortByAppVersion(appName, parseInt(version));
};

console.log(myMethod(process.argv[2], process.argv[3]));
