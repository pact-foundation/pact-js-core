import { timeout, TimeoutError } from 'promise-timeout';
import * as _ from 'underscore';
import checkTypes = require('check-types');

import { CanDeployOptions, CanDeployResponse } from './types';
import logger, { verboseIsImplied } from '../logger';
import pactStandalone from '../pact-standalone';
import spawn, { PACT_NODE_NO_VALUE } from '../spawn';
import { CannotDeployError } from './CannotDeployError';

export class CanDeploy {
  public static convertForSpawnBinary(
    options: CanDeployOptions
  ): CanDeployOptions[] {
    return _.flatten(
      [_.omit(options, 'pacticipants')].concat(
        options.pacticipants.map(({ name, latest, version }) => [
          { name },
          version
            ? { version }
            : {
                latest: latest === true ? PACT_NODE_NO_VALUE : latest,
              },
        ])
      )
    );
  }

  public readonly options: CanDeployOptions;

  private readonly __argMapping = {
    name: '--pacticipant',
    version: '--version',
    latest: '--latest',
    to: '--to',
    pactBroker: '--broker-base-url',
    pactBrokerToken: '--broker-token',
    pactBrokerUsername: '--broker-username',
    pactBrokerPassword: '--broker-password',
    output: '--output',
    verbose: '--verbose',
    retryWhileUnknown: '--retry-while-unknown',
    retryInterval: '--retry-interval',
  };

  constructor(passedOptions: CanDeployOptions) {
    const options = { ...passedOptions };
    // Setting defaults
    options.timeout = options.timeout || 60000;
    if (!options.output) {
      options.output = 'json';
    }

    checkTypes.assert.nonEmptyArray(
      options.pacticipants,
      'Must provide at least one pacticipant'
    );

    checkTypes.assert.nonEmptyString(
      options.pactBroker,
      'Must provide the pactBroker argument'
    );

    if (options.pactBrokerToken !== undefined) {
      checkTypes.assert.nonEmptyString(options.pactBrokerToken);
    }
    if (options.pactBrokerUsername !== undefined) {
      checkTypes.assert.string(options.pactBrokerUsername);
    }
    if (options.pactBrokerPassword !== undefined) {
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

    this.options = options;
  }

  public canDeploy(): Promise<CanDeployResponse | string> {
    logger.info(
      `Asking broker at ${this.options.pactBroker} if it is possible to deploy`
    );
    const canDeployPromise = new Promise<CanDeployResponse | string>(
      (resolve, reject) => {
        const instance = spawn.spawnBinary(
          pactStandalone.brokerFullPath,
          [
            { cliVerb: 'can-i-deploy' },
            ...CanDeploy.convertForSpawnBinary(this.options),
          ],
          this.__argMapping
        );
        const output: Array<string | Buffer> = [];
        if (instance.stdout && instance.stderr) {
          instance.stdout.on('data', (l) => output.push(l));
          instance.stderr.on('data', (l) => output.push(l));
        }
        instance.once('close', (code) => {
          const result: string = output.join('\n');

          if (this.options.output === 'json') {
            try {
              const startIndex = output.findIndex((l: string | Buffer) =>
                l.toString().startsWith('{')
              );
              if (startIndex === -1) {
                logger.error(
                  `can-i-deploy produced no json output:\n${result}`
                );
                return reject(new Error(result));
              }
              if (startIndex !== 0) {
                logger.warn(
                  `can-i-deploy produced additional output: \n${output.slice(
                    0,
                    startIndex
                  )}`
                );
              }
              const jsonPart = output.slice(startIndex).join('\n');

              const parsed = JSON.parse(jsonPart) as CanDeployResponse;
              if (code === 0 && parsed.summary.deployable) {
                return resolve(parsed);
              }
              return reject(new CannotDeployError(parsed));
            } catch (e) {
              logger.error(`can-i-deploy produced non-json output:\n${result}`);
              return reject(new Error(result));
            }
          }

          if (code === 0) {
            logger.info(result);
            return resolve(result);
          }

          logger.error(
            `can-i-deploy did not return success message:\n${result}`
          );
          return reject(new CannotDeployError(result));
        });
      }
    );

    return timeout(canDeployPromise, this.options.timeout as number).catch(
      (err: Error) => {
        if (err instanceof TimeoutError) {
          throw new Error(
            `Timeout waiting for publication process to complete`
          );
        }
        throw err;
      }
    );
  }
}

export default (options: CanDeployOptions): CanDeploy => new CanDeploy(options);
