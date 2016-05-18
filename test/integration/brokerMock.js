var cors = require('cors'),
  _ = require('underscore'),
  express = require('express')
  bodyParser = require('body-parser'),
  basicAuth = require('basic-auth'),
  server = express();

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

var pactFunction = function(req, res) {
  // Double check a few things

  // 1. Is there a body?
  if (_.isEmpty(req.body)) {
    return res.sendStatus(400);
  }

  // 2. Is there a consumer, provider and version in the request?
  if (_.isEmpty(req.params.consumer) || _.isEmpty(req.params.provider || _.isEmpty(req.params.version))) {
    return res.sendStatus(400);
  }

  res.json(req.body);
};

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


// Pretend to be a Pact Broker (https://github.com/bethesque/pact_broker) for integration tests
server.put('/pacts/provider/:provider/consumer/:consumer/version/:version', pactFunction);

// Authenticated calls...
server.put('/auth/pacts/provider/:provider/consumer/:consumer/version/:version', auth, pactFunction);

module.exports = server
