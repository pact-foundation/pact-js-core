"use strict";
const path = require("path");
const http = require("follow-redirects").https;
const fs = require("fs");
const admzip = require("adm-zip");
const tar = require("tar");
const chalk = require("chalk");
const rimraf = require("rimraf");

const PACT_STANDALONE_VERSION = "1.29.1";
const arch = process.env.ARCH || process.arch;
const platform = process.env.PLATFORM || process.platform;
const isWindows = platform === "win32";
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

const URL = "https://github.com/pact-foundation/pact-ruby-standalone/releases/download/v" + PACT_STANDALONE_VERSION + "/" + binary;

function download(url, filePath) {
	return new Promise(function (resolve, reject) {
		if (fs.existsSync(path.resolve(filePath))) {
			console.log(chalk.yellow("Binary already downloaded, skipping..."));
			return resolve(filePath);
		}

		const file = fs.createWriteStream(filePath);
		console.log(chalk.yellow("Downloading Pact Standalone Binary v" + PACT_STANDALONE_VERSION + " for platform '" + platform + "' from " + URL));

		// Get archive of release
		http.get(url, function (res) {
			const len = parseInt(res.headers['content-length'], 10);
			let downloaded = 0;
			res.on('data', function (chunk) {
				file.write(chunk);
				downloaded += chunk.length;
				console.log(chalk.gray("Downloaded " + (100.0 * downloaded / len).toFixed(2) + "%..."));
			}).on('end', function () {
				// clear timeout
				file.end();
				console.log(chalk.green("Finished downloading binary, extracting..."));
				resolve(filePath);
			});
		}).on("error", function (e) {
			const err = "Error downloading binary from " + URL + ": " + e.message;
			console.log(chalk.red(err));
			reject(err);
		});
	});
}


function extract(filePath) {
	return new Promise(function (resolve, reject) {
		try {
			// Extract files
			if (isWindows) {
				new admzip(filePath).extractAllTo(__dirname, true);
			} else {
				tar.x({
					file: filePath,
					strip: 1,
					C: __dirname,
					Z: true,
					sync: true
				});
			}

			// Remove pact-publish as it's getting deprecated
			rimraf.sync("bin/pact-publish" + (isWindows ? ".bat" : ""));

			console.log(chalk.green("Extraction done."));
			resolve();
		} catch (e) {
			console.log(chalk.red("Extraction failed for " + filePath));
			reject(e);
		}
	});
}

download(URL, path.resolve(__dirname, binary))
	.then(function (f) {
		return extract(f);
	})
	.then(function () {
		console.log(chalk.green("Pact Standalone Binary is ready."));
	});
