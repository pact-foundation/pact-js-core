var bunyan = require('bunyan');
var config = {
	name: 'pact-node',
	streams: [
		{
			level: 'warn',
			stream: process.stdout
		}
	]
};

module.exports = bunyan.createLogger(config);
