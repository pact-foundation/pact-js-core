// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof process.addon === 'function') {
  // if the platform supports native resolving prefer that
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  module.exports = process.addon.bind(process);
} else {
  // else use the runtime version here
  // eslint-disable-next-line global-require, import/extensions
  module.exports = require('./node-gyp-build.js');
}
