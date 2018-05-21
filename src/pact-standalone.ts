import * as path from "path";
import {getBinaryEntry} from "../standalone/install";

const cwd = path.resolve(__dirname, "..");

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
}

export const standalone = (platform?: string, arch?: string): PactStandalone => {
	platform = platform || process.platform;
	arch = arch || process.arch;
	const binName = (name: string) => `${name}${platform === "win32" ? ".bat" : ""}`;
	const mock = binName("pact-mock-service");
	const message = binName("pact-message");
	const verify = binName("pact-provider-verifier");
	const broker = binName("pact-broker");
	const stub = binName("pact-stub-service");
	const basePath = path.join("standalone", getBinaryEntry(platform, arch).folderName, "bin");

	return {
		cwd: cwd,
		brokerPath: path.join(basePath, broker),
		brokerFullPath: path.resolve(cwd, basePath, broker).trim(),
		messagePath: path.join(basePath, message),
		messageFullPath: path.resolve(cwd, basePath, message).trim(),
		mockServicePath: path.join(basePath, mock),
		mockServiceFullPath: path.resolve(cwd, basePath, mock).trim(),
		stubPath: path.join(basePath, stub),
		stubFullPath: path.resolve(cwd, basePath, stub).trim(),
		verifierPath: path.join(basePath, verify),
		verifierFullPath: path.resolve(cwd, basePath, verify).trim()
	};
};

export default standalone();
