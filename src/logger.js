var bunyan = require('bunyan'),
	pkg = require('../package.json'),
	_ = require('underscore'),
	PrettyStream = require('bunyan-prettystream'),
	prettyStdOut = new PrettyStream();

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
