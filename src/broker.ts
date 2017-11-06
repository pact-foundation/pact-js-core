import checkTypes = require("check-types");
import traverson = require("traverson-promise");
import JsonHalAdapter = require("traverson-hal");
import q = require("q");
import logger from "./logger";

// register the traverson-hal plug-in for media type "application/hal+json"
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);

const pactURLPattern = "/pacts/provider/%s/latest";
const pactURLPatternWithTag = "/pacts/provider/%s/latest/%s";

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
	private __requestOptions;

	constructor(options: BrokerOptions) {
		this.options = options;
		this.__requestOptions = this.options.username && this.options.password ? {
			"auth": {
				"user": this.options.username,
				"password": this.options.password
			}
		} : {};
	}

	// Find Pacts returns the raw response from the HAL resource
	public findPacts(tag?: string) {
		logger.debug("finding pacts for Provider:", this.options.provider, ", Tag:", tag);

		const linkName = tag ? "pb:latest-provider-pacts-with-tag" : "pb:latest-provider-pacts";
		return traverson
			.from(this.options.brokerUrl)
			.withTemplateParameters({provider: this.options.provider, tag: tag})
			.withRequestOptions(this.__requestOptions)
			.jsonHal()
			.follow(linkName)
			.getResource()
			.result;
	}

	// Find all consumers collates all of the pacts for a given provider (with optional tags)
	// and removes duplicates (e.g. where multiple tags on the same pact)
	public findConsumers():q.Promise<string[]> {
		logger.debug("Finding consumers");
		const promises = (this.options.tags.length > 0) ? this.options.tags.map(this.findPacts, this) : [this.findPacts()];

		return q.all(promises)
			.then((values) => {
				const pactUrls = {};
				values.forEach((response) => {
					if (response && response._links && response._links.pacts) {
						response._links.pacts.forEach((pact) => pactUrls[pact.title] = pact.href);
					}
				});
				return Object.keys(pactUrls).reduce((pacts, key) => {
					pacts.push(pactUrls[key]);
					return pacts;
				}, []);
			})
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
