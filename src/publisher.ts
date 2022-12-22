import path = require('path');
import fs = require('fs');
import { timeout, TimeoutError } from 'promise-timeout';
import checkTypes = require('check-types');
import logger, { verboseIsImplied } from './logger';
import spawn, { DEFAULT_ARG } from './spawn';
import pactStandalone from './pact-standalone';
import { PublisherOptions } from './types';

export class Publisher {
  public readonly options: PublisherOptions;

  private readonly __argMapping = {
    pactFilesOrDirs: DEFAULT_ARG,
    pactBroker: '--broker-base-url',
    pactBrokerUsername: '--broker-username',
    pactBrokerPassword: '--broker-password',
    pactBrokerToken: '--broker-token',
    tags: '--tag',
    consumerVersion: '--consumer-app-version',
    verbose: '--verbose',
    buildUrl: '--build-url',
    branch: '--branch',
    autoDetectVersionProperties: '--auto-detect-version-properties',
  };

  constructor(passedOptions: PublisherOptions) {
    this.options = passedOptions || {};
    // Setting defaults
    this.options.tags = this.options.tags || [];
    this.options.timeout = this.options.timeout || 60000;

    checkTypes.assert.nonEmptyString(
      this.options.pactBroker,
      'Must provide the pactBroker argument'
    );
    checkTypes.assert.nonEmptyString(
      this.options.consumerVersion,
      'Must provide the consumerVersion argument'
    );
    checkTypes.assert.arrayLike(
      this.options.pactFilesOrDirs,
      'Must provide the pactFilesOrDirs argument'
    );
    checkTypes.assert.nonEmptyArray(
      this.options.pactFilesOrDirs,
      'Must provide the pactFilesOrDirs argument with an array'
    );

    if (this.options.pactFilesOrDirs) {
      checkTypes.assert.array.of.string(this.options.pactFilesOrDirs);

      // Resolve all paths as absolute paths
      this.options.pactFilesOrDirs = this.options.pactFilesOrDirs.map((v) => {
        const newPath = path.resolve(v);
        if (!fs.existsSync(newPath)) {
          throw new Error(
            `Path '${v}' given in pactFilesOrDirs does not exists.`
          );
        }
        return newPath;
      });
    }

    if (this.options.pactBroker) {
      checkTypes.assert.string(this.options.pactBroker);
    }

    if (this.options.pactBrokerUsername) {
      checkTypes.assert.string(this.options.pactBrokerUsername);
    }

    if (this.options.pactBrokerPassword) {
      checkTypes.assert.string(this.options.pactBrokerPassword);
    }

    if (this.options.verbose === undefined && verboseIsImplied()) {
      this.options.verbose = true;
    }

    if (
      (this.options.pactBrokerUsername && !this.options.pactBrokerPassword) ||
      (this.options.pactBrokerPassword && !this.options.pactBrokerUsername)
    ) {
      throw new Error(
        'Must provide both Pact Broker username and password. None needed if authentication on Broker is disabled.'
      );
    }

    if (
      this.options.pactBrokerToken &&
      (this.options.pactBrokerUsername || this.options.pactBrokerPassword)
    ) {
      throw new Error(
        'Must provide pactBrokerToken or pactBrokerUsername/pactBrokerPassword but not both.'
      );
    }

    if (this.options.branch) {
      checkTypes.assert.string(this.options.branch);
    }

    if (this.options.autoDetectVersionProperties) {
      checkTypes.assert.boolean(this.options.autoDetectVersionProperties);
    }
  }

  public publish(): Promise<string[]> {
    logger.info(`Publishing pacts to broker at: ${this.options.pactBroker}`);

    return timeout(
      new Promise<string[]>((resolve, reject) => {
        const instance = spawn.spawnBinary(
          pactStandalone.brokerFullPath,
          [{ cliVerb: 'publish' }, this.options],
          this.__argMapping
        );
        const output: Array<string | Buffer> = [];
        if (instance.stderr && instance.stdout) {
          instance.stdout.on('data', (l) => output.push(l));
          instance.stderr.on('data', (l) => output.push(l));
        }
        instance.once('close', (code) => {
          const o = output.join('\n');
          const pactUrls = /https?:\/\/.*\/pacts\/.*$/gim.exec(o);
          if (code !== 0) {
            const message = `Pact publication failed with non-zero exit code. Full output was:\n${o}`;
            logger.error(message);
            return reject(new Error(message));
          }
          if (!pactUrls) {
            const message = `Publication appeared to fail, as we did not detect any pact URLs in the following output:\n${o}`;
            logger.error(message);
            return reject(new Error(message));
          }

          logger.info(o);
          return resolve(pactUrls);
        });
      }),
      this.options.timeout as number
    ).catch((err: Error) => {
      if (err instanceof TimeoutError) {
        throw new Error(`Timeout waiting for publication process to complete`);
      }
      throw err;
    });
  }
}

export default (options: PublisherOptions): Publisher => new Publisher(options);
