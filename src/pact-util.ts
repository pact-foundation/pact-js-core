// tslint:disable:no-string-literal
import _ = require("underscore");
import checkTypes = require("check-types");
import pactStandalone = require("@pact-foundation/pact-standalone");
import cp = require("child_process");
import logger from "./logger";
import {ChildProcess, SpawnOptions} from "child_process";

const isWindows = process.platform === "win32";

export class PactUtil {
	public createArguments(args: SpawnArguments, mappings: { [id: string]: string }): string[] {
		return _.chain(args)
			.map((value, key) => {
				if (value && mappings[key]) {
					return [mappings[key], `'${checkTypes.array(value) ? value.join(",") : value}'`];
				}
			})
			.flatten()
			.compact()
			.value();
	}

	public spawnBinary(command: string, args: SpawnArguments = {}, argMapping: { [id: string]: string } = {}): ChildProcess {
		const envVars = JSON.parse(JSON.stringify(process.env)); // Create copy of environment variables
		// Remove environment variable if there
		// This is a hack to prevent some weird Travelling Ruby behaviour with Gems
		// https://github.com/pact-foundation/pact-mock-service-npm/issues/16
		delete envVars["RUBYGEMS_GEMDEPS"];

		let file: string;
		let opts: SpawnOptions = {
			cwd: pactStandalone.cwd,
			detached: !isWindows,
			env: envVars
		};

		let cmd: string = [command].concat(this.createArguments(args, argMapping)).join(" ");

		let spawnArgs: string[];
		if (isWindows) {
			file = "cmd.exe";
			spawnArgs = ["/s", "/c", cmd];
			(opts as any).windowsVerbatimArguments = true;
		} else {
			cmd = `./${cmd}`;
			file = "/bin/sh";
			spawnArgs = ["-c", cmd];
		}

		logger.debug(`Starting pact binary with '${_.flatten([file, args, JSON.stringify(opts)])}'`);
		const instance = cp.spawn(file, spawnArgs, opts);

		instance.stdout.setEncoding("utf8");
		instance.stderr.setEncoding("utf8");
		instance.stdout.on("data", logger.debug.bind(logger));
		instance.stderr.on("data", logger.debug.bind(logger));
		instance.on("error", logger.error.bind(logger));
		instance.once("close", (code) => {
			if (code !== 0) {
				logger.warn(`Pact exited with code ${code}.`);
			}
		});

		logger.info(`Created '${command}' process with PID: ${instance.pid}`);
		return instance;
	}

	public killBinary(binary: ChildProcess): boolean {
		if (binary) {
			const pid = binary.pid;
			logger.info(`Removing Pact with PID: ${pid}`);
			binary.removeAllListeners();
			// Killing instance, since windows can't send signals, must kill process forcefully
			try {
				isWindows ? cp.execSync(`taskkill /f /t /pid ${pid}`) : process.kill(-pid, "SIGINT");
			} catch (e) {
				return false;
			}
		}
		return true;
	}
}

export interface SpawnArguments {
	[id: string]: string | string[] | boolean | number;
}

export default new PactUtil();
