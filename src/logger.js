var bunyan = require('bunyan');
var pkg = require('../package.json');
var config = {
	name: 'pact-node@' + pkg.version,
	streams: [
		{
			level: 'warn',
			stream: process.stdout
		}
	]
};

module.exports = bunyan.createLogger(config);
