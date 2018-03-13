import install from "./install";

export const cli = () => {
	const args = process.argv.slice(2);
	return install(args.shift(), args.shift());
};

export default cli();
