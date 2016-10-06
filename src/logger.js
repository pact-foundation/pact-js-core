var bunyan = require('bunyan'),
	pkg = require('../package.json'),
	_ = require('underscore'),
	PrettyStream = require('bunyan-prettystream'),
	prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

module.exports = bunyan.createLogger({
	name: 'pact-node@' + pkg.version,
	streams: [
		{
			level: process.env.LOGLEVEL || 'warn',
			type: 'raw',
			stream: prettyStdOut
		}
	]
});
