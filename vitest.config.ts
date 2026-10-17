import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'@': resolve('./src'),
		},
	},
	test: {
		// Environment
		environment: 'node',

		// Setup and teardown
		globalSetup: 'test/setup-global.ts',
		setupFiles: 'test/setup-file.ts',

		// Global test APIs (describe, it, expect, etc.)
		globals: false,

		// Include test files matching these patterns
		include: [
			'src/**/*.{test,spec}.{ts,tsx}',
			'test/**/*.{test,spec}.{ts,tsx}',
		],

		// Test reporters
		reporters: ['default'],

		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.ts'],
			exclude: [
				'node_modules/',
				'dist/',
				'test/',
				'**/*.d.ts',
				'**/*.config.*',
			],
		},

		// Optional: enable UI dashboard (run with --ui flag)
		ui: false,
	},
});
