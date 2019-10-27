import q = require('q');
import logger from './logger';
import spawn from './spawn';
import pactStandalone from './pact-standalone';
import * as _ from 'underscore';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const checkTypes = require('check-types');

export class CanDeploy {
  public static convertForSpawnBinary(
    options: CanDeployOptions,
  ): CanDeployOptions[] {
    // This is the order that the arguments must be in, everything else is afterwards
    const keys = ['participant', 'participantVersion', 'latest', 'to'];
    // Create copy of options, while omitting the arguments specified above
    const args: CanDeployOptions[] = [_.omit(options, keys)];

    // Go backwards in the keys as we are going to unshift them into the array
    keys.reverse().forEach(key => {
      const val = options[key];
      if (options[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj: any = {};
        obj[key] = val;
        args.unshift(obj);
      }
    });

    return args;
  }

  public readonly options: CanDeployOptions;
  private readonly __argMapping = {
    participant: '--pacticipant',
    participantVersion: '--version',
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

  constructor(options: CanDeployOptions) {
    options = options || {};
    // Setting defaults
    options.timeout = options.timeout || 60000;
    if (!options.output) {
      options.output = 'json';
    }

    checkTypes.assert.nonEmptyString(
      options.participant,
      'Must provide the participant argument',
    );
    checkTypes.assert.nonEmptyString(
      options.participantVersion,
      'Must provide the participant version argument',
    );
    checkTypes.assert.nonEmptyString(
      options.pactBroker,
      'Must provide the pactBroker argument',
    );
    options.latest !== undefined &&
      checkTypes.assert.nonEmptyString(options.latest.toString());
    options.to !== undefined && checkTypes.assert.nonEmptyString(options.to);
    options.pactBrokerToken !== undefined &&
      checkTypes.assert.nonEmptyString(options.pactBrokerToken);
    options.pactBrokerUsername !== undefined &&
      checkTypes.assert.string(options.pactBrokerUsername);
    options.pactBrokerPassword !== undefined &&
      checkTypes.assert.string(options.pactBrokerPassword);

    if (
      (options.pactBrokerUsername && !options.pactBrokerPassword) ||
      (options.pactBrokerPassword && !options.pactBrokerUsername)
    ) {
      throw new Error(
        'Must provide both Pact Broker username and password. None needed if authentication on Broker is disabled.',
      );
    }

    this.options = options;
  }

  public canDeploy(): q.Promise<CanDeployResponse | string> {
    logger.info(
      `Asking broker at ${this.options.pactBroker} if it is possible to deploy`,
    );
    const deferred = q.defer<CanDeployResponse | string>();
    const instance = spawn.spawnBinary(
      `${pactStandalone.brokerPath} can-i-deploy`,
      CanDeploy.convertForSpawnBinary(this.options),
      this.__argMapping,
    );
    const output: Array<string | Buffer> = [];
    instance.stdout.on('data', l => output.push(l));
    instance.stderr.on('data', l => output.push(l));
    instance.once('close', code => {
      const result: string = output.join('\n');

      if (this.options.output === 'json') {
        try {
          const parsed = JSON.parse(result) as CanDeployResponse;
          if (code === 0 && parsed.summary.deployable) {
            return deferred.resolve(parsed);
          }
          return deferred.reject(parsed);
        } catch (e) {
          logger.error(`can-i-deploy produced non-json output:\n${result}`);
          return deferred.reject(new Error(result));
        }
      }

      if (code === 0) {
        logger.info(result);
        return deferred.resolve(result);
      }

      logger.error(`can-i-deploy did not return success message:\n${result}`);
      return deferred.reject(result);
    });

    return deferred.promise.timeout(
      this.options.timeout as number,
      `Timeout waiting for verification process to complete (PID: ${instance.pid})`,
    );
  }
}

export default (options: CanDeployOptions): CanDeploy => new CanDeploy(options);

export interface CanDeployOptions {
  participant?: string;
  participantVersion?: string;
  to?: string;
  latest?: boolean | string;
  pactBroker: string;
  pactBrokerToken?: string;
  pactBrokerUsername?: string;
  pactBrokerPassword?: string;
  output?: 'json' | 'table';
  verbose?: boolean;
  retryWhileUnknown?: number;
  retryInterval?: number;
  timeout?: number;
}

export interface CanDeployPacticipant {
  name: string;
  version: { number: string };
}

export interface CanDeployResponse {
  summary: { deployable: boolean; reason: string; unknown: number };
  matrix: Array<{
    consumer: CanDeployPacticipant;
    provider: CanDeployPacticipant;
    verificationResult: { verifiedAt: string; success: boolean };
    pact: { createdAt: string };
  }>;
}
