/* global describe:true, before:true, after:true, it:true, global:true, process:true */
/* tslint:disable:no-string-literal */
import * as fs from "fs";
import * as path from "path";
import * as chai from "chai";

const expect = chai.expect;

// Needs to stay a function and not an arrow function to access mocha 'this' context
describe("Install", () => {
	const packagePath: string = path.resolve(__dirname, "../../package.json");
	beforeEach(() => {
		// Clear require cache
		for (let key in require.cache) {
			delete require.cache[key];
		}
	});

	function createConfig() {
		return require("./install").createConfig();
	}

	describe("Package.json Configuration", () => {
		let packageConfig: any;
		// Create deep copy of our current package.json
		beforeEach(() => packageConfig = JSON.parse(JSON.stringify(require("../package.json"))));

		afterEach(() => {
			// Remove created package file if there
			if (fs.existsSync(packagePath)) {
				fs.unlinkSync(packagePath);
			}
		});

		it("Should be able to set binary location from package.json config", () => {
			const binaryLocation = "some-location/or-other";
			packageConfig.config = {
				pact_binary_location: binaryLocation
			};
			fs.writeFileSync(packagePath, JSON.stringify(packageConfig));
			const config = createConfig();
			config.binaries.forEach((entry: any) => {
				expect(entry.downloadLocation).to.be.equal(binaryLocation);
			});
		});

		it("Should be able to set 'do not track' from package.json config", () => {
			const doNotTrack = true;
			packageConfig.config = {
				pact_do_not_track: doNotTrack
			};
			fs.writeFileSync(packagePath, JSON.stringify(packageConfig));
			const config = createConfig();
			expect(config.doNotTrack).to.be.equal(doNotTrack);
		});
	});

	describe("Environment variables configuration", () => {
		it("Should be able to set 'do not track' from environment variable 'PACT_DO_NOT_TRACK'", () => {
			const doNotTrack = true;
			process.env.PACT_DO_NOT_TRACK = `${doNotTrack}`;
			const config = createConfig();
			expect(config.doNotTrack).to.be.equal(doNotTrack);
		});
	});
});
