// tslint:disable:no-string-literal

import path = require("path");
import fs = require("fs");
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import canDeployFactory, {CanDeployOptions, CanDeploy} from "./can-deploy";
import {SpawnArguments} from "./pact-util";
import logger from "./logger";
import brokerMock from "../test/integration/broker-mock";
import * as http from "http";

const rimraf = require("rimraf");
const mkdirp = require("mkdirp");
const expect = chai.expect;
chai.use(chaiAsPromised);

describe("CanDeploy Spec", () => {

	const PORT = Math.floor(Math.random() * 999) + 9000;
	let server: http.Server;
	let absolutePath: string;
	let relativePath: string;

	before(() => brokerMock(PORT).then((s) => {
		logger.debug(`Pact Broker Mock listening on port: ${PORT}`);
		server = s;
	}));

	after(() => server.close());

	beforeEach(() => {
		relativePath = `.tmp/${Math.floor(Math.random() * 1000)}`;
		absolutePath = path.resolve(__dirname, "..", relativePath);
		mkdirp.sync(absolutePath);
	});

	afterEach(() => {
		if (fs.existsSync(absolutePath)) {
			rimraf.sync(absolutePath);
		}
	});

	describe("convertForSpawnBinary helper function",() => {
		let result : SpawnArguments[];

		beforeEach(() => {
			result = CanDeploy.convertForSpawnBinary(
				{
					pacticipants: ["one","two"],
					versions: ["v1","v2"],
					pactBroker: "some broker",
					pactBrokerUsername: "username",
					pactBrokerPassword: "password",
			});
		});

		it("produces an array of SpawnArguments", ()=> {
			expect(result).to.be.an("array");
		});

		it("has versions and pacticipants in the right order", ()=> {
			expect(result).to.eql(
				[
					{pacticipant: "one"},
					{version: "v1"},
					{pacticipant: "two"},
					{version:"v2"},
					{
						pactBroker: "some broker",
						pactBrokerUsername: "username",
						pactBrokerPassword: "password",
					}
				]);
		});
	});

	context("when invalid options are set", () => {
		it("should fail with an Error when not given pactBroker", () => {
			expect(() => {
				canDeployFactory({
				} as CanDeployOptions);
			}).to.throw(Error);
		});

		it("should fail with an Error when not given pacticipants", () => {
			expect(() => {
				canDeployFactory({
					pactBroker: "http://localhost",
					versions: ["v1"],
				} as CanDeployOptions);
			}).to.throw(Error);
		});

		it("should fail with an Error when not given versions", () => {
			expect(() => {
				canDeployFactory({
					pactBroker: "http://localhost",
					pacticipants: ["p1","p2"]
				} as CanDeployOptions);
			}).to.throw(Error);
		});

		it("should fail with an error when not given equal numbers of versions and pacticipants", () => {
			expect(() => {
				canDeployFactory({
					pactBroker: "http://localhost",
					versions: ["v1"],
					pacticipants: ["p1","p2"]
				} as CanDeployOptions);
			}).to.throw(Error);
		});

		it("should fail with an error when versions and paticipants are empty", () => {
			expect(() => {
				canDeployFactory({
					pactBroker: "http://localhost",
					versions: [],
					pacticipants: []
				} as CanDeployOptions);
			}).to.throw(Error);
		});
	});

	context("when valid options are set", () => {
		it("should return a CanDeploy object when given the correct arguments", () => {
			const c = canDeployFactory({
				pactBroker: "http://localhost",
				versions: ["v1","v2"],
				pacticipants: ["p1","p2"]
			});
			expect(c).to.be.ok;
			expect(c.canDeploy).to.be.a("function");
		});
	});
});
