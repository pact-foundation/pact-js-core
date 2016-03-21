/* global describe:true, before:true, after:true, it:true, global:true, process:true */

var expect = require('chai').expect,
  pact = require('./pact.js');

describe("Pact Spec", function () {
  afterEach(function (done) {
    pact.removeAll().then(function () {
      done();
    });
  });

  describe("Create serverFactory", function () {
    context("when no options are set", function () {
      it("should use defaults and return serverFactory", function () {
        var server = pact.create();
        expect(server).to.be.an('object');
        expect(server).to.contain.all.keys(['port', 'cors', 'ssl', 'host', 'dir', 'log', 'spec', 'consumer', 'provider']);
        expect(server.start).to.be.a('function');
        expect(server.stop).to.be.a('function');
        expect(server.delete).to.be.a('function');
      });
    });

    context("when user specifies valid options", function () {
      var fs = require('fs'),
        path = require('path'),
        dirPath = path.resolve(__dirname, '../.tmp' + Math.floor(Math.random() * 1000));
      beforeEach(function (done) {
        fs.mkdir(dirPath, done);
      });
      afterEach(function (done) {
        fs.rmdir(dirPath, done);
      });

      it("should return serverFactory using specified options", function () {
        var options = {
          port: 9500,
          host: 'localhost',
          dir: dirPath,
          ssl: true,
          cors: true,
          log: 'log.txt',
          spec: 1,
          consumer: 'consumerName',
          provider: 'providerName'
        };
        var server = pact.create(options);
        expect(server).to.be.an('object');
        expect(server.port).to.equal(options.port);
        expect(server.host).to.equal(options.host);
        expect(server.dir).to.equal(options.dir);
        expect(server.ssl).to.equal(options.ssl);
        expect(server.cors).to.equal(options.cors);
        expect(server.log).to.equal(options.log);
        expect(server.spec).to.equal(options.spec);
        expect(server.consumer).to.equal(options.consumer);
        expect(server.provider).to.equal(options.provider);
      });
    });

    context("when user specifies invalid port", function () {
      it("should return an error on negative port number", function () {
        expect(function () {
          pact.create({port: -42})
        }).to.throw(Error);
      });

      it("should return an error on non-integer", function () {
        expect(function () {
          pact.create({port: 42.42});
        }).to.throw(Error);
      });

      it("should return an error on non-number", function () {
        expect(function () {
          pact.create({port: '99'});
        }).to.throw(Error);
      });

      it("should return an error on outside port range", function () {
        expect(function () {
          pact.create({port: 99999});
        }).to.throw(Error);
      });
    });

    context("when user specifies port that's currently in use", function () {
      it("should return a port conflict error", function () {
        pact.create({port: 5100});
        expect(function () {
          pact.create({port: 5100})
        }).to.throw(Error);
      });
    });

    context("when user specifies invalid host", function () {
      it("should return an error on non-string", function () {
        expect(function () {
          pact.create({host: 12});
        }).to.throw(Error);
      });
    });

    context("when user specifies invalid pact directory", function () {
      it("should return an error on invalid path", function () {
        expect(function () {
          pact.create({dir: 'M:/nms'});
        }).to.throw(Error);
      });
    });

    context("when user specifies invalid ssl", function () {
      it("should return an error on non-boolean", function () {
        expect(function () {
          pact.create({ssl: 1});
        }).to.throw(Error);
      });
    });

    context("when user specifies invalid cors", function () {
      it("should return an error on non-boolean", function () {
        expect(function () {
          pact.create({cors: 1});
        }).to.throw(Error);
      });
    });

    context("when user specifies invalid log", function () {
      it("should return an error on invalid path", function () {
        expect(function () {
          pact.create({log: 'abc/123'});
        }).to.throw(Error);
      });
    });

    context("when user specifies invalid spec", function () {
      it("should return an error on non-number", function () {
        expect(function () {
          pact.create({spec: '1'});
        }).to.throw(Error);
      });

      it("should return an error on negative number", function () {
        expect(function () {
          pact.create({spec: -12});
        }).to.throw(Error);
      });

      it("should return an error on non-integer", function () {
        expect(function () {
          pact.create({spec: 3.14});
        }).to.throw(Error);
      });
    });

    context("when user specifies invalid consumer name", function () {
      it("should return an error on non-string", function () {
        expect(function () {
          pact.create({consumer: 1234});
        }).to.throw(Error);
      });
    });

    context("when user specifies invalid provider name", function () {
      it("should return an error on non-string", function () {
        expect(function () {
          pact.create({provider: 2341});
        }).to.throw(Error);
      });
    });
  });

  describe("List servers", function () {
    context("when called and there are no servers", function () {
      it("should return an empty list", function () {
        expect(pact.list()).to.be.empty;
      });
    });

    context("when called and there are servers in list", function () {
      it("should return a list of all servers", function () {
        pact.create({port: 9200});
        pact.create({port: 9300});
        pact.create({port: 9400});
        expect(pact.list()).to.have.length(3);
      });
    });

    context("when server is removed", function () {
      it("should update the list", function (done) {
        pact.create({port: 9200});
        pact.create({port: 9300});
        pact.create({port: 9400}).delete().then(function () {
          expect(pact.list()).to.have.length(2);
          done();
        });
      });
    });
  });

  describe("Remove all servers", function () {
    context("when removeAll() is called and there are servers to remove", function () {
      it("should remove all servers", function (done) {
        pact.create({port: 9200});
        pact.create({port: 9300});
        pact.create({port: 9400});
        pact.removeAll().then(function () {
          expect(pact.list()).to.be.empty;
          done();
        });
      });
    });
  });
});
