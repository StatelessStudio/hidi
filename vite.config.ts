import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import dts from 'vite-plugin-dts';
import glob from 'fast-glob';
import { readFileSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(
	readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
);

const entries = glob.sync(['src/**/*.ts', 'src/**/*.tsx'], {
	ignore: ['**/*.test.ts', '**/*.spec.ts'],
});

export default defineConfig({
	plugins: [
		dts({
			outDir: 'dist',
		}),
	],

	// Server configuration for development
	server: {
		port: 8080,
		strictPort: false,
		open: false,
	},

	// Preview configuration
	preview: {
		port: 8080,
		strictPort: false,
	},

	// Build configuration
	build: {
		outDir: 'dist',
		target: 'es2022',
		lib: {
			entry: entries.map((e) => resolve(e)),
		},
		minify: 'terser',
		terserOptions: {
			format: {
				comments: true,
			},
		},
		sourcemap: false,
		rollupOptions: {
			// External dependencies that shouldn't be bundled
			external: [
				...Object.keys(pkg.dependencies || {}),
				...Object.keys(pkg.peerDependencies || {}),
			].map((dep) => new RegExp(`^${dep}(/.*)?$`)),
			output: [
				{
					format: 'es',
					entryFileNames: '[name].mjs',
					chunkFileNames: '[name].mjs',
					preserveModules: true,
					dir: 'dist/src',
				},
				{
					format: 'cjs',
					entryFileNames: '[name].cjs',
					chunkFileNames: '[name].cjs',
					preserveModules: true,
					dir: 'dist/src',
				},
			],
		},
	},

	// Module resolution
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
	},

	// Optimize dependencies
	optimizeDeps: {
		include: [],
	},

	// Environment variables
	define: {
		'process.env.NODE_ENV': JSON.stringify(
			process.env['NODE_ENV'] || 'development'
		),
	},
});
