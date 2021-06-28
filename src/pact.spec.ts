import chai = require('chai');
import path = require('path');
import chaiAsPromised = require('chai-as-promised');
import fs = require('fs');
import pact from './pact';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Pact Spec', () => {
  afterEach(() => pact.removeAllServers());

  describe('Set Log Level', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let originalLogLevel: any;
    // Reset log level after the tests
    before(() => (originalLogLevel = pact.logLevel()));
    after(() => pact.logLevel(originalLogLevel));

    context('when setting a log level', () => {
      it("should be able to set log level 'trace'", () => {
        pact.logLevel('trace');
        expect(pact.logLevel()).to.be.equal(10);
      });

      it("should be able to set log level 'debug'", () => {
        pact.logLevel('debug');
        expect(pact.logLevel()).to.be.equal(20);
      });

      it("should be able to set log level 'info'", () => {
        pact.logLevel('info');
        expect(pact.logLevel()).to.be.equal(30);
      });

      it("should be able to set log level 'warn'", () => {
        pact.logLevel('warn');
        expect(pact.logLevel()).to.be.equal(40);
      });

      it("should be able to set log level 'error'", () => {
        pact.logLevel('error');
        expect(pact.logLevel()).to.be.equal(50);
      });
    });
  });

  describe('Create serverFactory', () => {
    let dirPath: string;
    const monkeypatchFile: string = path.resolve(
      __dirname,
      '../test/monkeypatch.rb'
    );

    beforeEach(
      () =>
        (dirPath = path.resolve(
          __dirname,
          `../.tmp/${Math.floor(Math.random() * 1000)}`
        ))
    );

    afterEach(() => {
      try {
        if (fs.statSync(dirPath).isDirectory()) {
          fs.rmdirSync(dirPath);
        }
      } catch (e) {}
    });

    context('when no options are set', () => {
      it('should use defaults and return serverFactory', () => {
        let server = pact.createServer();
        expect(server).to.be.an('object');
        expect(server.options).to.be.an('object');
        expect(server.options).to.contain.all.keys([
          'cors',
          'ssl',
          'host',
          'dir',
        ]);
        expect(server.start).to.be.a('function');
        expect(server.stop).to.be.a('function');
        expect(server.delete).to.be.a('function');
      });
    });

    context('when user specifies valid options', () => {
      it('should return serverFactory using specified options', () => {
        let options = {
          port: 9500,
          host: 'localhost',
          dir: dirPath,
          ssl: true,
          cors: true,
          log: './log/log.txt',
          spec: 1,
          consumer: 'consumerName',
          provider: 'providerName',
          monkeypatch: monkeypatchFile,
        };
        let server = pact.createServer(options);
        expect(server).to.be.an('object');
        expect(server.options).to.be.an('object');
        expect(server.options.port).to.equal(options.port);
        expect(server.options.host).to.equal(options.host);
        expect(server.options.dir).to.equal(options.dir);
        expect(server.options.ssl).to.equal(options.ssl);
        expect(server.options.cors).to.equal(options.cors);
        expect(server.options.log).to.equal(options.log);
        expect(server.options.spec).to.equal(options.spec);
        expect(server.options.consumer).to.equal(options.consumer);
        expect(server.options.provider).to.equal(options.provider);
        expect(server.options.monkeypatch).to.equal(options.monkeypatch);
      });
    });

    context('when user specifies invalid port', () => {
      it('should return an error on negative port number', () => {
        expect(() => pact.createServer({ port: -42 })).to.throw(Error);
      });

      it('should return an error on non-integer', () => {
        expect(() => {
          pact.createServer({ port: 42.42 });
        }).to.throw(Error);
      });

      it('should return an error on non-number', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => pact.createServer({ port: '99' } as any)).to.throw(Error);
      });

      it('should return an error on outside port range', () => {
        expect(() => {
          pact.createServer({ port: 99999 });
        }).to.throw(Error);
      });
    });

    context("when user specifies port that's currently in use", () => {
      it('should return a port conflict error', () => {
        pact.createServer({ port: 5100 });
        expect(() => pact.createServer({ port: 5100 })).to.throw(Error);
      });
    });

    context('when user specifies invalid host', () => {
      it('should return an error on non-string', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => pact.createServer({ host: 12 } as any)).to.throw(Error);
      });
    });

    context('when user specifies invalid pact directory', () => {
      it('should create the directory for us', () => {
        pact.createServer({ dir: dirPath });
        expect(fs.statSync(dirPath).isDirectory()).to.be.true;
      });
    });

    context('when user specifies invalid ssl', () => {
      it('should return an error on non-boolean', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => pact.createServer({ ssl: 1 } as any)).to.throw(Error);
      });
    });

    context('when user specifies invalid cors', () => {
      it('should return an error on non-boolean', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => pact.createServer({ cors: 1 } as any)).to.throw(Error);
      });
    });

    context('when user specifies invalid spec', () => {
      it('should return an error on non-number', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => pact.createServer({ spec: '1' } as any)).to.throw(Error);
      });

      it('should return an error on negative number', () => {
        expect(() => {
          pact.createServer({ spec: -12 });
        }).to.throw(Error);
      });

      it('should return an error on non-integer', () => {
        expect(() => {
          pact.createServer({ spec: 3.14 });
        }).to.throw(Error);
      });
    });

    context('when user specifies invalid consumer name', () => {
      it('should return an error on non-string', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => pact.createServer({ consumer: 1234 } as any)).to.throw(
          Error
        );
      });
    });

    context('when user specifies invalid provider name', () => {
      it('should return an error on non-string', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => pact.createServer({ provider: 2341 } as any)).to.throw(
          Error
        );
      });
    });

    context('when user specifies invalid monkeypatch', () => {
      it('should return an error on invalid path', () => {
        expect(() => {
          pact.createServer({ monkeypatch: 'some-ruby-file.rb' });
        }).to.throw(Error);
      });
    });
  });

  describe('List servers', () => {
    context('when called and there are no servers', () => {
      it('should return an empty list', () => {
        expect(pact.listServers()).to.be.empty;
      });
    });

    context('when called and there are servers in list', () => {
      it('should return a list of all servers', () => {
        pact.createServer({ port: 1234 });
        pact.createServer({ port: 1235 });
        pact.createServer({ port: 1236 });
        expect(pact.listServers()).to.have.length(3);
      });
    });

    context('when server is removed', () => {
      it('should update the list', () => {
        pact.createServer({ port: 1234 });
        pact.createServer({ port: 1235 });
        return pact
          .createServer({ port: 1236 })
          .delete()
          .then(() => expect(pact.listServers()).to.have.length(2));
      });
    });
  });

  describe('Remove all servers', () => {
    context(
      'when removeAll() is called and there are servers to remove',
      () => {
        it('should remove all servers', () => {
          pact.createServer({ port: 1234 });
          pact.createServer({ port: 1235 });
          pact.createServer({ port: 1236 });
          return pact
            .removeAllServers()
            .then(() => expect(pact.listServers()).to.be.empty);
        });
      }
    );
  });
});
