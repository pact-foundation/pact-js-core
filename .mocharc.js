process.env.TS_NODE_PROJECT = 'tsconfig.test.json';

module.exports = {
	exclude: '**/*.jest.spec.ts',
	require: ['ts-node/register'],
	timeout: '30000',
	slow: '5000',
	exit: true,
	'check-leaks': true,
};
