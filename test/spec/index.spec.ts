import 'jasmine';
import * as index from '../../src';

describe('ts-di', () => {
	it('exports a', () => {
		expect(index.a).toBeTrue();
	});
});
