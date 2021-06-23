import path = require('path');
import fs = require('fs');
import logger, { verboseIsImplied } from './logger';
import spawn from './spawn';
import { timeout, TimeoutError } from 'promise-timeout';
import { DEFAULT_ARG } from './spawn';
import pactStandalone from './pact-standalone';
import checkTypes = require('check-types');

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
  };

  constructor(options: PublisherOptions) {
    options = options || {};
    // Setting defaults
    options.tags = options.tags || [];
    options.timeout = options.timeout || 60000;

    checkTypes.assert.nonEmptyString(
      options.pactBroker,
      'Must provide the pactBroker argument'
    );
    checkTypes.assert.nonEmptyString(
      options.consumerVersion,
      'Must provide the consumerVersion argument'
    );
    checkTypes.assert.arrayLike(
      options.pactFilesOrDirs,
      'Must provide the pactFilesOrDirs argument'
    );
    checkTypes.assert.nonEmptyArray(
      options.pactFilesOrDirs,
      'Must provide the pactFilesOrDirs argument with an array'
    );

    if (options.pactFilesOrDirs) {
      checkTypes.assert.array.of.string(options.pactFilesOrDirs);

      // Resolve all paths as absolute paths
      options.pactFilesOrDirs = options.pactFilesOrDirs.map((v) => {
        const newPath = path.resolve(v);
        if (!fs.existsSync(newPath)) {
          throw new Error(
            `Path '${v}' given in pactFilesOrDirs does not exists.`
          );
        }
        return newPath;
      });
    }

    if (options.pactBroker) {
      checkTypes.assert.string(options.pactBroker);
    }

    if (options.pactBrokerUsername) {
      checkTypes.assert.string(options.pactBrokerUsername);
    }

    if (options.pactBrokerPassword) {
      checkTypes.assert.string(options.pactBrokerPassword);
    }

    if (options.verbose === undefined && verboseIsImplied()) {
      options.verbose = true;
    }

    if (
      (options.pactBrokerUsername && !options.pactBrokerPassword) ||
      (options.pactBrokerPassword && !options.pactBrokerUsername)
    ) {
      throw new Error(
        'Must provide both Pact Broker username and password. None needed if authentication on Broker is disabled.'
      );
    }

    if (
      options.pactBrokerToken &&
      (options.pactBrokerUsername || options.pactBrokerPassword)
    ) {
      throw new Error(
        'Must provide pactBrokerToken or pactBrokerUsername/pactBrokerPassword but not both.'
      );
    }

    this.options = options;
  }

  public publish(): Promise<string[]> {
    logger.info(`Publishing pacts to broker at: ${this.options.pactBroker}`);

    return timeout(
      new Promise<string[]>((resolve, reject) => {
        const instance = spawn.spawnBinary(
          pactStandalone.brokerPath,
          [{ cliVerb: 'publish' }, this.options],
          this.__argMapping
        );
        const output: Array<string | Buffer> = [];
        instance.stdout.on('data', (l) => output.push(l));
        instance.stderr.on('data', (l) => output.push(l));
        instance.once('close', (code) => {
          const o = output.join('\n');
          const pactUrls = /^https?:\/\/.*\/pacts\/.*$/gim.exec(o);
          if (code !== 0 || !pactUrls) {
            logger.error(`Could not publish pact:\n${o}`);
            return reject(new Error(o));
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

export interface PublisherOptions {
  pactFilesOrDirs: string[];
  pactBroker: string;
  consumerVersion: string;
  pactBrokerUsername?: string;
  pactBrokerPassword?: string;
  pactBrokerToken?: string;
  tags?: string[];
  verbose?: boolean;
  timeout?: number;
}
