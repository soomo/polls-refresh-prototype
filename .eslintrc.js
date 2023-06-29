module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:react/jsx-runtime',
		'plugin:@typescript-eslint/recommended',
		//'plugin:prettier/recommended',
		'plugin:react-hooks/recommended'
	],
	plugins: ['react', '@typescript-eslint'],
	env: {
		browser: true,
		jasmine: true,
		jest: true,
		es6: true,
		node: true
	},
	rules: {
		'@typescript-eslint/no-use-before-define': 0,
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				args: 'after-used',
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrors: 'all'
			}
		],
		'@typescript-eslint/member-delimiter-style': 0,
		'@typescript-eslint/camelcase': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'react/prop-types': 0,
		'eol-last': 'warn'
	},
	settings: {
		react: {
			pragma: 'React',
			version: 'detect'
		}
	},
	parser: '@typescript-eslint/parser'
};
