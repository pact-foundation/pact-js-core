var cors = require('cors'),
	_ = require('underscore'),
	express = require('express'),
	bodyParser = require('body-parser'),
	basicAuth = require('basic-auth'),
	server = express();

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

BROKER_HOST = 'http://localhost:9124';

var pactFunction = function (req, res) {
	if (
		// 1. Is there a body?
		_.isEmpty(req.body) ||
		// 2. Is there a consumer, provider and version in the request?
		_.isEmpty(req.params.consumer) || _.isEmpty(req.params.provider) || _.isEmpty(req.params.version)
	) {
		return res.sendStatus(400);
	}
	res.status(201).json(req.body);
};

var tagPactFunction = function (req, res) {
	if (_.isEmpty(req.params.consumer) || _.isEmpty(req.params.version) || _.isEmpty(req.params.tag)) {
		return res.sendStatus(400);
	}
	res.sendStatus(201);
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

server.get('/somebrokenpact', function (req, res) {
	res.json({});
});

server.get('/somepact', function (req, res) {
	res.json({ 'consumer': { 'name': 'anotherclient' }, 'provider': { 'name': 'they' } });
});

// Pretend to be a Pact Broker (https://github.com/bethesque/pact_broker) for integration tests
server.put('/pacts/provider/:provider/consumer/:consumer/version/:version', pactFunction);

// Authenticated calls...
server.put('/auth/pacts/provider/:provider/consumer/:consumer/version/:version', auth, pactFunction);

// Tagging
server.put('/pacticipants/:consumer/versions/:version/tags/:tag', tagPactFunction);
server.put('/auth/pacticipants/:consumer/versions/:version/tags/:tag', tagPactFunction);

// Get root HAL links
server.get('/', function (req, res) {
	var obj = JSON.parse('{"_links": { "self": { "href": "' + BROKER_HOST + '", "title": "Index", "templated": false }, "pb:publish-pact": { "href": "' + BROKER_HOST + '/pacts/provider/{provider}/consumer/{consumer}/version/{consumerApplicationVersion}", "title": "Publish a pact", "templated": true }, "pb:latest-pact-versions": { "href": "' + BROKER_HOST + '/pacts/latest", "title": "Latest pact versions", "templated": false }, "pb:pacticipants": { "href": "' + BROKER_HOST + '/pacticipants", "title": "Pacticipants", "templated": false }, "pb:latest-provider-pacts": { "href": "' + BROKER_HOST + '/pacts/provider/{provider}/latest", "title": "Latest pacts by provider", "templated": true }, "pb:latest-provider-pacts-with-tag": { "href": "' + BROKER_HOST + '/pacts/provider/{provider}/latest/{tag}", "title": "Latest pacts by provider with a specified tag", "templated": true }, "pb:webhooks": { "href": "' + BROKER_HOST + '/webhooks", "title": "Webhooks", "templated": false }, "curies": [ { "name": "pb", "href": "' + BROKER_HOST + '/doc/{rel}", "templated": true } ] }}');
	res.json(obj);
})

// Get pacts by Provider 'notfound'
server.get('/pacts/provider/notfound/latest', function (req, res) {
	res.status(404).end();
});

// Get pacts by Provider 'nolinks'
server.get('/pacts/provider/nolinks/latest', function (req, res) {
	// var obj = JSON.parse('{ "_links": { "self": { "href": "' + BROKER_HOST + '/pacts/provider/nolinks/latest/sit4", "title": "Latest pact versions for the provider nolinks with tag \'sit4\'" }}}');
	var obj = JSON.parse('{ "_links": { "self": { "href": "' + BROKER_HOST + '/pacts/provider/nolinks/latest/sit4", "title": "Latest pact versions for the provider nolinks with tag \'sit4\'" }, "provider": { "href": "' + BROKER_HOST + '/pacticipants/nolinks", "title": "bobby" }, "pacts": [] } }');
	res.json(obj);
});

// Get pacts by Provider (all)
server.get('/pacts/provider/:provider/latest', function (req, res) {
	var obj = JSON.parse('{ "_links": { "self": { "href": "' + BROKER_HOST + '/pacts/provider/bobby/latest/sit4", "title": "Latest pact versions for the provider bobby with tag \'sit4\'" }, "provider": { "href": "' + BROKER_HOST + '/pacticipants/bobby", "title": "bobby" }, "pacts": [ { "href": "' + BROKER_HOST + '/pacts/provider/bobby/consumer/billy/version/1.0.0", "title": "Pact between billy (v1.0.0) and bobby", "name": "billy" }, { "href": "' + BROKER_HOST + '/pacts/provider/bobby/consumer/someotherguy/version/1.0.0", "title": "Pact between someotherguy (v1.0.0) and bobby", "name": "someotherguy" } ] } }');
	res.json(obj);
});

// Get pacts by Provider and Tag
server.get('/pacts/provider/:provider/latest/:tag', function (req, res) {
	var obj = JSON.parse('{ "_links": { "self": { "href": "https://test.pact.dius.com.au/pacts/provider/notfound/latest", "title": "Latest pact versions for the provider bobby" }, "provider": { "href": "https://test.pact.dius.com.au/pacticipants/bobby", "title": "bobby" }, "pacts": [ { "href": "https://test.pact.dius.com.au/pacts/provider/bobby/consumer/billy/version/1.0.0", "title": "Pact between billy (v1.0.0) and bobby", "name": "billy" }, { "href": "https://test.pact.dius.com.au/pacts/provider/bobby/consumer/someotherguy/version/1.0.0", "title": "Pact between someotherguy (v1.0.0) and bobby", "name": "someotherguy" } ] } }');
	res.json(obj);
})

server.get('/noauth/pacts/provider/they/consumer/me/latest', function (req, res) {
	var obj = JSON.parse('{"consumer":{"name":"me"},"provider":{"name":"they"},"interactions":[{"description":"Provider state success","provider_state":"There is a greeting","request":{"method":"GET","path":"/somestate"},"response":{"status":200,"headers":{},"body":{"greeting":"State data!"}}}],"metadata":{"pactSpecificationVersion":"2.0.0"},"updatedAt":"2016-05-15T00:09:33+00:00","createdAt":"2016-05-15T00:09:06+00:00","_links":{"self":{"title":"Pact","name":"Pact between me (v1.0.0) and they","href":"' + BROKER_HOST + '/pacts/provider/they/consumer/me/version/1.0.0"},"pb:consumer":{"title":"Consumer","name":"me","href":"' + BROKER_HOST + '/pacticipants/me"},"pb:provider":{"title":"Provider","name":"they","href":"' + BROKER_HOST + '/pacticipants/they"},"pb:latest-pact-version":{"title":"Pact","name":"Latest version of this pact","href":"' + BROKER_HOST + '/pacts/provider/they/consumer/me/latest"},"pb:previous-distinct":{"title":"Pact","name":"Previous distinct version of this pact","href":"' + BROKER_HOST + '/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"},"pb:diff-previous-distinct":{"title":"Diff","name":"Diff with previous distinct version of this pact","href":"' + BROKER_HOST + '/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"},"pb:pact-webhooks":{"title":"Webhooks for the pact between me and they","href":"' + BROKER_HOST + '/webhooks/provider/they/consumer/me"},"pb:tag-prod-version":{"title":"Tag this version as \'production\'","href":"' + BROKER_HOST + '/pacticipants/me/versions/1.0.0/tags/prod"},"pb:tag-version":{"title":"Tag version","href":"' + BROKER_HOST + '/pacticipants/me/versions/1.0.0/tags/{tag}"},"curies":[{"name":"pb","href":"' + BROKER_HOST + '/doc/{rel}","templated":true}]}}');
	res.json(obj);
});

server.get('/noauth/pacts/provider/they/consumer/anotherclient/latest', function (req, res) {
	var obj = JSON.parse('{"consumer":{"name":"anotherclient"},"provider":{"name":"they"},"interactions":[{"description":"Provider state success","provider_state":"There is a greeting","request":{"method":"GET","path":"/somestate"},"response":{"status":200,"headers":{},"body":{"greeting":"State data!"}}}],"metadata":{"pactSpecificationVersion":"2.0.0"},"updatedAt":"2016-05-15T00:09:33+00:00","createdAt":"2016-05-15T00:09:06+00:00","_links":{"self":{"title":"Pact","name":"Pact between me (v1.0.0) and they","href":"' + BROKER_HOST + '/pacts/provider/they/consumer/me/version/1.0.0"},"pb:consumer":{"title":"Consumer","name":"anotherclient","href":"' + BROKER_HOST + '/pacticipants/me"},"pb:provider":{"title":"Provider","name":"they","href":"' + BROKER_HOST + '/pacticipants/they"},"pb:latest-pact-version":{"title":"Pact","name":"Latest version of this pact","href":"' + BROKER_HOST + '/pacts/provider/they/consumer/me/latest"},"pb:previous-distinct":{"title":"Pact","name":"Previous distinct version of this pact","href":"' + BROKER_HOST + '/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"},"pb:diff-previous-distinct":{"title":"Diff","name":"Diff with previous distinct version of this pact","href":"' + BROKER_HOST + '/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"},"pb:pact-webhooks":{"title":"Webhooks for the pact between me and they","href":"' + BROKER_HOST + '/webhooks/provider/they/consumer/me"},"pb:tag-prod-version":{"title":"Tag this version as \'production\'","href":"' + BROKER_HOST + '/pacticipants/me/versions/1.0.0/tags/prod"},"pb:tag-version":{"title":"Tag version","href":"' + BROKER_HOST + '/pacticipants/me/versions/1.0.0/tags/{tag}"},"curies":[{"name":"pb","href":"' + BROKER_HOST + '/doc/{rel}","templated":true}]}}');
	res.json(obj);
});

module.exports = server;
