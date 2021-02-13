// eslint-disable-next-line @typescript-eslint/no-unused-vars
/* global describe:true, before:true, after:true, it:true, global:true, process:true */
import * as fs from 'fs';
import * as path from 'path';
import * as chai from 'chai';
import install, { BinaryEntry, Config } from './install';
import chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

// Needs to stay a function and not an arrow function to access mocha 'this' context
describe('Install', () => {
	const packageBasePath: string = path.resolve(__dirname, '__fixtures__');
	const packagePath: string = path.resolve(packageBasePath, 'package.json');
	beforeEach(() => {
		// Clear require cache
		for (let key in require.cache) {
			delete require.cache[key];
		}
	});

	function createConfig(at: string): Config {
		return require('./install').createConfig(at);
	}

	describe('Package.json Configuration', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let packageConfig: any;
		// Create deep copy of our current package.json
		beforeEach(
			() =>
				(packageConfig = JSON.parse(
					// eslint-disable-next-line @typescript-eslint/no-var-requires
					JSON.stringify(require('../package.json')),
				)),
		);

		afterEach(() => {
			// Remove created package file if there
			if (fs.existsSync(packagePath)) {
				fs.unlinkSync(packagePath);
			}
		});

		describe('Binary Location', () => {
			function setBinaryLocation(location: string, expectation?: string): void {
				fs.writeFileSync(
					packagePath,
					JSON.stringify({
						...packageConfig,
						config: {
							// eslint-disable-next-line @typescript-eslint/camelcase
							pact_binary_location: location,
						},
					}),
				);
				const config = createConfig(packageBasePath);
				config.binaries.forEach((entry: BinaryEntry) => {
					expect(entry.downloadLocation).to.be.equal(expectation || location);
				});
			}

			it('Should be able to set binary location as an absolute path', () =>
				setBinaryLocation(
					'/some-location/or-other',
					path.resolve('/some-location/or-other'),
				));

			it('Should be able to set binary location as an relative path', () => {
				const location = 'some-location/or-other';
				setBinaryLocation(location, path.resolve(packageBasePath, location));
			});

			it('Should be able to set binary location as an HTTP URL', () =>
				setBinaryLocation('http://some.url'));

			it('Should be able to set binary location as an HTTPS URL', () =>
				setBinaryLocation('https://some.url'));
		});

		it("Should be able to set 'do not track' from package.json config", () => {
			const doNotTrack = true;
			fs.writeFileSync(
				packagePath,
				JSON.stringify({
					...packageConfig,
					// eslint-disable-next-line @typescript-eslint/camelcase
					config: { pact_do_not_track: doNotTrack },
				}),
			);
			const config = createConfig(packageBasePath);
			expect(config.doNotTrack).to.be.equal(doNotTrack);
		});
	});

	describe('Environment variables configuration', () => {
		it("Should be able to set 'do not track' from environment variable 'PACT_DO_NOT_TRACK'", () => {
			const doNotTrack = true;
			process.env.PACT_DO_NOT_TRACK = `${doNotTrack}`;
			const config = createConfig(packageBasePath);
			expect(config.doNotTrack).to.be.equal(doNotTrack);
		});
	});

	describe('When skips install', () => {
		let OLD_ENV = { ...process.env };

		beforeEach(() => {
			process.env.PACT_SKIP_BINARY_INSTALL = 'true';
		});

		afterEach(() => {
			process.env = { ...OLD_ENV };
		});

		it('Should not download it', () => {
			return expect(install('Linux', 'x86')).to.be.fulfilled;
		});
	});
});
