var cors = require('cors'),
	_ = require('underscore'),
	express = require('express'),
	bodyParser = require('body-parser'),
	basicAuth = require('basic-auth'),
	server = express();

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

var pactFunction = function (req, res) {
	if (
		// 1. Is there a body?
		_.isEmpty(req.body) ||
		// 2. Is there a consumer, provider and version in the request?
		_.isEmpty(req.params.consumer) || _.isEmpty(req.params.provider) || _.isEmpty(req.params.version)
	) {
		return res.sendStatus(400);
	}
	res.sendStatus(201);
	res.json(req.body);
};

// Let's add Auth for good measure
var auth = function (req, res, next) {
	var user = basicAuth(req);
	if (user && user.name === 'foo' && user.pass === 'bar') {
		return next();
	} else {
		res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
		return res.sendStatus(401);
	}
};

server.get('/somebrokenpact', function(req, res) {
	res.json({});
});

server.get('/somepact', function(req, res) {
	res.json({'consumer': {'name': 'anotherclient'}, 'provider': {'name': 'they'}});
});

// Pretend to be a Pact Broker (https://github.com/bethesque/pact_broker) for integration tests
server.put('/pacts/provider/:provider/consumer/:consumer/version/:version', pactFunction);

// Authenticated calls...
server.put('/auth/pacts/provider/:provider/consumer/:consumer/version/:version', auth, pactFunction);

module.exports = server;
