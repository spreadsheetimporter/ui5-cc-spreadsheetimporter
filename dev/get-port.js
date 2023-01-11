const util = require("./util");
const myMethod = (appName, version) => {
	return util.getPortByAppVersion(appName, parseInt(version));
};
console.log(myMethod(process.argv[2], process.argv[3]));
