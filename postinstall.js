const install = require('./standalone/install').default;
const args = process.argv.slice(2);
install(args.shift(), args.shift()).catch(e => {
  console.error(e);
  process.exit(1);
});
