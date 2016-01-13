var arch = "";
if (process.platform === 'linux') {
	arch = '-' + process.arch;
}
var packageName = 'pact-mock-service-' + process.platform + arch;

// Check to see if we can resolve the proper package for this computer
try {
	require.resolve(packageName);
} catch (e) {
	console.error("pact-node: Cannot resolve module '" + packageName + "'. Download/install must of failed, please try again.");
	process.exit(1);
}

console.info("pact-node: install successful");
process.exit(0);
