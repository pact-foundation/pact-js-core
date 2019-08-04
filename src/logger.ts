const bunyan = require('bunyan');
const PrettyStream = require('bunyan-prettystream');

const pkg = require('../package.json');
const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

// TODO: replace bunyan with something that actually works with typescript
// Extend bunyan
bunyan.prototype.time = (action: string, startTime: number) => {
  let time = Date.now() - startTime;
  // @ts-ignore
  this.info(
    {
      duration: time,
      action: action,
      type: 'TIMER',
    },
    `TIMER: ${action} completed in ${time} milliseconds`,
  );
};

// @ts-ignore
bunyan.prototype.logLevelName = (): string =>
  bunyan.nameFromLevel[this.level()];

export type LogLevels = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const Logger = new bunyan({
  name: `pact-node@${pkg.version}`,
  streams: [
    {
      level: (process.env.LOGLEVEL || 'info') as LogLevels,
      stream: prettyStdOut,
      type: 'raw',
    },
  ],
});

export default Logger;
