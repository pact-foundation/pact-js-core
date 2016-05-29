var bunyan = require('bunyan'),
	pkg = require('../package.json'),
	PrettyStream = require('bunyan-prettystream'),
	prettyStdOut = new PrettyStream();

prettyStdOut.pipe(process.stdout);

var logger = bunyan.createLogger({
	name: 'pact-node@' + pkg.version,
	streams: [
		{
			level: 'info',
			type: 'raw',
			stream: prettyStdOut
		}
	]
});

function log (level, msg) {
	if (process.env.ENABLE_LOG === 'true') {
		logger[level](msg);
	}
}

module.exports = {
	level: function (level) {
		logger.level(level)
	},
	info: function (msg) {
		log('info', msg);
	},
	debug: function (msg) {
		log('debug', msg);
	},
	error: function (msg) {
		log('error', msg);
	},
	warn: function (msg) {
		log('warn', msg);
	}
};
