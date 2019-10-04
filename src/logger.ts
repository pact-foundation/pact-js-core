// eslint-disable-next-line @typescript-eslint/no-var-requires
const bunyan = require('bunyan');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PrettyStream = require('bunyan-prettystream');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

// TODO: replace bunyan with something that actually works with typescript
// Extend bunyan
bunyan.prototype.time = (action: string, startTime: number): void => {
  let time = Date.now() - startTime;
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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
