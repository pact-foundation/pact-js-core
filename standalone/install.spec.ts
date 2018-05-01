import * as fs from "fs";
import * as path from "path";
import * as chai from "chai";

const version = "1.38.0";
const baseUrl = `https://github.com/pact-foundation/pact-ruby-standalone/releases/download/v${version}`;

process.env.PACT_STANDALONE_BASE_URL = baseUrl;
process.env.PACT_STANDALONE_VERSION = version;

import install from "./install";

const expect = chai.expect;
const basePath = path.resolve(__dirname);
const platform = "darwin";
const archive = `pact-${version}-osx.tar.gz`;
const archivePath = path.resolve(basePath, archive);

const clean = () => {
	process.env.PACT_STANDALONE_BASE_URL = "";
	process.env.PACT_STANDALONE_VERSION = "";
	return install();
};

const safeUnlinkSync = (path: string) => {
	try {
		fs.unlinkSync(path);
	} catch (err){ }
}

describe("Pact install", function() {
	this.timeout(600000);

	describe("Supports Pact standalone version and base url", () => {
		after(clean);

		it("Downloads executable", () => {
			safeUnlinkSync(archivePath);
			return install(platform)
				.then(() => {
					expect(fs.existsSync(archivePath)).to.be.true;
				});
		});
	});
});
