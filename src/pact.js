'use strict';
var logger = require('./logger'), _ = require('underscore'), serverFactory = require('./server'), verifierFactory = require('./verifier'), publisherFactory = require('./publisher'), q = require('q');
var servers = [];
function stringify(obj) {
    return _.chain(obj)
        .pairs()
        .map(function (v) {
        return v.join(' = ');
    })
        .value()
        .join(',\n');
}
function createServer(options) {
    if (options && options.port && _.some(servers, function (s) {
        return s._options.port == options.port;
    })) {
        var msg = 'Port `' + options.port + '` is already in use by another process.';
        logger.error(msg);
        throw new Error(msg);
    }
    var server = serverFactory(options);
    servers.push(server);
    logger.info('Creating Pact Server with options: \n' + stringify(server._options));
    server.once('delete', function (server) {
        logger.info('Deleting Pact Server with options: \n' + stringify(server._options));
        servers = _.without(servers, server);
    });
    return server;
}
function listServers() {
    return servers;
}
function removeAllServers() {
    logger.info('Removing all Pact servers.');
    return q.all(_.map(servers, function (server) {
        return server.delete();
    }));
}
function verifyPacts(options) {
    logger.info('Verifying Pacts.');
    return verifierFactory(options).verify();
}
function publishPacts(options) {
    logger.info('Publishing Pacts to Broker');
    return publisherFactory(options).publish();
}
process.once('exit', removeAllServers);
process.once('SIGINT', process.exit);
module.exports = {
    logLevel: logger.level.bind(logger),
    createServer: createServer,
    listServers: listServers,
    removeAllServers: removeAllServers,
    verifyPacts: verifyPacts,
    publishPacts: publishPacts
};
//# sourceMappingURL=pact.js.map