var pkg = require('../package.json');

for (var packageName in pkg.optionalDependencies) {
	if (packageName.indexOf('pact-mock-service') !== -1 || packageName.indexOf('pact-provider-verifier') !== -1) {
		try {
			require.resolve(packageName);
			console.info("Platform specific dependency '" + packageName + "' installed successful");
			process.exit(0);
			break;
		} catch (e) {
			console.log(e);
		}
	}
}

console.error("pact-node: Cannot resolve OS specific pact module. Download/install must of failed, please try again.");
process.exit(1);
