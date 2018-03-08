import * as path from "path";

const basePath = `standalone/bin`;
const binName = (name: string) => `${name}${process.platform === "win32" ? ".bat" : ""}`;

const cwd = path.resolve(__dirname, "..");
const mock = binName("pact-mock-service");
const verify = binName("pact-provider-verifier");
const broker = binName("pact-broker");
const stub = binName("pact-stub-service");

const standalone: PactStandalone = {
	cwd: cwd,
	brokerPath: path.join(basePath, broker),
	brokerFullPath: path.resolve(cwd, basePath, broker).trim(),
	mockServicePath: path.join(basePath, mock),
	mockServiceFullPath: path.resolve(cwd, basePath, mock).trim(),
	stubPath: path.join(basePath, stub),
	stubFullPath: path.resolve(cwd, basePath, stub).trim(),
	verifierPath: path.join(basePath, verify),
	verifierFullPath: path.resolve(cwd, basePath, verify).trim()
};

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
}

export default standalone;
