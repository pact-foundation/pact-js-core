"use strict";
const path = require("path");
const http = require("follow-redirects").https;
const fs = require("fs");
const decompress = require("decompress");
const tar = require("tar");
const chalk = require("chalk");
const rimraf = require("rimraf");

const PACT_STANDALONE_VERSION = "1.29.1";

function download(data: Data): Promise<Data> {
	const filePath = path.resolve(__dirname, data.filepath);
	return new Promise((resolve: (f: Data) => void, reject: (e: string) => void) => {
		if (fs.existsSync(path.resolve(filePath))) {
			console.log(chalk.yellow("Binary already downloaded, skipping..."));
			return resolve(data);
		}

		const file = fs.createWriteStream(filePath);
		console.log(chalk.yellow(`Downloading Pact Standalone Binary v${PACT_STANDALONE_VERSION} for platform ${data.platform} from ${data.url}`));

		// Get archive of release
		http.get(data.url, (res: any) => {
			const len = parseInt(res.headers["content-length"], 10);
			let downloaded = 0;
			res.on("data", (chunk: any) => {
				file.write(chunk);
				downloaded += chunk.length;
				console.log(chalk.gray("Downloaded " + (100.0 * downloaded / len).toFixed(2) + "%..."));
			}).on("end", () => {
				// clear timeout
				file.end();
				console.log(chalk.green("Finished downloading binary, extracting..."));
				resolve(data);
			});
		}).on("error", (e: any) => {
			const err = "Error downloading binary from " + URL + ": " + e.message;
			console.log(chalk.red(err));
			reject(err);
		});
	});
}

function extract(data: Data): Promise<void> {
	console.log(chalk.yellow(`Extracting binary from ${data.filepath}.`));

	// Remove old bin/lib directory if present
	rimraf.sync(path.resolve(__dirname, "bin"));
	rimraf.sync(path.resolve(__dirname, "lib"));

	// Extract files
	let p: Promise<void>;
	if (data.isWindows) {
		p = decompress(data.filepath, __dirname, {strip: 1});
	} else {
		p = tar.x({
			file: data.filepath,
			strip: 1,
			C: __dirname,
			Z: true
		});
	}

	return p.then(() => {
		// Remove pact-publish as it"s getting deprecated
		rimraf.sync(path.resolve(__dirname, "bin", `pact-publish${data.isWindows ? ".bat" : ""}`));
		console.log(chalk.green("Extraction done."));
	}, () => console.log(chalk.red(`Extraction failed for ${data.filepath}`)));
}

function setup(platform?: string, arch?: string): Promise<Data> {
	platform = platform || process.platform;
	arch = arch || process.arch;
	const isWindow = "win32" === platform;
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
		filepath: binary,
		platform: platform,
		arch: arch,
		isWindows: isWindow
	});
}

export interface Data {
	url: string;
	filepath: string;
	platform: string;
	arch: string;
	isWindows: boolean;
}

export const install = (platform?: string, arch?: string) => {
	setup(platform, arch)
		.then((data) => download(data))
		.then(extract)
		.then(() => console.log(chalk.green("Pact Standalone Binary is ready.")));
};

export default install();
