import * as q from "q";
import serverFactory, {Server, ServerOptions} from "./server";
import stubFactory, {Stub, StubOptions} from "./stub";
import verifierFactory, {VerifierOptions} from "./verifier";
import messageFactory, {MessageOptions} from "./message";
import publisherFactory, {PublisherOptions} from "./publisher";
import logger, {LogLevels} from "./logger";
import {AbstractService} from "./service";
import * as _ from "underscore";

export class Pact {
	private __servers: Server[] = [];
	private __stubs: Stub[] = [];

	constructor() {
		// Listen for Node exiting or someone killing the process
		// Must remove all the instances of Pact mock service
		process.once("exit", () => this.removeAll());
		process.once("SIGINT", () => process.exit());
	}

	public logLevel(level?: LogLevels): number | void {
		return level ? logger.level(level) : logger.level();
	}

	// Creates server with specified options
	public createServer(options: ServerOptions = {}): Server {
		if (options && options.port && _.some(this.__servers, (s: Server) => s.options.port === options.port)) {
			let msg = `Port '${options.port}' is already in use by another process.`;
			logger.error(msg);
			throw new Error(msg);
		}

		let server = serverFactory(options);
		this.__servers.push(server);
		logger.info(`Creating Pact Server with options: \n${this.__stringifyOptions(server.options)}`);

		// Listen to server delete events, to remove from server list
		server.once(AbstractService.Events.DELETE_EVENT, (s: Server) => {
			logger.info(`Deleting Pact Server with options: \n${this.__stringifyOptions(s.options)}`);
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
	public removeAllServers(): q.Promise<Server[]> {
		if (this.__servers.length === 0) {
			return q(this.__servers);
		}

		logger.info("Removing all Pact servers.");
		return q.all<Server>(_.map(this.__servers, (server: Server) => server.delete() as PromiseLike<Server>));
	}

	// Creates stub with specified options
	public createStub(options: StubOptions = {}): Stub {
		if (options && options.port && _.some(this.__stubs, (s: Stub) => s.options.port === options.port)) {
			let msg = `Port '${options.port}' is already in use by another process.`;
			logger.error(msg);
			throw new Error(msg);
		}

		let stub = stubFactory(options);
		this.__stubs.push(stub);
		logger.info(`Creating Pact Stub with options: \n${this.__stringifyOptions(stub.options)}`);

		// Listen to stub delete events, to remove from stub list
		stub.once(AbstractService.Events.DELETE_EVENT, (s: Stub) => {
			logger.info(`Deleting Pact Stub with options: \n${this.__stringifyOptions(s.options)}`);
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
	public removeAllStubs(): q.Promise<Stub[]> {
		if (this.__stubs.length === 0) {
			return q(this.__stubs);
		}

		logger.info("Removing all Pact stubs.");
		return q.all<Stub>(_.map(this.__stubs, (stub: Stub) => stub.delete() as PromiseLike<Stub>));
	}

	// Remove all the servers and stubs
	public removeAll(): q.Promise<AbstractService[]> {
		return q.all<AbstractService>(_.flatten([this.removeAllStubs(), this.removeAllServers()]));
	}

	// Run the Pact Verification process
	public verifyPacts(options: VerifierOptions): q.Promise<string> {
		logger.info("Verifying Pacts.");
		return verifierFactory(options).verify();
	}

	// Run the Message Pact creation process
	public createMessage(options: MessageOptions): q.Promise<string> {
		logger.info("Creating Message");
		return messageFactory(options).createMessage();
	}

	// Publish Pacts to a Pact Broker
	public publishPacts(options: PublisherOptions): q.Promise<any[]> {
		logger.info("Publishing Pacts to Broker");
		return publisherFactory(options).publish();
	}
	// Publish Pacts to a Pact Broker
	public canDeploy(options: PublisherOptions): q.Promise<any[]> {
		logger.info("Publishing Pacts to Broker");
		return publisherFactory(options).canDeploy();
	}

	private __stringifyOptions(obj: ServerOptions): string {
		return _.chain(obj)
			.pairs()
			.map((v: string[]) => v.join(" = "))
			.value()
			.join(",\n");
	}
}

export default new Pact();
