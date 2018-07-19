import * as path from "path";
import {getBinaryEntry} from "../standalone/install";
import util from "./pact-util";

export interface PactStandalone {
	cwd: string;
	brokerRelativePath: string;
	brokerAbsolutePath: string;
	mockServiceRelativePath: string;
	mockServiceAbsolutePath: string;
	stubRelativePath: string;
	stubAbsolutePath: string;
	verifierRelativePath: string;
	verifierAbsolutePath: string;
	messageRelativePath: string;
	messageAbsolutePath: string;
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
	const entryPath = path.join(getBinaryEntry(platform, arch).folderName, "bin");

	return {
		cwd: util.binaryBasePath,
		brokerRelativePath: path.join(entryPath, broker),
		brokerAbsolutePath: path.resolve(util.binaryBasePath, entryPath, broker).trim(),
		messageRelativePath: path.join(entryPath, message),
		messageAbsolutePath: path.resolve(util.binaryBasePath, entryPath, message).trim(),
		mockServiceRelativePath: path.join(entryPath, mock),
		mockServiceAbsolutePath: path.resolve(util.binaryBasePath, entryPath, mock).trim(),
		stubRelativePath: path.join(entryPath, stub),
		stubAbsolutePath: path.resolve(util.binaryBasePath, entryPath, stub).trim(),
		verifierRelativePath: path.join(entryPath, verify),
		verifierAbsolutePath: path.resolve(util.binaryBasePath, entryPath, verify).trim()
	};
};

export default standalone();
