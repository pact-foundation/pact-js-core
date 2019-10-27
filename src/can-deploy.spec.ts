// tslint:disable:no-string-literal

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
    brokerMock(PORT).then(s => {
      logger.debug(`Pact Broker Mock listening on port: ${PORT}`);
      server = s;
    }),
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
      const value = { pactBroker: 'some broker' };
      const result = CanDeploy.convertForSpawnBinary(value);
      expect(result).to.be.an('array');
      expect(result.length).to.be.equal(1);
      expect(result[0]).to.be.deep.equal(value);
    });

    it('has version and participant in the right order', () => {
      const result = CanDeploy.convertForSpawnBinary({
        participantVersion: 'v1',
        participant: 'one',
        pactBroker: 'some broker',
        pactBrokerUsername: 'username',
        pactBrokerPassword: 'password',
      });

      expect(result).to.eql([
        { participant: 'one' },
        { participantVersion: 'v1' },
        {
          pactBroker: 'some broker',
          pactBrokerUsername: 'username',
          pactBrokerPassword: 'password',
        },
      ]);
    });

    it('has latest tag and participant in the right order', () => {
      const result = CanDeploy.convertForSpawnBinary({
        latest: 'v2',
        participant: 'two',
        pactBroker: 'some broker',
      });

      expect(result).to.eql([
        { participant: 'two' },
        { latest: 'v2' },
        {
          pactBroker: 'some broker',
        },
      ]);
    });
  });

  context('when invalid options are set', () => {
    it('should fail with an Error when not given pactBroker', () => {
      expect(() => canDeployFactory({} as CanDeployOptions)).to.throw(Error);
    });

    it('should fail with an Error when not given participant', () => {
      expect(() =>
        canDeployFactory({
          pactBroker: 'http://localhost',
          participantVersion: 'v1',
        } as CanDeployOptions),
      ).to.throw(Error);
    });

    it('should fail with an Error when not given version', () => {
      expect(() =>
        canDeployFactory({
          pactBroker: 'http://localhost',
          participant: 'p1',
        } as CanDeployOptions),
      ).to.throw(Error);
    });

    it('should fail with an error when version and paticipants are empty', () => {
      expect(() =>
        canDeployFactory({
          pactBroker: 'http://localhost',
          participantVersion: undefined,
          participant: undefined,
        }),
      ).to.throw(Error);
    });

    it("should fail with an error when 'latest' is an empty string", () => {
      expect(() =>
        canDeployFactory({
          pactBroker: 'http://localhost',
          participantVersion: 'v1',
          participant: 'p1',
          latest: '',
        }),
      ).to.throw(Error);
    });

    it("should fail with an error when 'to' is an empty string", () => {
      expect(() =>
        canDeployFactory({
          pactBroker: 'http://localhost',
          participantVersion: 'v1',
          participant: 'p1',
          to: '',
        }),
      ).to.throw(Error);
    });
  });

  context('when valid options are set', () => {
    it('should return a CanDeploy object when given the correct arguments', () => {
      const c = canDeployFactory({
        pactBroker: 'http://localhost',
        participantVersion: 'v1',
        participant: 'p1',
      });
      expect(c).to.be.ok;
      expect(c.canDeploy).to.be.a('function');
    });

    it("should work when using 'latest' with either a boolean or a string", () => {
      const opts: CanDeployOptions = {
        pactBroker: 'http://localhost',
        participantVersion: 'v1',
        participant: 'p1',
      };
      opts.latest = true;
      expect(canDeployFactory(opts)).to.be.ok;
      opts.latest = 'tag';
      expect(canDeployFactory(opts)).to.be.ok;
    });
  });
  context('candeploy function', () => {
    it('should return success with a table result deployable true', done => {
      const opts: CanDeployOptions = {
        pactBroker: `http://localhost:${PORT}`,
        participantVersion: '4',
        participant: 'Foo',
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
        participantVersion: '4',
        participant: 'FooFail',
      };
      const ding = canDeployFactory(opts);

      return ding
        .canDeploy()
        .then(() => expect.fail())
        .catch(message => expect(message).not.be.null);
    });

    it('should return success with a json result deployable true', done => {
      const opts: CanDeployOptions = {
        pactBroker: `http://localhost:${PORT}`,
        participantVersion: '4',
        participant: 'Foo',
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
        participantVersion: '4',
        participant: 'FooFail',
        output: 'json',
      };
      const ding = canDeployFactory(opts);

      return ding
        .canDeploy()
        .then(() => expect.fail())
        .catch(message => expect(message).not.be.null);
    });
  });
});
