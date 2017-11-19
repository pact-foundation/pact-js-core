import _ = require("underscore");
import q = require("q");
import serverFactory, {Server, ServerOptions} from "./server";
import verifierFactory, {VerifierOptions} from "./verifier";
import publisherFactory, {PublisherOptions} from "./publisher";
import logger, {LogLevels} from "./logger";

export class Pact {
	private __servers: Server[] = [];

	constructor() {
		// Listen for Node exiting or someone killing the process
		// Must remove all the instances of Pact mock service
		process.once("exit", () => this.removeAllServers());
		process.once("SIGINT", process.exit);
	}

	public logLevel(level?: LogLevels): number | void {
		return level ? logger.level(level) : logger.level();
	}

	// Creates server with specified options
	public createServer(options: ServerOptions = {}): Server {
		if (options && options.port && _.some(this.__servers, (s) => s.options.port === options.port)) {
			let msg = `Port '${options.port}' is already in use by another process.`;
			logger.error(msg);
			throw new Error(msg);
		}

		let server = serverFactory(options);
		this.__servers.push(server);
		logger.info(`Creating Pact Server with options: \n${this.__stringifyOptions(server.options)}`);

		// Listen to server delete events, to remove from server list
		server.once("delete", (s: any) => {
			logger.info(`Deleting Pact Server with options: \n${this.__stringifyOptions(s.options)}`);
			this.__servers = _.without(this.__servers, s);
		});

		return server;
	}

	// Return arrays of all servers
	public listServers(): Server[] {
		return this.__servers;
	}

	// Remove all the servers that"s been created
	// Return promise of all others
	public removeAllServers(): q.Promise<Server[]> {
		if(this.__servers.length === 0) {
			return q(this.__servers);
		}

		logger.info("Removing all Pact servers.");
		return q.all<Server>(_.map(this.__servers, (server:Server) => server.delete()));
	}

	// Run the Pact Verification process
	public verifyPacts(options: VerifierOptions): q.Promise<string> {
		logger.info("Verifying Pacts.");
		return verifierFactory(options).verify();
	}

	// Publish Pacts to a Pact Broker
	public publishPacts(options: PublisherOptions): q.Promise<any[]> {
		logger.info("Publishing Pacts to Broker");
		return publisherFactory(options).publish();
	}

	private __stringifyOptions(obj: ServerOptions): string {
		return _.chain(obj)
			.pairs()
			.map((v) => v.join(" = "))
			.value()
			.join(",\n");
	}
}

export default new Pact();
