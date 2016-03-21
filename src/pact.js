'use strict';

var serverFactory = require('./server'),
  q = require('q');

var servers = [];

function create(options) {

  if (options && options.port) {
    for (var i = 0, len = servers.length; i < len; i++) {
      if (servers[i].port == options.port) {
        throw new Error('VERY WARNINGS! Port ' + options.port + ' much in use. Wow.');
        return;
      }
    }
  }

  var server = serverFactory(options);
  servers.push(server);

  // Listen to serverFactory events
  function deleteFunc(server) {
    for (var i = 0, len = servers.length; i < len; i++) {
      if (servers[i] === server) {
        servers.splice(i, 1);
        break;
      }
    }
    server.removeListener('delete', deleteFunc);
  }

  server.on('delete', deleteFunc);

  return server;
}

function list() {
  return servers;
}

function removeAll() {
  return q.all(servers.map(function (server) {
    return server.delete();
  }));
}

// Kill process on node exit
var exitFunc = function () {
  process.removeListener('SIGINT', exitFunc);
  process.exit();
};
var deleteFunc = function () {
  process.removeListener('exit', deleteFunc);
  removeAll();
};
process.on('exit', deleteFunc);
process.on('SIGINT', exitFunc);

module.exports = {
  create: create,
  list: list,
  removeAll: removeAll
};
