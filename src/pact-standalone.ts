import * as path from "path";
import {getBinaryEntry} from "../standalone/install";
import util from "./pact-util";

export interface PactStandalone {
	cwd: string;
	brokerPath: string;
	brokerFullPath: string;
	mockServicePath: string;
	mockServiceFullPath: string;
	stubPath: string;
	stubFullPath: string;
	verifierPath: string;
	verifierFullPath: string;
	messagePath: string;
	messageFullPath: string;
	pactPath: string;
	pactFullPath: string;
}

export const standalone = (platform?: string, arch?: string): PactStandalone => {
	platform = platform || process.platform;
	arch = arch || process.arch;
	const binName = (name: string)  => `${name}${util.isWindows(platform) ? ".bat" : ""}`;
	const mock = binName("pact-mock-service");
	const message = binName("pact-message");
	const verify = binName("pact-provider-verifier");
	const broker = binName("pact-broker");
	const stub = binName("pact-stub-service");
	const pact = binName("pact");
	const basePath = path.join("standalone", getBinaryEntry(platform, arch).folderName, "bin");

	return {
		cwd: util.cwd,
		brokerPath: path.join(basePath, broker),
		brokerFullPath: path.resolve(util.cwd, basePath, broker).trim(),
		messagePath: path.join(basePath, message),
		messageFullPath: path.resolve(util.cwd, basePath, message).trim(),
		mockServicePath: path.join(basePath, mock),
		mockServiceFullPath: path.resolve(util.cwd, basePath, mock).trim(),
		stubPath: path.join(basePath, stub),
		stubFullPath: path.resolve(util.cwd, basePath, stub).trim(),
		pactPath: path.join(basePath, pact),
		pactFullPath: path.resolve(util.cwd, basePath, pact).trim(),
		verifierPath: path.join(basePath, verify),
		verifierFullPath: path.resolve(util.cwd, basePath, verify).trim()
	};
};

export default standalone();
