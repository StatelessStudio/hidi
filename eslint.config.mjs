import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const eslintConfig = [
	{
		ignores: ['node_modules', 'dist', 'coverage'],
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				projectService: true,
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
			},
		},
		plugins: {
			'@typescript-eslint': tsPlugin,
		},
		rules: {
			...js.configs.recommended.rules,
			...tsPlugin.configs.recommended.rules,
			'@typescript-eslint/no-floating-promises': ['error'],
			'@typescript-eslint/no-unused-vars': ['warn'],
			'brace-style': ['error', 'stroustrup'],
			curly: ['error', 'all'],
			eqeqeq: ['error', 'always'],
			'max-len': ['warn', { code: 88 }],
			'no-console': ['warn'],
			quotes: ['warn', 'single', { avoidEscape: true }],
			semi: ['error', 'always'],
		},
	},
];

export default eslintConfig;
