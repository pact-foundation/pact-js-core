/* global describe:true, before:true, after:true, it:true, global:true, process:true */
/* tslint:disable:no-string-literal */
import * as fs from "fs";
import * as path from "path";
import * as chai from "chai";
import install from "../standalone/install";
import util from "./pact-util";
import {PactStandalone, standalone} from "./pact-standalone";

const expect = chai.expect;
const basePath = util.binaryBasePath;

// Needs to stay a function and not an arrow function to access mocha 'this' context

describe("Pact Standalone", function() {
	// Set timeout to 10 minutes because downloading binaries might take a while.
	this.timeout(600000);

	let pact: PactStandalone;

	// reinstall the correct binary for the system for all other tests that might use it.
	after(() => install());

	it("should return an object with binaryBasePath, file and fullPath properties that is platform specific", () => {
		pact = standalone();
		expect(pact).to.be.an("object");
		expect(pact.cwd).to.be.ok;
		expect(pact.brokerRelativePath).to.contain("pact-broker");
		expect(pact.brokerAbsolutePath).to.contain("pact-broker");
		expect(pact.mockServiceRelativePath).to.contain("pact-mock-service");
		expect(pact.mockServiceAbsolutePath).to.contain("pact-mock-service");
		expect(pact.stubRelativePath).to.contain("pact-stub-service");
		expect(pact.stubAbsolutePath).to.contain("pact-stub-service");
		expect(pact.verifierRelativePath).to.contain("pact-provider-verifier");
		expect(pact.verifierAbsolutePath).to.contain("pact-provider-verifier");
	});

	it("should return the base directory of the project with 'binaryBasePath' (where the package.json file is)", () => {
		expect(fs.existsSync(pact.cwd)).to.be.true;
	});

	describe("Check if OS specific files are there", () => {
		describe("OSX", () => {
			before(() => install("darwin"));

			beforeEach(() => pact = standalone("darwin"));

			it("broker relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.brokerRelativePath))).to.be.true;
			});

			it("broker full path", () => {
				expect(fs.existsSync(pact.brokerAbsolutePath)).to.be.true;
			});

			it("mock service relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.mockServiceRelativePath))).to.be.true;
			});

			it("mock service full path", () => {
				expect(fs.existsSync(pact.mockServiceAbsolutePath)).to.be.true;
			});

			it("stub relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.stubRelativePath))).to.be.true;
			});

			it("stub full path", () => {
				expect(fs.existsSync(pact.stubAbsolutePath)).to.be.true;
			});

			it("provider verifier relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.verifierRelativePath))).to.be.true;
			});

			it("provider verifier full path", () => {
				expect(fs.existsSync(pact.verifierAbsolutePath)).to.be.true;
			});
		});

		describe("Linux ia32", () => {
			before(() => install("linux", "ia32"));

			beforeEach(() => pact = standalone("linux", "ia32"));

			it("broker relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.brokerRelativePath))).to.be.true;
			});

			it("broker full path", () => {
				expect(fs.existsSync(pact.brokerAbsolutePath)).to.be.true;
			});

			it("mock service relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.mockServiceRelativePath))).to.be.true;
			});

			it("mock service full path", () => {
				expect(fs.existsSync(pact.mockServiceAbsolutePath)).to.be.true;
			});

			it("stub relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.stubRelativePath))).to.be.true;
			});

			it("stub full path", () => {
				expect(fs.existsSync(pact.stubAbsolutePath)).to.be.true;
			});

			it("provider verifier relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.verifierRelativePath))).to.be.true;
			});

			it("provider verifier full path", () => {
				expect(fs.existsSync(pact.verifierAbsolutePath)).to.be.true;
			});
		});

		describe("Linux X64", () => {
			before(() => install("linux", "x64"));

			beforeEach(() => pact = standalone("linux", "x64"));

			it("broker relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.brokerRelativePath))).to.be.true;
			});

			it("broker full path", () => {
				expect(fs.existsSync(pact.brokerAbsolutePath)).to.be.true;
			});

			it("mock service relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.mockServiceRelativePath))).to.be.true;
			});

			it("mock service full path", () => {
				expect(fs.existsSync(pact.mockServiceAbsolutePath)).to.be.true;
			});

			it("stub relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.stubRelativePath))).to.be.true;
			});

			it("stub full path", () => {
				expect(fs.existsSync(pact.stubAbsolutePath)).to.be.true;
			});

			it("provider verifier relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.verifierRelativePath))).to.be.true;
			});

			it("provider verifier full path", () => {
				expect(fs.existsSync(pact.verifierAbsolutePath)).to.be.true;
			});
		});

		describe("Windows", () => {
			before(() => install("win32"));

			beforeEach(() => pact = standalone("win32"));

			it("should add '.bat' to the end of the binary names", () => {
					expect(pact.brokerRelativePath).to.contain("pact-broker.bat");
					expect(pact.brokerAbsolutePath).to.contain("pact-broker.bat");
					expect(pact.mockServiceRelativePath).to.contain("pact-mock-service.bat");
					expect(pact.mockServiceAbsolutePath).to.contain("pact-mock-service.bat");
					expect(pact.stubRelativePath).to.contain("pact-stub-service.bat");
					expect(pact.stubAbsolutePath).to.contain("pact-stub-service.bat");
					expect(pact.verifierRelativePath).to.contain("pact-provider-verifier.bat");
					expect(pact.verifierAbsolutePath).to.contain("pact-provider-verifier.bat");
				}
			);

			it("broker relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.brokerRelativePath))).to.be.true;
			});

			it("broker full path", () => {
				expect(fs.existsSync(pact.brokerAbsolutePath)).to.be.true;
			});

			it("mock service relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.mockServiceRelativePath))).to.be.true;
			});

			it("mock service full path", () => {
				expect(fs.existsSync(pact.mockServiceAbsolutePath)).to.be.true;
			});

			it("stub relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.stubRelativePath))).to.be.true;
			});

			it("stub full path", () => {
				expect(fs.existsSync(pact.stubAbsolutePath)).to.be.true;
			});

			it("provider verifier relative path", () => {
				expect(fs.existsSync(path.resolve(basePath, pact.verifierRelativePath))).to.be.true;
			});

			it("provider verifier full path", () => {
				expect(fs.existsSync(pact.verifierAbsolutePath)).to.be.true;
			});
		});
	});
});
