"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var q = require("q");
var data_utils_1 = require("./data-utils");
var cors = require("cors");
var bodyParser = require("body-parser");
exports.default = (function (port) {
    var server = express();
    server.use(cors());
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({
        extended: true,
    }));
    var stateData = '';
    server.get('/', data_utils_1.returnJson({ greeting: 'Hello' }));
    server.get('/fail', data_utils_1.returnJson({ greeting: 'Oh noes!' }));
    server.get('/provider-states', data_utils_1.returnJson({
        me: ['There is a greeting'],
        anotherclient: ['There is a greeting'],
    }));
    server.post('/provider-state', function (req, res) {
        stateData = 'State data!';
        return res.json({
            greeting: stateData,
        });
    });
    server.get('/somestate', function (req, res) {
        return res.json({
            greeting: stateData,
        });
    });
    server.post('/', function (req, res) {
        return res.json({
            greeting: "Hello " + req.body.name,
        });
    });
    server.get('/contract/:name', function (req, res) {
        var fileName = req.params.name;
        res.sendFile(fileName, {
            root: __dirname,
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
            },
        }, function (err) {
            if (err) {
                console.log(err);
                res.status(500).end();
            }
            else {
                console.log('Sent:', fileName);
            }
        });
    });
    server.post('/pacts/provider/:provider/consumer/:consumer/pact-version/:version/verification-results', data_utils_1.returnJsonFile('./data/get-provider_they-consumer_me-latest.json'));
    server.get('/pacts/provider/they/consumer/me/latest', data_utils_1.auth, data_utils_1.returnJsonFile('./data/get-provider_they-consumer_me-latest.json'));
    server.get('/pacts/provider/they/consumer/anotherclient/latest', data_utils_1.auth, data_utils_1.returnJsonFile('./data/get-provider_they-consumer_anotherclient-latest.json'));
    server.get('/noauth/pacts/provider/they/consumer/me/latest', data_utils_1.returnJsonFile('./data/get-noauth-provider_they-consumer_me-latest.json'));
    server.get('/noauth/pacts/provider/they/consumer/anotherclient/latest', data_utils_1.returnJsonFile('./data/get-noauth-provider_they-consumer_anotherclient-latest.json'));
    var deferred = q.defer();
    var s = server.listen(port, function () { return deferred.resolve(); });
    return deferred.promise.then(function () { return s; });
});
//# sourceMappingURL=provider-mock.js.map