import * as http from "http";
import * as request from "request";

const path = require("path");
const fs = require("fs");
const decompress = require("decompress");
const tar = require("tar");
const chalk = require("chalk");
const rimraf = require("rimraf");
const promiseRetry = require('promise-retry');

const PACT_STANDALONE_VERSION = "1.30.1";

function download(data: Data): Promise<Data> {
	return new Promise((resolve: (f: Data) => void, reject: (e: string) => void) => {
		if (fs.existsSync(path.resolve(data.filepath))) {
			console.log(chalk.yellow("Binary already downloaded, skipping..."));
			return resolve(data);
		}

		console.log(chalk.yellow(`Downloading Pact Standalone Binary v${PACT_STANDALONE_VERSION} for platform ${data.platform} from ${data.url}`));

		// Get archive of release
		let len = 0;
		let downloaded = 0;
		let time = Date.now();
		request(data.url)
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
			.on("error", (e: string) => reject(`Error downloading binary from ${data.url}: ${e}`));
	});
}

function extract(data: Data): Promise<void> {
	console.log(chalk.yellow(`Extracting binary from ${data.filepath}.`));

	// Remove old bin/lib directory if present
	const binPath = path.resolve(__dirname, "bin");
	const libPath = path.resolve(__dirname, "lib");
	if (fs.existsSync(binPath)) {
		rimraf.sync(binPath);
		rimraf.sync(libPath);
	}

	// Extract files, retry if it doesn't work the first time around
	// this is to fix an issue with windows locking files temporary after an extraction
	// Which tends to stop our unit tests because they're faster than windows can handle
	return promiseRetry((retry: Function) => {
		return (data.isWindows ?
				decompress(data.filepath, __dirname, {strip: 1}) :
				tar.x({
					file: data.filepath,
					strip: 1,
					cwd: __dirname,
					Z: true
				})
		).catch(retry);
	}).then(() => {
		// Remove pact-publish as it"s getting deprecated
		rimraf.sync(path.resolve(__dirname, "bin", `pact-publish${data.isWindows ? ".bat" : ""}`));
		console.log(chalk.green("Extraction done."));
	}, (e: any) => Promise.reject(`Extraction failed for ${data.filepath}: ${e}`));
}

function setup(platform?: string, arch?: string): Promise<Data> {
	platform = platform || process.platform;
	arch = arch || process.arch;
	let binary = "pact-" + PACT_STANDALONE_VERSION + "-";
	switch (platform) {
		case "win32":
			binary += "win32.zip";
			break;
		case "darwin":
			binary += "osx.tar.gz";
			break;
		case "linux":
			binary += "linux-x86" + (arch === "x64" ? "_64" : "") + ".tar.gz";
			break;
	}
	console.log(chalk.gray(`Installing Pact Standalone Binary for ${platform}.`));
	return Promise.resolve({
		url: `https://github.com/pact-foundation/pact-ruby-standalone/releases/download/v${PACT_STANDALONE_VERSION}/${binary}`,
		filepath: path.resolve(__dirname, binary),
		platform: platform,
		arch: arch,
		isWindows: "win32" === platform
	});
}

export interface Data {
	url: string;
	filepath: string;
	platform: string;
	arch: string;
	isWindows: boolean;
}

export default (platform?: string, arch?: string) =>
	setup(platform, arch)
		.then((d) => download(d))
		.then((d) => extract(d))
		.then(() => console.log(chalk.green("Pact Standalone Binary is ready.")))
		.catch((e: string) => console.log(chalk.red(`Postinstalled Failed Unexpectedly: ${e}`)));
