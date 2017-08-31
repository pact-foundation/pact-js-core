import checkTypes = require("check-types");
import _ = require("underscore");
import path = require("path");
import fs = require("fs");
import q = require("q");
import request = require("request");
import urlJoin = require("url-join");
import logger from "./logger";

const http = q.denodeify(request);

export class Publisher {

	public static create(options: PublisherOptions): Publisher {
		options = options || {};
		// Setting defaults
		options.pactBroker = options.pactBroker || "";
		options.pactUrls = options.pactUrls || [];
		options.tags = options.tags || [];

		if (options.pactUrls) {
			checkTypes.assert.array.of.string(options.pactUrls);
		}

		// Stat all paths in pactUrls to make sure they exist
		let url = require("url");
		_.each(options.pactUrls, (uri) => {
			// only check local files
			let proto = url.parse(uri).protocol;
			if (proto === "file://" || proto === null) {
				try {
					fs.statSync(path.normalize(uri));
				} catch (e) {
					throw new Error(`Pact contract or directory: '${uri}' doesn't exist`);
				}
			}
		});

		checkTypes.assert.nonEmptyString(options.pactBroker, "Must provide the pactBroker argument");
		checkTypes.assert.nonEmptyString(options.consumerVersion, "Must provide the consumerVersion argument");
		checkTypes.assert.not.emptyArray(options.pactUrls, "Must provide the pactUrls argument");

		if (options.pactBrokerUsername) {
			checkTypes.assert.string(options.pactBrokerUsername);
		}

		if (options.pactBrokerPassword) {
			checkTypes.assert.string(options.pactBrokerPassword);
		}

		if ((options.pactBrokerUsername && !options.pactBrokerPassword) || (options.pactBrokerPassword && !options.pactBrokerUsername)) {
			throw new Error("Must provide both or none of --provider-states-url and --provider-states-setup-url.");
		}

		if (options.pactBroker) {
			checkTypes.assert.string(options.pactBroker);
		}

		return new Publisher(options);
	}

	private __options: PublisherOptions;

	constructor(options: PublisherOptions = {}) {
		this.__options = options;
	}

	public publish(): q.Promise<any[]> {
		logger.info(`Publishing pacts to broker at: ${this.__options.pactBroker}`);

		// Return a promise that does everything one after another
		return q(_.chain(this.__options.pactUrls)
			.map((uri) => {
				// Stat all paths in pactUrls to make sure they exist
				// publish template $pactHost/pacts/provider/$provider/consumer/$client/$version
				let localFileOrDir = path.normalize(uri);
				if (!(/^http/.test(uri)) && fs.statSync(localFileOrDir) && fs.statSync(localFileOrDir).isDirectory()) {
					uri = localFileOrDir;
					return _.map(fs.readdirSync(uri, ""), (file) => {
						if (/\.json$/.test(file)) {
							return path.join(uri, file);
						}
					});
				} else {
					return uri;
				}
			})
			.flatten(true)
			.compact()
			.value())
		// Get the pact contract either from local file or broker
			.then((uris) => q.allSettled(
				_.map(uris, (uri) => this.__getPactFile(this.__options, uri)))
				.then((data) => { // Make sure all files have been retrieved
					let rejects = [];
					data = _.map(data, (result) => {
						if (result.state === "fulfilled") {
							return result.value;
						}
						rejects.push(result.reason);
					});
					return rejects.length ? q.reject(new Error(`Could not retrieve all Pact contracts:\n  - ${rejects.join("\n  - ")}`)) : data;
				}))
			// Publish the contracts to broker
			.tap((files) => q.allSettled(
				_.map(files, (data) =>
					this.__callPact(this.__options, {
						uri: this.__constructPutUrl(this.__options, data),
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
						json: true,
						body: data
					})
				))
				.then((results) => { // Make sure publishing promises came back fulfilled, or else error out
					let rejects = _.where(results, {state: "rejected"});
					if (rejects.length) {
						return q.reject(new Error(`Could not publish pacts to broker at '${this.__options.pactBroker}':\n  - ${rejects.join("\n  - ")}`));
					}
				})
			)
			// If publishing works, try to tag those contracts
			.tap((files) => {
				if (!this.__options.tags || !this.__options.tags.length) {
					return;
				}
				return q.allSettled(
					_.chain(files)
						.map((data) =>
							_.map(this.__options.tags, (tag) =>
								this.__callPact(this.__options, {
									uri: this.__constructTagUrl(this.__options, tag, data),
									method: "PUT",
									headers: {
										"Content-Type": "application/json"
									}
								}).fail((err) => q.reject(`Error with tag '${tag}' : ${err}`))
							)
						)
						.flatten(true)
						.value()
				).then((results) => {
					let rejects = _.where(results, {state: "rejected"});
					if (rejects.length) {
						return q.reject(new Error(`Could not tag Pact contract:\n  - ${rejects.join("\n  - ")}`));
					}
				});
			})
			.catch((err) => {
				logger.error(err);
				return q.reject(err);
			});
	}

	private __callPact(options: PublisherOptions, config: request.OptionsWithUri): q.Promise<any> {
		config = _.extend({
			uri: options.pactBroker ? options.pactBroker : "http://localhost",
			method: "GET",
			headers: {
				"Accept": "application/json"
			}
		}, config);

		// Authentication
		if (options.pactBrokerUsername && options.pactBrokerPassword) {
			(config as any).auth = {
				user: options.pactBrokerUsername,
				pass: options.pactBrokerPassword
			};
		}

		return http(config)
		// return response only
			.then((data) => data[0])
			.then((response) => {
				if (response.statusCode < 200 || response.statusCode >= 300) {
					return q.reject(`Failed http call to pact broker.
					URI: ${config.uri}
					Code: ${response.statusCode}
					Body: ${response.body}`);
				}
				return response.body;
			});
	}

	private __getPactFile(options: PublisherOptions, uri: string): q.Promise<any> {
		// Parse the Pact file to extract consumer/provider names
		if (/\.json$/.test(uri)) {
			try {
				return q(require(uri));
			} catch (err) {
				return q.reject(`Invalid Pact contract '${uri}:\n${err}`);
			}
		} else {
			return this.__callPact(options, {
				uri: uri,
				json: true
			}).fail((err) => q.reject(`Failed to get Pact contract from broker:\n${err}`));
		}
	}

	// Given Pact Options and a Pact contract, construct a Pact URL used to
	// PUT/POST to the Pact Broker.
	private __constructPutUrl(options: PublisherOptions, data: PublishData): string {
		if (!_.has(options, "pactBroker")) {
			throw new Error("Cannot construct Pact publish URL: 'pactBroker' not specified");
		}

		if (!_.has(options, "consumerVersion")) {
			throw new Error("Cannot construct Pact publish URL: 'consumerVersion' not specified");
		}

		if (!_.isObject(options)
			|| !_.has(data, "consumer")
			|| !_.has(data, "provider")
			|| !_.has(data.consumer, "name")
			|| !_.has(data.provider, "name")) {
			throw new Error("Invalid Pact contract given. Unable to parse consumer and provider name");
		}

		return urlJoin(options.pactBroker, "pacts/provider", data.provider.name, "consumer", data.consumer.name, "version", options.consumerVersion);
	}

	private __constructTagUrl(options: PublisherOptions, tag: string, data: PublishData): string {
		if (!_.has(options, "pactBroker")) {
			throw new Error("Cannot construct Pact Tag URL: 'pactBroker' not specified");
		}

		if (!_.has(options, "consumerVersion")) {
			throw new Error("Cannot construct Pact Tag URL: 'consumerVersion' not specified");
		}

		if (!_.isObject(options)
			|| !_.has(data, "consumer")
			|| !_.has(data.consumer, "name")) {
			throw new Error("Invalid Pact contract given. Unable to parse consumer name");
		}

		return urlJoin(options.pactBroker, "pacticipants", data.consumer.name, "versions", options.consumerVersion, "tags", tag);
	}
}

export default Publisher.create;

export interface PublisherOptions {
	pactBroker?: string;
	pactUrls?: string[];
	consumerVersion?: string;
	pactBrokerUsername?: string;
	pactBrokerPassword?: string;
	tags?: string[];
}

export interface PublishData {
	consumer: { name: string };
	provider: { name: string };
}
