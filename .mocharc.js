module.exports = {
	exclude: '**/*.jest.spec.ts',
	require: 'ts-node/register',
	timeout: '30000',
	slow: '5000',
	exit: true,
	require: 'ts-node.js',
	'check-leaks': true,
};
