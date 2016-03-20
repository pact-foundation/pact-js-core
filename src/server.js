'use strict';

var checkAssertion = require('check-types'),
  path = require('path'),
  fs = require('fs'),
  cp = require('child_process'),
  eventEmitter = require('events').EventEmitter,
  http = require('http'),
  https = require('https'),
  q = require('q'),
  util = require('util');
var isWindows = process.platform === 'win32';

var arch = "";
if (process.platform === 'linux') {
  arch = '-' + process.arch;
}
var packageName = 'pact-mock-service-' + process.platform + arch;
var packagePath = require.resolve(packageName);

var CHECKTIME = 500;

function Server(port, host, dir, ssl, cors, log, spec, consumer, provider) {
  this.port = port;
  this.host = host;
  this.dir = dir;
  this.ssl = ssl;
  this.cors = cors;
  this.log = log;
  this.spec = spec;
  this.consumer = consumer;
  this.provider = provider;
}

util.inherits(Server, eventEmitter);

Server.prototype.start = function () {
  var deferred = q.defer();
  var that = this;
  // Wait for pact-mock-service to be initialized and ready
  var amount = 0;

  function done() {
    that.emit('stop', that);
    deferred.resolve(that);
  }

  function check() {
    amount++;

    function retry() {
      if (amount >= 10) {
        deferred.reject(new Error("Pact startup failed; tried calling service 10 times with no result."));
      }
      setTimeout(check, CHECKTIME);
    }

    if (that.port) {
      var options = {
        host: that.host,
        port: that.port,
        path: '/',
        method: 'GET',
        headers: {
          'X-Pact-Mock-Service': true,
          'Content-Type': 'application/json'
        }
      };
      var requester = http.request;
      if (that.ssl) {
        requester = https.request;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        options.rejectUnauthorized = false;
        options.requestCert = false;
        options.agent = false;
      }
      requester(options, done).on('error', retry).end();
    } else {
      retry();
    }
  }

  if (that.instance && that.instance.connected) {
    console.warn('You already have a process running with PID: ' + that.instance.pid);
    check();
    return;
  }
  var file,
    args = [],
    opts = {
      cwd: path.resolve(packagePath, '..'),
      detached: !isWindows
    },
    mapping = {
      'port': '--port',
      'host': '--host',
      'log': '--log',
      'ssl': '--ssl',
      'cors': '--cors',
      'dir': '--pact_dir',
      'spec': '--pact_specification_version',
      'consumer': '--consumer',
      'provider': '--provider'
    };

  for (var key in mapping) {
    if (that[key]) {
      args.push(mapping[key] + ' ' + that[key]);
    }
  }

  var cmd = [packagePath.split(path.sep).pop()].concat(args).join(' ');

  if (isWindows) {
    file = 'cmd.exe';
    args = ['/s', '/c', cmd];
    opts.windowsVerbatimArguments = true;
  } else {
    cmd = "./" + cmd;
    file = '/bin/sh';
    args = ['-c', cmd];
  }

  that.instance = cp.spawn(file, args, opts);

  that.instance.stdout.setEncoding('utf8');
  that.instance.stdout.on('data', console.log);
  that.instance.stderr.setEncoding('utf8');
  that.instance.stderr.on('data', console.log);
  that.instance.on('error', console.error);

  // if port isn't specified, listen for it when pact runs
  function catchPort(data) {
    var match = data.match(/port=([0-9]+)/);
    if (match && match[1]) {
      that.port = parseInt(match[1]);
      that.instance.stdout.removeListener('data', catchPort);
      that.instance.stderr.removeListener('data', catchPort);
    }
  }

  if (!that.port) {
    that.instance.stdout.on('data', catchPort);
    that.instance.stderr.on('data', catchPort);
  }

  console.info('Creating Pact with PID: ' + that.instance.pid);

  that.instance.on('close', function (code) {
    if (code !== 0) {
      console.warn('Pact exited with code ' + code + '.');
    }
    that.stop();
  });

  // check service is available
  check();
  return deferred.promise.timeout(10000, "Couldn't start Pact with PID: " + that.instance.pid);
};

Server.prototype.stop = function () {
  var deferred = q.defer();
  var that = this;
  var amount = 0;

  function done() {
    that.emit('stop', that);
    deferred.resolve(that);
  }

  function check() {
    amount++;
    if (that.port) {
      var options = {
        host: that.host,
        port: that.port,
        path: '/',
        method: 'GET',
        headers: {
          'X-Pact-Mock-Service': true,
          'Content-Type': 'application/json'
        }
      };
      var requester = http.request;
      if (that.ssl) {
        requester = https.request;
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        options.rejectUnauthorized = false;
        options.requestCert = false;
        options.agent = false;
      }
      requester(options, function () {
        if (amount >= 10) {
          deferred.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
        }
        setTimeout(check, CHECKTIME);
      }).on('error', done).end();
    } else {
      done();
    }
  }

  var pid = -1;
  if (that.instance) {
    pid = that.instance.pid;
    console.info('Removing Pact with PID: ' + that.instance.pid);
    that.instance.removeAllListeners();
    // Killing instance, since windows can't send signals, must kill process forcefully
    if (isWindows) {
      cp.execSync('taskkill /f /t /pid ' + that.instance.pid);
    } else {
      process.kill(-that.instance.pid, 'SIGKILL');
    }
    that.instance = undefined;
  }

  check();
  return deferred.promise.timeout(10000, "Couldn't stop Pact with PID: " + pid);
};

Server.prototype.delete = function () {
  var that = this;
  return that.stop().then(function () {
    that.emit('delete', that);
    return that;
  });
};

module.exports = function (options) {
  options = options || {};

  // defaults
  //options.port = options.port;
  options.ssl = options.ssl || false;
  options.cors = options.cors || false;
  // options.spec = options.spec || 1;
  options.dir = options.dir ? path.resolve(options.dir) : process.cwd(); // Use directory relative to cwd
  // options.log = options.log || process.cwd();
  options.host = options.host || 'localhost';
  // options.consumer = options.consumer || 'consumer name';
  // options.provider = options.provider || 'provider name';

  // port checking
  if (options.port) {
    checkAssertion.assert.number(options.port);
    checkAssertion.assert.integer(options.port);
    checkAssertion.assert.positive(options.port);
    checkAssertion.assert.inRange(options.port, 0, 65535);

    if (checkAssertion.not.inRange(options.port, 1024, 49151)) {
      console.warn("Like a Boss, you used a port outside of the recommended range (1024 to 49151); I too like to live dangerously.");
    }
  }

  // ssl check
  checkAssertion.assert.boolean(options.ssl);

  // cors check'
  checkAssertion.assert.boolean(options.cors);

  // spec checking
  if (options.spec) {
    checkAssertion.assert.number(options.spec);
    checkAssertion.assert.integer(options.spec);
    checkAssertion.assert.positive(options.spec);
  }

  // dir check
  checkAssertion.assert(fs.statSync(path.normalize(options.dir)).isDirectory(), "Error on pact directory, not a valid directory");

  // log check
  if (options.log) {
    checkAssertion.assert(fs.statSync(path.dirname(path.normalize(options.log))).isDirectory(), "Error on log, not a valid path");
  }

  // host check
  if (options.host) {
    checkAssertion.assert.string(options.host);
  }

  // consumer name check
  if (options.consumer) {
    checkAssertion.assert.string(options.consumer);
  }

  // provider name check
  if (options.provider) {
    checkAssertion.assert.string(options.provider);
  }

  return new Server(options.port, options.host, options.dir, options.ssl, options.cors, options.log, options.spec, options.consumer, options.provider);
};
