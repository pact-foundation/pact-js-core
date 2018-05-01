import * as path from "path";

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
	version: string;
	basePath: string;
	baseUrl: string;
}

function getPlatformFolderName(platform: string, arch: string, version: string) {
	return `${platform}${platform === "linux" ? `-${arch}` : ""}-${version}`;
}

function envOrDefault (key: string, fallback: string){
	return process.env[key] || fallback;
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
	const version = envOrDefault("PACT_STANDALONE_VERSION", "1.38.0");
	const basePath = path.join("standalone", getPlatformFolderName(platform, arch, version));
	const binPath = path.join(basePath, "bin");
	const baseUrl = envOrDefault(
		"PACT_STANDALONE_BASE_URL",
		`https://github.com/pact-foundation/pact-ruby-standalone/releases/download/v${version}`
	);

	return {
		cwd: cwd,
		brokerPath: path.join(binPath, broker),
		brokerFullPath: path.resolve(cwd, binPath, broker).trim(),
		messagePath: path.join(binPath, message),
		messageFullPath: path.resolve(cwd, binPath, message).trim(),
		mockServicePath: path.join(binPath, mock),
		mockServiceFullPath: path.resolve(cwd, binPath, mock).trim(),
		stubPath: path.join(binPath, stub),
		stubFullPath: path.resolve(cwd, binPath, stub).trim(),
		verifierPath: path.join(binPath, verify),
		verifierFullPath: path.resolve(cwd, binPath, verify).trim(),
		version,
		basePath,
		baseUrl
	};
};

export default standalone();
