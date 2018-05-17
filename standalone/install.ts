import * as http from "http";
import * as request from "request";

const path = require("path");
const fs = require("fs");
const urljoin = require("url-join");
const decompress = require("decompress");
const tar = require("tar");
const chalk = require("chalk");
const sumchecker = require("sumchecker");

export const PACT_STANDALONE_VERSION = "1.44.0";
const HTTP_REGEX = /^http(s?):\/\//;
const PACT_DEFAULT_LOCATION = `https://github.com/pact-foundation/pact-ruby-standalone/releases/download/v${PACT_STANDALONE_VERSION}/`;
let PACT_BINARY_LOCATION = PACT_DEFAULT_LOCATION;
let PACT_DO_NOT_TRACK: boolean = false;

findPackageConfig(path.resolve(__dirname, "..", ".."));

function findPackageConfig(location: string, tries: number = 10): void {
	if (tries === 0) {
		return;
	}
	const packagePath = path.resolve(location, "package.json");
	if (fs.existsSync(packagePath)) {
		const config = require(packagePath).config;
		if (config && (config.pact_binary_location || config.pact_do_not_track)) {
			PACT_BINARY_LOCATION = config.pact_binary_location || PACT_BINARY_LOCATION;
			PACT_DO_NOT_TRACK = config.pact_do_not_track || PACT_DO_NOT_TRACK;
			return;
		}
	}

	findPackageConfig(path.resolve(location, ".."), tries - 1);
}

function download(data: Data): Promise<Data> {
	console.log(chalk.gray(`Installing Pact Standalone Binary for ${data.platform}.`));
	return new Promise((resolve: (f: Data) => void, reject: (e: string) => void) => {
		if (fs.existsSync(path.resolve(data.filepath))) {
			console.log(chalk.yellow("Binary already downloaded, skipping..."));
			return resolve(data);
		}
		console.log(chalk.yellow(`Downloading Pact Standalone Binary v${PACT_STANDALONE_VERSION} for platform ${data.platform} from ${data.binaryDownloadPath}`));

		// Track downloads through Google Analytics unless testing or don't want to be tracked
		if (!PACT_DO_NOT_TRACK && !process.env.PACT_DO_NOT_TRACK) {
			console.log(chalk.gray("Please note: we are tracking this download anonymously to gather important usage statistics. " +
				"To disable tracking, set 'pact_do_not_track: true' in your package.json 'config' section."));
			// Trying to find all environment variables of all possible CI services to get more accurate stats
			// but it's still not 100% since not all systems have unique environment variables for their CI server
			const isCI = [
				"CI",
				"CONTINUOUS_INTEGRATION",
				"ABSTRUSE_BUILD_DIR",
				"APPVEYOR",
				"BUDDY_WORKSPACE_URL",
				"BUILDKITE",
				"CF_BUILD_URL",
				"CIRCLECI",
				"CODEBUILD_BUILD_ARN",
				"CONCOURSE_URL",
				"DRONE",
				"GITLAB_CI",
				"GO_SERVER_URL",
				"JENKINS_URL",
				"PROBO_ENVIRONMENT",
				"SEMAPHORE",
				"SHIPPABLE",
				"TDDIUM",
				"TEAMCITY_VERSION",
				"TF_BUILD",
				"TRAVIS",
				"WERCKER_ROOT",
			].some((key) => process.env[key] !== undefined);
			request.post({
				url: "https://www.google-analytics.com/collect",
				form: {
					v: 1,
					tid: "UA-117778936-1", // Tracking ID / Property ID.
					cid: Math.round(2147483647 * Math.random()).toString(), // Anonymous Client ID.
					t: "screenview", // Screenview hit type.
					an: "pact-install", // App name.
					av: require("../package.json").version, // App version.
					aid: "pact-node", // App Id.
					aiid: `standalone-${PACT_STANDALONE_VERSION}`, // App Installer Id.
					cd: `download-node-${data.platform}-${isCI ? "ci" : "user"}`
				}
			})
			// Ignore all errors
				.on("error", () => {
				});
		}

		// Get archive of release
		let len = 0;
		let downloaded = 0;
		let time = Date.now();
		// If URL, download via HTTP
		if (HTTP_REGEX.test(data.binaryDownloadPath)) {
			request(data.binaryDownloadPath)
				.on("response", (res: http.IncomingMessage) => len = parseInt(res.headers["content-length"] as string, 10))
				.on("data", (chunk: any[]) => {
					downloaded += chunk.length;
					// Only show download progress every second
					const now = Date.now();
					if (now - time > 1000) {
						time = now;
						console.log(chalk.gray(`Downloaded ${(100 * downloaded / len).toFixed(2)}%...`));
					}
				})
				.pipe(fs.createWriteStream(data.filepath))
				.on("finish", () => {
					console.log(chalk.green(`Finished downloading binary to ${data.filepath}`));
					resolve(data);
				})
				.on("error", (e: string) => reject(`Error downloading binary from ${data.binaryDownloadPath}: ${e}`));
		} else if (fs.existsSync(data.binaryDownloadPath)) {
			// Or else it might be a local file, try to copy it over to the correct directory
			fs.createReadStream(data.binaryDownloadPath)
				.on("error", (e: string) => reject(`Error reading the file at '${data.binaryDownloadPath}': ${e}`))
				.pipe(
					fs.createWriteStream(data.filepath)
						.on("error", (e: string) => reject(`Error writing the file to '${data.filepath}': ${e}`))
						.on("close", () => resolve(data))
				);
		} else {
			reject(`Could not get binary from '${data.binaryDownloadPath}' as it's not a URL and does not exist at the path specified.`);
		}
	});
}

function extract(data: Data): Promise<void> {

	// If platform folder exists, binary already installed, skip to next step.
	if (fs.existsSync(data.platformFolderPath)) {
		return Promise.resolve();
	}

	// Make sure checksum is available
	if (!fs.existsSync(data.checksumFilepath)) {
		return Promise.reject(`Checksum file missing from standalone directory. Aborting.`);
	}

	fs.mkdirSync(data.platformFolderPath);
	console.log(chalk.yellow(`Extracting binary from ${data.filepath}.`));

	// Validate checksum to make sure it's the correct binary
	const basename = path.basename(data.filepath);
	return sumchecker("sha1", data.checksumFilepath, __dirname, basename)
		.then(
			() => console.log(chalk.green(`Checksum passed for '${basename}'.`)),
			() => Promise.reject(`Checksum rejected for file '${basename}' with checksum ${path.basename(data.checksumFilepath)}`)
		)
		// Extract files into their platform folder
		.then(() => data.isWindows ?
			decompress(data.filepath, data.platformFolderPath, {strip: 1}) :
			tar.x({
				file: data.filepath,
				strip: 1,
				cwd: data.platformFolderPath,
				Z: true
			})
		)
		.then(() => {
			// Remove pact-publish as it's getting deprecated
			const publishPath = path.resolve(data.platformFolderPath, "bin", `pact-publish${data.isWindows ? ".bat" : ""}`);
			if (fs.existsSync(publishPath)) {
				fs.unlinkSync(publishPath);
			}
			console.log(chalk.green("Extraction done."));
		})
		.then(() => {
			console.log(
				"\n\n" +
				chalk.bgYellow(
					chalk.black("### If you") +
					chalk.red(" ❤ ") +
					chalk.black("Pact and want to support us, please donate here:")
				) +
				chalk.blue(" http://donate.pact.io/node") +
				"\n\n"
			);
		})
		.catch((e: any) => Promise.reject(`Extraction failed for ${data.filepath}: ${e}`));
}

function setup(platform?: string, arch?: string): Promise<Data> {
	const entry = getBinaryEntry(platform, arch);
	return Promise.resolve({
		binaryDownloadPath: join(entry.downloadLocation, entry.binary),
		checksumDownloadPath: join(PACT_DEFAULT_LOCATION, entry.binaryChecksum),
		filepath: path.resolve(__dirname, entry.binary),
		checksumFilepath: path.resolve(__dirname, entry.binaryChecksum),
		platform: entry.platform,
		arch: entry.arch,
		isWindows: "win32" === entry.platform,
		platformFolderPath: path.resolve(__dirname, entry.folderName)
	});
}

function join(...paths: string[]): string {
	return HTTP_REGEX.test(paths[0]) ? urljoin(...paths) : path.join(...paths);
}

const checksumSuffix = ".checksum";
const BINARIES: BinaryEntry[] = [
	{
		platform: "win32",
		binary: `pact-${PACT_STANDALONE_VERSION}-win32.zip`,
		binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-win32.zip${checksumSuffix}`,
		downloadLocation: PACT_BINARY_LOCATION,
		folderName: `win32-${PACT_STANDALONE_VERSION}`
	},
	{
		platform: "darwin",
		binary: `pact-${PACT_STANDALONE_VERSION}-osx.tar.gz`,
		binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-osx.tar.gz${checksumSuffix}`,
		downloadLocation: PACT_BINARY_LOCATION,
		folderName: `darwin-${PACT_STANDALONE_VERSION}`
	},
	{
		platform: "linux",
		arch: "x64",
		binary: `pact-${PACT_STANDALONE_VERSION}-linux-x86_64.tar.gz`,
		binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-linux-x86_64.tar.gz${checksumSuffix}`,
		downloadLocation: PACT_BINARY_LOCATION,
		folderName: `linux-x64-${PACT_STANDALONE_VERSION}`
	},
	{
		platform: "linux",
		arch: "ia32",
		binary: `pact-${PACT_STANDALONE_VERSION}-linux-x86.tar.gz`,
		binaryChecksum: `pact-${PACT_STANDALONE_VERSION}-linux-x86.tar.gz${checksumSuffix}`,
		downloadLocation: PACT_BINARY_LOCATION,
		folderName: `linux-ia32-${PACT_STANDALONE_VERSION}`
	}
];

export function getBinaryEntry(platform?: string, arch?: string): BinaryEntry {
	platform = platform || process.platform;
	arch = arch || process.arch;
	for (let value of BINARIES) {
		if (value.platform === platform && (value.arch ? value.arch === arch : true)) {
			return value;
		}
	}
	throw new Error(`Cannot find binary for platform '${platform}' with architecture '${arch}'.`);
}

export function downloadChecksums() {
	console.log(chalk.gray(`Downloading All Pact Standalone Binary Checksums.`));
	return Promise.all(
		BINARIES.map((value) => setup(value.platform, value.arch)
			.then((data) => new Promise((resolve: (f: Data) => void, reject: (e: string) => void) => {
				request(data.checksumDownloadPath)
					.pipe(fs.createWriteStream(data.checksumFilepath))
					.on("finish", () => {
						console.log(chalk.green(`Finished downloading checksum ${path.basename(data.checksumFilepath)}`));
						resolve(data);
					})
					.on("error", (e: string) => reject(`Error downloading checksum from ${data.checksumDownloadPath}: ${e}`));
			}))
		)
	)
		.then(() => console.log(chalk.green("All checksums downloaded.")))
		.catch((e: string) => {
			const msg = `Checksum Download Failed Unexpectedly: ${e}`;
			console.log(chalk.red(msg));
			return Promise.reject(msg);
		});
}

export default (platform?: string, arch?: string) =>
	setup(platform, arch)
		.then((d) => download(d))
		.then((d) => extract(d))
		.then(() => console.log(chalk.green("Pact Standalone Binary is ready.")))
		.catch((e: string) => console.log(chalk.red(`Postinstalled Failed Unexpectedly: ${e}`)));

export interface Data {
	binaryDownloadPath: string;
	checksumDownloadPath: string;
	filepath: string;
	checksumFilepath: string;
	platform: string;
	arch?: string;
	isWindows: boolean;
	platformFolderPath?: string;
}

export interface BinaryEntry {
	platform: string;
	arch?: string;
	binary: string;
	binaryChecksum: string;
	downloadLocation: string;
	folderName: string;
}
