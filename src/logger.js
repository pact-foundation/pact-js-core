var bunyan = require('bunyan');
var pkg = require('../package.json');
var PrettyStream = require('bunyan-prettystream');
var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

var config = {
	name: 'pact-node@' + pkg.version,
	streams: [
		{
			level: 'info',
			type: 'raw',
			stream: prettyStdOut
		}
	]
};

module.exports = bunyan.createLogger(config);
