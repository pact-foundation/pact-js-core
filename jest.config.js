module.exports = {
	testMatch: ['**/?(*.)jest.spec.ts'],
	transform: { '^.+\\.(ts)$': 'ts-jest' },
	globals: {
		'ts-jest': {
			tsconfig: 'tsconfig.spec.json',
		},
	},
};
