// tslint:disable:no-string-literal

import path = require("path");
import fs = require("fs");
import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import canDeployFactory, {CanDeploy, CanDeployOptions} from "./can-deploy";
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

	describe("convertForSpawnBinary helper function", () => {

		it("produces an array of SpawnArguments", () => {
			expect(CanDeploy.convertForSpawnBinary({pactBroker: "some broker"})).to.be.an("array");
		});

		it("has version and pacticipant in the right order", () => {
			const result = CanDeploy.convertForSpawnBinary({
				pacticipant: ["one", "two"],
				pacticipantVersion: ["v1", "v2"],
				pactBroker: "some broker",
				pactBrokerUsername: "username",
				pactBrokerPassword: "password",
			});

			expect(result).to.eql(
				[
					{pacticipant: "one"},
					{pacticipantVersion: "v1"},
					{pacticipant: "two"},
					{pacticipantVersion: "v2"},
					{
						pactBroker: "some broker",
						pactBrokerUsername: "username",
						pactBrokerPassword: "password",
					}
				]);
		});

		it("has latest tag and pacticipant in the right order", () => {
			expect(
				CanDeploy.convertForSpawnBinary({
					pacticipant: ["one", "two"],
					latest: ["v1", "v2"],
					pactBroker: "some broker",
				})
			).to.eql(
				[
					{pacticipant: "one"},
					{latest: "v1"},
					{pacticipant: "two"},
					{latest: "v2"},
					{
						pactBroker: "some broker"
					}
				]);
		});
	});

	context("when invalid options are set", () => {
		it("should fail with an Error when not given pactBroker", () => {
			expect(() => {
				canDeployFactory({} as CanDeployOptions);
			}).to.throw(Error);
		});

		it("should fail with an Error when not given pacticipant", () => {
			expect(() => {
				canDeployFactory({
					pactBroker: "http://localhost",
					pacticipantVersion: ["v1"],
				} as CanDeployOptions);
			}).to.throw(Error);
		});

		it("should fail with an Error when not given version", () => {
			expect(() => {
				canDeployFactory({
					pactBroker: "http://localhost",
					pacticipant: ["p1", "p2"]
				} as CanDeployOptions);
			}).to.throw(Error);
		});

		it("should fail with an error when not given equal numbers of version and pacticipant", () => {
			expect(() => {
				canDeployFactory({
					pactBroker: "http://localhost",
					pacticipantVersion: ["v1"],
					pacticipant: ["p1", "p2"]
				});
			}).to.throw(Error);
		});

		it("should fail with an error when version and paticipants are empty", () => {
			expect(() => {
				canDeployFactory({
					pactBroker: "http://localhost",
					pacticipantVersion: [],
					pacticipant: []
				});
			}).to.throw(Error);
		});
	});

	context("when valid options are set", () => {
		it("should return a CanDeploy object when given the correct arguments", () => {
			const c = canDeployFactory({
				pactBroker: "http://localhost",
				pacticipantVersion: ["v1", "v2"],
				pacticipant: ["p1", "p2"]
			});
			expect(c).to.be.ok;
			expect(c.canDeploy).to.be.a("function");
		});
	});
});
