import spawn = require('cross-spawn');
import cp = require('child_process');
import { ChildProcess, SpawnOptions } from 'child_process';
import * as path from 'path';
import logger from '../logger';
import pactEnvironment from '../pact-environment';
import argsHelper, { SpawnArguments, DEFAULT_ARG } from './arguments';

export class Spawn {
  public get cwd(): string {
    return path.resolve(__dirname, '..');
  }

  public spawnBinary(
    command: string,
    args: SpawnArguments = {},
    argMapping: { [id: string]: string } = {}
  ): ChildProcess {
    const envVars = JSON.parse(JSON.stringify(process.env)); // Create copy of environment variables
    // Remove environment variable if there
    // This is a hack to prevent some weird Travelling Ruby behaviour with Gems
    // https://github.com/pact-foundation/pact-mock-service-npm/issues/16
    delete envVars['RUBYGEMS_GEMDEPS'];

    const opts: SpawnOptions = {
      cwd: pactEnvironment.cwd,
      detached: !pactEnvironment.isWindows(),
      env: envVars,
    };

    const spawnArgs: string[] = argsHelper.toArgumentsArray(args, {
      cliVerb: DEFAULT_ARG,
      ...argMapping,
    });

    logger.debug(
      `Starting pact binary '${command}', with arguments [${spawnArgs.join(
        ' '
      )}]`
    );
    logger.trace(`Environment: ${JSON.stringify(opts)}`);
    const instance = spawn(command, spawnArgs, opts);

    instance.stdout.setEncoding('utf8');
    instance.stderr.setEncoding('utf8');
    instance.stdout.on('data', logger.debug.bind(logger));
    instance.stderr.on('data', logger.debug.bind(logger));
    instance.on('error', logger.error.bind(logger));
    instance.once('close', (code) => {
      if (code !== 0) {
        logger.warn(`Pact exited with code ${code}.`);
      }
    });

    logger.debug(`Created '${command}' process with PID: ${instance.pid}`);
    return instance;
  }

  public killBinary(binary?: ChildProcess): boolean {
    if (binary) {
      const pid = binary.pid;
      logger.info(`Removing Pact process with PID: ${pid}`);
      binary.removeAllListeners();
      // Killing instance, since windows can't send signals, must kill process forcefully
      try {
        pactEnvironment.isWindows()
          ? cp.execSync(`taskkill /f /t /pid ${pid}`)
          : process.kill(-pid, 'SIGINT');
      } catch (e) {
        return false;
      }
    }
    return true;
  }
}

export default new Spawn();
