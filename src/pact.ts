import * as _ from 'underscore';
import serverFactory, { Server, ServerOptions } from './server';
import stubFactory, { Stub, StubOptions } from './stub';
import verifierFactory from './verifier';
import { VerifierOptions } from './verifier/types';
import messageFactory from './message';
import publisherFactory from './publisher';
import canDeployFactory from './can-deploy';
import logger, { setLogLevel } from './logger';
import { LogLevel } from './logger/types';
import { MessageOptions, PublisherOptions } from './types';
import { AbstractService } from './service';
import { CanDeployOptions, CanDeployResponse } from './can-deploy/types';

export class Pact {
  private __servers: Server[] = [];

  private __stubs: Stub[] = [];

  constructor() {
    // Check to see if we hit into Windows Long Path issue

    // Listen for Node exiting or someone killing the process
    // Must remove all the instances of Pact mock service
    process.once('exit', () => this.removeAll());
    process.once('SIGINT', () => process.exit());
  }

  public logLevel(level?: LogLevel): void {
    return setLogLevel(level);
  }

  // Creates server with specified options
  public createServer(options: ServerOptions = {}): Server {
    if (
      options &&
      options.port &&
      _.some(this.__servers, (s: Server) => s.options.port === options.port)
    ) {
      const msg = `Port '${options.port}' is already in use by another process.`;
      logger.error(msg);
      throw new Error(msg);
    }

    const server = serverFactory(options);
    this.__servers.push(server);
    logger.info(
      `Creating Pact Server with options: \n${JSON.stringify(server.options)}`
    );

    // Listen to server delete events, to remove from server list
    server.once(AbstractService.Events.DELETE_EVENT, (s: Server) => {
      logger.info(
        `Deleting Pact Server with options: \n${JSON.stringify(s.options)}`
      );
      this.__servers = _.without(this.__servers, s);
    });

    return server;
  }

  // Return arrays of all servers
  public listServers(): Server[] {
    return this.__servers;
  }

  // Remove all the servers that have been created
  // Return promise of all others
  public removeAllServers(): Promise<Server[]> {
    if (this.__servers.length === 0) {
      return Promise.resolve(this.__servers);
    }

    logger.info('Removing all Pact servers.');
    return Promise.all<Server>(
      _.map(this.__servers, (server: Server) => server.delete())
    );
  }

  // Creates stub with specified options
  public createStub(options: StubOptions = {}): Stub {
    if (
      options &&
      options.port &&
      _.some(this.__stubs, (s: Stub) => s.options.port === options.port)
    ) {
      const msg = `Port '${options.port}' is already in use by another process.`;
      logger.error(msg);
      throw new Error(msg);
    }

    const stub = stubFactory(options);
    this.__stubs.push(stub);
    logger.info(
      `Creating Pact Stub with options: \n${JSON.stringify(stub.options)}`
    );

    // Listen to stub delete events, to remove from stub list
    stub.once(AbstractService.Events.DELETE_EVENT, (s: Stub) => {
      logger.info(
        `Deleting Pact Stub with options: \n${JSON.stringify(stub.options)}`
      );
      this.__stubs = _.without(this.__stubs, s);
    });

    return stub;
  }

  // Return arrays of all stubs
  public listStubs(): Stub[] {
    return this.__stubs;
  }

  // Remove all the stubs that have been created
  // Return promise of all others
  public removeAllStubs(): Promise<Stub[]> {
    if (this.__stubs.length === 0) {
      return Promise.resolve(this.__stubs);
    }

    logger.info('Removing all Pact stubs.');
    return Promise.all<Stub>(
      _.map(this.__stubs, (stub: Stub) => stub.delete())
    );
  }

  // Remove all the servers and stubs
  public removeAll(): Promise<AbstractService[]> {
    return Promise.all<AbstractService>(
      _.flatten([this.removeAllStubs(), this.removeAllServers()])
    );
    // .tap(endDestination);
  }

  // Run the Pact Verification process
  public verifyPacts(options: VerifierOptions): Promise<string> {
    logger.info('Verifying Pacts.');
    return verifierFactory(options).verify();
  }

  // Run the Message Pact creation process
  public createMessage(options: MessageOptions): Promise<unknown> {
    logger.info('Creating Message');
    return messageFactory(options).createMessage();
  }

  // Publish Pacts to a Pact Broker
  public publishPacts(options: PublisherOptions): Promise<string[]> {
    logger.info('Publishing Pacts to Broker');
    return publisherFactory(options).publish();
  }

  // Use can-i-deploy to determine if it is safe to deploy
  public canDeploy(
    options: CanDeployOptions
  ): Promise<CanDeployResponse | string> {
    logger.info('Checking if it it possible to deploy');
    return canDeployFactory(options).canDeploy();
  }
}

export default new Pact();
