import bunyan = require("bunyan");
import PrettyStream = require("bunyan-prettystream");

const pkg = require("../package.json");
const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

export class Logger extends bunyan {
	public time(action: string, startTime: number) {
		let time = Date.now() - startTime;
		this.info({
			duration: time,
			action: action,
			type: "TIMER"
		}, `TIMER: ${action} completed in ${time} milliseconds`);
	}

	public get logLevelName():string {
		return bunyan.nameFromLevel[this.level()];
	}
}

export type LogLevels = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export default new Logger({
	name: `pact-node@${pkg.version}`,
	streams: [{
		level: (process.env.LOGLEVEL || "info") as bunyan.LogLevel,
		stream: prettyStdOut,
		type: "raw"
	}]
});
