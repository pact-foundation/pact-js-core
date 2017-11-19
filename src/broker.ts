import checkTypes = require("check-types");
import q = require("q");
import _ = require("underscore");
import logger from "./logger";

const request = q.denodeify(require("request"));

export class Broker {
	public static create(options: BrokerOptions) {
		// defaults
		options.username = options.username;
		options.password = options.password;
		options.tags = options.tags || [];

		checkTypes.assert.nonEmptyString(options.brokerUrl);
		checkTypes.assert.nonEmptyString(options.provider);

		if (options.tags) {
			checkTypes.assert.array.of.string(options.tags);
		}

		if (options.username) {
			checkTypes.assert.string(options.username);
		}

		if (options.password) {
			checkTypes.assert.string(options.password);
		}

		return new Broker(options);
	}

	public readonly options: BrokerOptions;

	constructor(options: BrokerOptions) {
		this.options = options;
	}

	// Find Pacts returns the raw response from the HAL resource
	public findPacts(tag?: string): q.Promise<any> {
		logger.debug(`finding pacts for Provider: ${this.options.provider} Tag: ${tag}`);
		const requestOptions = {
			uri: this.options.brokerUrl,
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			},
			"auth": this.options.username && this.options.password ? {
				"user": this.options.username,
				"password": this.options.password
			} : null
		};
		return request(requestOptions)
			.then((data) => data[0])
			.then((response) => {
				if (response.statusCode < 200 && response.statusCode >= 300) {
					return q.reject(response);
				}
				const body = JSON.parse(response.body);
				return request(_.extend({}, requestOptions, {uri: body._links[`pb:latest-provider-pacts${tag ? "-with-tag" : ""}`].href.replace("{tag}", tag).replace("{provider}", this.options.provider)}));
			})
			.then((data) => data[0])
			.then((response) => response.statusCode < 200 && response.statusCode >= 300 ? q.reject(response) : JSON.parse(response.body));
	}

	// Find all consumers collates all of the pacts for a given provider (with optional tags)
	// and removes duplicates (e.g. where multiple tags on the same pact)
	public findConsumers(): q.Promise<string[]> {
		logger.debug("Finding consumers");
		const promises = _.isEmpty(this.options.tags) ? [this.findPacts()] : _.map(this.options.tags, (t) => this.findPacts(t));

		return q.all(promises)
			.then((values) => _.reduce(values, (array, v) => {
				if (v && v._links && v._links.pacts) {
					array.push(..._.pluck(v._links.pacts, "href"));
				}
				return array;
			}, []))
			.catch(() => q.reject(`Unable to find pacts for given provider '${this.options.provider}' and tags '${this.options.tags}'`));
	}
}

// Creates a new instance of the Pact Broker HAL client with the specified option
export default Broker.create;

export interface BrokerOptions {
	brokerUrl: string;
	provider: string;
	username?: string;
	password?: string;
	tags?: string[];
}
