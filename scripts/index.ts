/* eslint-disable no-console */

if (process.argv.length < 3) {
	throw new Error('Usage: npm run script -- my-script');
}

console.log('Running script', process.argv[2]);

import('./' + process.argv[2])
	.then((run) => {
		run
			.default()
			.then(() => {
				process.exit(0);
			})
			.catch((err: string | Error) => {
				console.error(err);
				process.exit(1);
			});
	})
	.catch((err: string | Error) => {
		console.error('Error loading script:', err);
		process.exit(1);
	});
