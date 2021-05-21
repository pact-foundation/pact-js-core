import stubFactory from './stub';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import fs = require('fs');
import path = require('path');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Stub Spec', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stub: any;
  const validDefaults = {
    pactUrls: [
      path.resolve(__dirname, '../test/integration/me-they-success.json'),
    ],
  };

  afterEach(() => (stub ? stub.delete().then(() => (stub = null)) : null));

  describe('Start stub', () => {
    context('when invalid options are set', () => {
      it('should fail if custom ssl certs do not exist', () => {
        expect(() =>
          stubFactory({
            ssl: true,
            sslcert: 'does/not/exist',
            sslkey: path.resolve(__dirname, '../test/ssl/server.key'),
          })
        ).to.throw(Error);
      });

      it('should fail if custom ssl keys do not exist', () => {
        expect(() =>
          stubFactory({
            ssl: true,
            sslcert: path.resolve(__dirname, '../test/ssl/server.crt'),
            sslkey: 'does/not/exist',
          })
        ).to.throw(Error);
      });

      it("should fail if custom ssl cert is set, but ssl key isn't", () => {
        expect(() =>
          stubFactory({
            ssl: true,
            sslcert: path.resolve(__dirname, '../test/ssl/server.crt'),
          })
        ).to.throw(Error);
      });

      it("should fail if custom ssl key is set, but ssl cert isn't", () => {
        expect(() =>
          stubFactory({
            ssl: true,
            sslkey: path.resolve(__dirname, '../test/ssl/server.key'),
          })
        ).to.throw(Error);
      });
    });

    context('when valid options are set', () => {
      let dirPath: string;

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

      it('should start correctly when instance is delayed', () => {
        stub = stubFactory(validDefaults);

        const waitForStubUp = stub['__waitForServiceUp'].bind(stub);
        return Promise.all([
          waitForStubUp(stub.options),
          new Promise(resolve => setTimeout(resolve, 5000)).then(() =>
            stub.start()
          ),
        ]);
      });

      it('should start correctly with valid pact URLs', () => {
        stub = stubFactory(validDefaults);
        return expect(stub.start()).to.eventually.be.fulfilled;
      });

      it('should start correctly with valid pact URLs with spaces in it', () => {
        stub = stubFactory({
          pactUrls: [
            path.resolve(
              __dirname,
              '../test/integration/me-they-weird path-success.json'
            ),
          ],
        });
        return expect(stub.start()).to.eventually.be.fulfilled;
      });

      it('should start correctly with ssl', () => {
        stub = stubFactory({ ...validDefaults, ssl: true });
        expect(stub.options.ssl).to.equal(true);
        return expect(stub.start()).to.eventually.be.fulfilled;
      });

      it('should start correctly with custom ssl cert/key', () => {
        stub = stubFactory({
          ...validDefaults,
          ssl: true,
          sslcert: path.resolve(__dirname, '../test/ssl/server.crt'),
          sslkey: path.resolve(__dirname, '../test/ssl/server.key'),
        });
        expect(stub.options.ssl).to.equal(true);
        return expect(stub.start()).to.eventually.be.fulfilled;
      });

      it('should start correctly with custom ssl cert/key but without specifying ssl flag', () => {
        stub = stubFactory({
          ...validDefaults,
          sslcert: path.resolve(__dirname, '../test/ssl/server.crt'),
          sslkey: path.resolve(__dirname, '../test/ssl/server.key'),
        });

        expect(stub.options.ssl).to.equal(true);
        return expect(stub.start()).to.eventually.be.fulfilled;
      });

      it('should start correctly with cors', () => {
        stub = stubFactory({ ...validDefaults, cors: true });
        expect(stub.options.cors).to.equal(true);
        return expect(stub.start()).to.eventually.be.fulfilled;
      });

      it('should start correctly with port', () => {
        const port = Math.floor(Math.random() * 999) + 9000;
        stub = stubFactory({ ...validDefaults, port: port });
        expect(stub.options.port).to.equal(port);
        return expect(stub.start()).to.eventually.be.fulfilled;
      });

      it('should start correctly with host', () => {
        const host = 'localhost';
        stub = stubFactory({ ...validDefaults, host: host });
        expect(stub.options.host).to.equal(host);
        return expect(stub.start()).to.eventually.be.fulfilled;
      });

      it('should start correctly with log', () => {
        const logPath = path.resolve(dirPath, 'log.txt');
        stub = stubFactory({ ...validDefaults, log: logPath });
        expect(stub.options.log).to.equal(logPath);
        return expect(stub.start()).to.eventually.be.fulfilled;
      });
    });

    it('should dispatch event when starting', done => {
      stub = stubFactory(validDefaults);
      stub.once('start', () => done());
      stub.start();
    });

    it('should change running state to true', () => {
      stub = stubFactory(validDefaults);
      return stub.start().then(() => expect(stub['__running']).to.be.true);
    });
  });

  describe('Stop stub', () => {
    context('when already started', () => {
      it('should stop running', () => {
        stub = stubFactory(validDefaults);
        return stub.start().then(() => stub.stop());
      });

      it('should dispatch event when stopping', done => {
        stub = stubFactory(validDefaults);
        stub.once('stop', () => done());
        stub.start().then(() => stub.stop());
      });

      it('should change running state to false', () => {
        stub = stubFactory(validDefaults);
        return stub
          .start()
          .then(() => stub.stop())
          .then(() => expect(stub['__running']).to.be.false);
      });
    });
  });

  describe('Delete stub', () => {
    context('when already running', () => {
      it('should stop & delete stub', () => {
        stub = stubFactory(validDefaults);
        return stub.start().then(() => stub.delete());
      });

      it('should dispatch event when deleting', done => {
        stub = stubFactory(validDefaults);
        stub.once('delete', () => done());
        stub.start().then(() => stub.delete());
      });

      it('should change running state to false', () => {
        stub = stubFactory(validDefaults);
        return stub
          .start()
          .then(() => stub.delete())
          .then(() => expect(stub['__running']).to.be.false);
      });
    });
  });
});
