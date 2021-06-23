import path = require('path');
import fs = require('fs');
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import canDeployFactory, { CanDeploy, CanDeployOptions } from './can-deploy';
import logger from './logger';
import brokerMock from '../test/integration/broker-mock';
import * as http from 'http';
import rimraf = require('rimraf');
import mkdirp = require('mkdirp');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('CanDeploy Spec', () => {
  const PORT = Math.floor(Math.random() * 999) + 9000;
  let server: http.Server;
  let absolutePath: string;
  let relativePath: string;

  before(() =>
    brokerMock(PORT).then((s) => {
      logger.debug(`Pact Broker Mock listening on port: ${PORT}`);
      server = s;
    })
  );

  after(() => server.close());

  beforeEach(() => {
    relativePath = `.tmp/${Math.floor(Math.random() * 1000)}`;
    absolutePath = path.resolve(__dirname, '..', relativePath);
    mkdirp.sync(absolutePath);
  });

  afterEach(() => {
    if (fs.existsSync(absolutePath)) {
      rimraf.sync(absolutePath);
    }
  });

  describe('convertForSpawnBinary helper function', () => {
    it('produces an array of SpawnArguments', () => {
      const value = { pactBroker: 'some broker', pacticipants: [] };
      const result = CanDeploy.convertForSpawnBinary(value);
      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(1);
      expect(result).to.be.deep.equal([{ pactBroker: 'some broker' }]);
    });

    it('has version and participant in the right order', () => {
      const result = CanDeploy.convertForSpawnBinary({
        pacticipants: [{ version: 'v2', name: 'one' }],
        pactBroker: 'some broker',
        pactBrokerUsername: 'username',
        pactBrokerPassword: 'password',
      });

      expect(result).to.eql([
        {
          pactBroker: 'some broker',
          pactBrokerUsername: 'username',
          pactBrokerPassword: 'password',
        },
        { name: 'one' },
        { version: 'v2' },
      ]);
    });

    it('has latest tag and participant in the right order', () => {
      const result = CanDeploy.convertForSpawnBinary({
        pacticipants: [{ name: 'two', latest: 'SOME_TAG' }],
        pactBroker: 'some broker',
      });

      expect(result).to.eql([
        {
          pactBroker: 'some broker',
        },
        { name: 'two' },
        { latest: 'SOME_TAG' },
      ]);
    });

    it("understands 'true' for latest", () => {
      const result = CanDeploy.convertForSpawnBinary({
        pacticipants: [{ name: 'two', latest: true }],
        pactBroker: 'some broker',
      });

      expect(result).to.eql([
        {
          pactBroker: 'some broker',
        },
        { name: 'two' },
        { latest: 'PACT_NODE_NO_VALUE' },
      ]);
    });
  });

  context('when invalid options are set', () => {
    it('should fail with an Error when not given pactBroker', () => {
      expect(() => canDeployFactory({} as CanDeployOptions)).to.throw(Error);
    });

    it('should fail with an error when there are no paticipants', () => {
      expect(() =>
        canDeployFactory({
          pactBroker: 'http://localhost',
          pacticipants: [],
        })
      ).to.throw(Error);
    });
  });

  context('when valid options are set', () => {
    it('should return a CanDeploy object when given the correct arguments', () => {
      const c = canDeployFactory({
        pactBroker: 'http://localhost',
        pacticipants: [{ name: 'two', version: '2' }],
      });
      expect(c).to.be.ok;
      expect(c.canDeploy).to.be.a('function');
    });
  });

  context('candeploy function', () => {
    it('should return success with a table result deployable true', (done) => {
      const opts: CanDeployOptions = {
        pactBroker: `http://localhost:${PORT}`,
        pacticipants: [{ name: 'Foo', version: '4' }],
      };
      const ding = canDeployFactory(opts);

      ding.canDeploy().then((results) => {
        expect(results).not.to.be.null;
        done();
      });
    });

    context('with latest true', () => {
      it('should return success with a table result deployable true', (done) => {
        const opts: CanDeployOptions = {
          pactBroker: `http://localhost:${PORT}`,
          pacticipants: [{ name: 'Foo', latest: true }],
        };
        const ding = canDeployFactory(opts);

        ding.canDeploy().then((results) => {
          expect(results).not.to.be.null;
          done();
        });
      });

      it('should throw an error with a table result deployable false', () => {
        const opts: CanDeployOptions = {
          pactBroker: `http://localhost:${PORT}`,
          pacticipants: [{ name: 'FooFail', latest: true }],
        };
        const ding = canDeployFactory(opts);

        return ding
          .canDeploy()
          .then(() => expect.fail())
          .catch((message) => expect(message).not.be.null);
      });
    });

    context('with latest a string', () => {
      it('should return success with a table result deployable true', (done) => {
        const opts: CanDeployOptions = {
          pactBroker: `http://localhost:${PORT}`,
          pacticipants: [{ name: 'Foo', latest: 'tag' }],
        };
        const ding = canDeployFactory(opts);

        ding.canDeploy().then((results) => {
          expect(results).not.to.be.null;
          done();
        });
      });

      it('should throw an error with a table result deployable false', () => {
        const opts: CanDeployOptions = {
          pactBroker: `http://localhost:${PORT}`,
          pacticipants: [{ name: 'FooFail', latest: 'tag' }],
        };
        const ding = canDeployFactory(opts);

        return ding
          .canDeploy()
          .then(() => expect.fail())
          .catch((message) => expect(message).not.be.null);
      });
    });

    context('with latest a string, and a to', () => {
      it('should return success with a table result deployable true', (done) => {
        const opts: CanDeployOptions = {
          pactBroker: `http://localhost:${PORT}`,
          pacticipants: [{ name: 'Foo', latest: 'tag' }],
          to: 'prod',
        };
        const ding = canDeployFactory(opts);

        ding.canDeploy().then((results) => {
          expect(results).not.to.be.null;
          done();
        });
      });

      it('should throw an error with a table result deployable false', () => {
        const opts: CanDeployOptions = {
          pactBroker: `http://localhost:${PORT}`,
          pacticipants: [{ name: 'FooFail', latest: 'tag' }],
          to: 'prod',
        };
        const ding = canDeployFactory(opts);

        return ding
          .canDeploy()
          .then(() => expect.fail())
          .catch((message) => expect(message).not.be.null);
      });
    });

    it('should throw an error with a table result deployable false', () => {
      const opts: CanDeployOptions = {
        pactBroker: `http://localhost:${PORT}`,
        pacticipants: [{ name: 'FooFail', version: '4' }],
      };
      const ding = canDeployFactory(opts);

      return ding
        .canDeploy()
        .then(() => expect.fail())
        .catch((message) => expect(message).not.be.null);
    });

    it('should return success with a json result deployable true', (done) => {
      const opts: CanDeployOptions = {
        pactBroker: `http://localhost:${PORT}`,
        pacticipants: [{ name: 'Foo', version: '4' }],
        output: 'json',
      };
      const ding = canDeployFactory(opts);

      ding.canDeploy().then((results) => {
        expect(results).not.to.be.null;
        done();
      });
    });

    it('should throw an error with a json result deployable false', () => {
      const opts: CanDeployOptions = {
        pactBroker: `http://localhost:${PORT}`,
        pacticipants: [{ name: 'FooFail', version: '4' }],
        output: 'json',
      };
      const ding = canDeployFactory(opts);

      return ding
        .canDeploy()
        .then(() => expect.fail())
        .catch((message) => expect(message).not.be.null);
    });
  });
});
