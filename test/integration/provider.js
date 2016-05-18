var cors = require('cors'),
  express = require('express')
  bodyParser = require('body-parser'),
  basicAuth = require('basic-auth');

var server = express();
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

var stateData = "";

server.get('/', function(req, res) {
  res.json({ greeting: 'Hello' });
});

server.get('/fail', function(req, res) {
  res.json({ greeting: 'Oh noes!' });
});

server.get('/provider-states', function(req, res) {
  res.json({ me: ["There is a greeting"], anotherclient: ["There is a greeting"] });
});

server.post('/provider-state', function(req, res) {
  stateData = "State data!";
  res.json({ greeting: stateData });
});

server.get('/somestate', function(req, res) {
  res.json({ greeting: stateData });
});

server.get('/contract/:name', function(req, res) {
  var options = {
    root: __dirname,
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });
});

// Pretend to be a Pact Broker (https://github.com/bethesque/pact_broker) for integration tests
// Let's add Auth for good measure
var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'foo' && user.pass === 'bar') {
    return next();
  } else {
    return unauthorized(res);
  };
};

server.get('/pacts/provider/they/consumer/me/latest', auth, function (req, res) {
  var obj = JSON.parse('{"consumer":{"name":"me"},"provider":{"name":"they"},"interactions":[{"description":"Provider state success","provider_state":"There is a greeting","request":{"method":"GET","path":"/somestate"},"response":{"status":200,"headers":{},"body":{"greeting":"State data!"}}}],"metadata":{"pactSpecificationVersion":"2.0.0"},"updatedAt":"2016-05-15T00:09:33+00:00","createdAt":"2016-05-15T00:09:06+00:00","_links":{"self":{"title":"Pact","name":"Pact between me (v1.0.0) and they","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0"},"pb:consumer":{"title":"Consumer","name":"me","href":"http://pact.onegeek.com.au/pacticipants/me"},"pb:provider":{"title":"Provider","name":"they","href":"http://pact.onegeek.com.au/pacticipants/they"},"pb:latest-pact-version":{"title":"Pact","name":"Latest version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/latest"},"pb:previous-distinct":{"title":"Pact","name":"Previous distinct version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"},"pb:diff-previous-distinct":{"title":"Diff","name":"Diff with previous distinct version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"},"pb:pact-webhooks":{"title":"Webhooks for the pact between me and they","href":"http://pact.onegeek.com.au/webhooks/provider/they/consumer/me"},"pb:tag-prod-version":{"title":"Tag this version as \'production\'","href":"http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/prod"},"pb:tag-version":{"title":"Tag version","href":"http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/{tag}"},"curies":[{"name":"pb","href":"http://pact.onegeek.com.au/doc/{rel}","templated":true}]}}');
  res.json(obj);
});

server.get('/pacts/provider/they/consumer/anotherclient/latest', auth, function (req, res) {
  var obj = JSON.parse('{"consumer":{"name":"anotherclient"},"provider":{"name":"they"},"interactions":[{"description":"Provider state success","provider_state":"There is a greeting","request":{"method":"GET","path":"/somestate"},"response":{"status":200,"headers":{},"body":{"greeting":"State data!"}}}],"metadata":{"pactSpecificationVersion":"2.0.0"},"updatedAt":"2016-05-15T00:09:33+00:00","createdAt":"2016-05-15T00:09:06+00:00","_links":{"self":{"title":"Pact","name":"Pact between me (v1.0.0) and they","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0"},"pb:consumer":{"title":"Consumer","name":"anotherclient","href":"http://pact.onegeek.com.au/pacticipants/me"},"pb:provider":{"title":"Provider","name":"they","href":"http://pact.onegeek.com.au/pacticipants/they"},"pb:latest-pact-version":{"title":"Pact","name":"Latest version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/latest"},"pb:previous-distinct":{"title":"Pact","name":"Previous distinct version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"},"pb:diff-previous-distinct":{"title":"Diff","name":"Diff with previous distinct version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"},"pb:pact-webhooks":{"title":"Webhooks for the pact between me and they","href":"http://pact.onegeek.com.au/webhooks/provider/they/consumer/me"},"pb:tag-prod-version":{"title":"Tag this version as \'production\'","href":"http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/prod"},"pb:tag-version":{"title":"Tag version","href":"http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/{tag}"},"curies":[{"name":"pb","href":"http://pact.onegeek.com.au/doc/{rel}","templated":true}]}}');
  res.json(obj);
});

server.get('/noauth/pacts/provider/they/consumer/me/latest', function (req, res) {
  var obj = JSON.parse('{"consumer":{"name":"me"},"provider":{"name":"they"},"interactions":[{"description":"Provider state success","provider_state":"There is a greeting","request":{"method":"GET","path":"/somestate"},"response":{"status":200,"headers":{},"body":{"greeting":"State data!"}}}],"metadata":{"pactSpecificationVersion":"2.0.0"},"updatedAt":"2016-05-15T00:09:33+00:00","createdAt":"2016-05-15T00:09:06+00:00","_links":{"self":{"title":"Pact","name":"Pact between me (v1.0.0) and they","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0"},"pb:consumer":{"title":"Consumer","name":"me","href":"http://pact.onegeek.com.au/pacticipants/me"},"pb:provider":{"title":"Provider","name":"they","href":"http://pact.onegeek.com.au/pacticipants/they"},"pb:latest-pact-version":{"title":"Pact","name":"Latest version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/latest"},"pb:previous-distinct":{"title":"Pact","name":"Previous distinct version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"},"pb:diff-previous-distinct":{"title":"Diff","name":"Diff with previous distinct version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"},"pb:pact-webhooks":{"title":"Webhooks for the pact between me and they","href":"http://pact.onegeek.com.au/webhooks/provider/they/consumer/me"},"pb:tag-prod-version":{"title":"Tag this version as \'production\'","href":"http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/prod"},"pb:tag-version":{"title":"Tag version","href":"http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/{tag}"},"curies":[{"name":"pb","href":"http://pact.onegeek.com.au/doc/{rel}","templated":true}]}}');
  res.json(obj);
});

server.get('/noauth/pacts/provider/they/consumer/anotherclient/latest', function (req, res) {
  var obj = JSON.parse('{"consumer":{"name":"anotherclient"},"provider":{"name":"they"},"interactions":[{"description":"Provider state success","provider_state":"There is a greeting","request":{"method":"GET","path":"/somestate"},"response":{"status":200,"headers":{},"body":{"greeting":"State data!"}}}],"metadata":{"pactSpecificationVersion":"2.0.0"},"updatedAt":"2016-05-15T00:09:33+00:00","createdAt":"2016-05-15T00:09:06+00:00","_links":{"self":{"title":"Pact","name":"Pact between me (v1.0.0) and they","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0"},"pb:consumer":{"title":"Consumer","name":"anotherclient","href":"http://pact.onegeek.com.au/pacticipants/me"},"pb:provider":{"title":"Provider","name":"they","href":"http://pact.onegeek.com.au/pacticipants/they"},"pb:latest-pact-version":{"title":"Pact","name":"Latest version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/latest"},"pb:previous-distinct":{"title":"Pact","name":"Previous distinct version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/previous-distinct"},"pb:diff-previous-distinct":{"title":"Diff","name":"Diff with previous distinct version of this pact","href":"http://pact.onegeek.com.au/pacts/provider/they/consumer/me/version/1.0.0/diff/previous-distinct"},"pb:pact-webhooks":{"title":"Webhooks for the pact between me and they","href":"http://pact.onegeek.com.au/webhooks/provider/they/consumer/me"},"pb:tag-prod-version":{"title":"Tag this version as \'production\'","href":"http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/prod"},"pb:tag-version":{"title":"Tag version","href":"http://pact.onegeek.com.au/pacticipants/me/versions/1.0.0/tags/{tag}"},"curies":[{"name":"pb","href":"http://pact.onegeek.com.au/doc/{rel}","templated":true}]}}');
  res.json(obj);
});

module.exports = server
