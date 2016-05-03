var pkg = require('../package.json');
var success = false;
var packageName;
for (packageName in pkg.optionalDependencies) {
	if (packageName.indexOf('pact-mock-service') !== -1) {
		try {
			require.resolve(packageName);
			success = true;
			break;
		} catch (e) {}
	}
}

if(success) {
	console.info("pact-node: Platform specific dependency '" + packageName + "' installed successful");
	process.exit(0);
}else{
	console.error("pact-node: Cannot resolve module '" + packageName + "'. Download/install must of failed, please try again.");
	process.exit(1);
}
