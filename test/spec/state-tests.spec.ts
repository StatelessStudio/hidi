// State Management Tests - AppendedTo index.spec.ts
import 'jasmine';
import { DependencyContainer } from '../../src';

describe('State Management (pub/sub)', () => {
	let container: DependencyContainer;

	beforeEach(() => {
		container = new DependencyContainer();
	});

	describe('registerState()', () => {
		it('should register state with a string key', () => {
			container.registerState('counter', 0);

			expect(container.hasState('counter')).toBeTrue();
		});

		it('should register state with a class type as key', () => {
			class UserState {
				name: string = 'user';
			}

			container.registerState(UserState, { name: 'John' });

			expect(container.hasState(UserState)).toBeTrue();
		});

		it('should return a StateValue wrapper', () => {
			const state = container.registerState('count', 0);

			expect(state.value).toBe(0);
		});

		it('should preserve complex object state', () => {
			const initialState = { name: 'Alice', age: 30 };
			const state = container.registerState('user', initialState);

			expect(state.value).toEqual(initialState);
		});

		it('should overwrite existing state with same key', () => {
			const state1 = container.registerState('value', 'first');
			const state2 = container.registerState('value', 'second');

			expect(container.getState('value').value).toBe('second');
			expect(state1.value).toBe('first');
			expect(state2.value).toBe('second');
		});
	});

	describe('getState()', () => {
		it('should retrieve registered state by string key', () => {
			container.registerState('message', 'hello');

			const state = container.getState('message');

			expect(state.value).toBe('hello');
		});

		it('should retrieve registered state by class type key', () => {
			class Config {
				setting: string = 'default';
			}

			container.registerState(Config, { setting: 'prod' });

			const state = container.getState(Config);

			expect(state.value.setting).toBe('prod');
		});

		it('should throw error for non-existent state', () => {
			expect(() => container.getState('nonexistent')).toThrowError(
				'State \'nonexistent\' not found in container'
			);
		});

		it('should return the same StateValue instance for same key', () => {
			container.registerState('count', 0);

			const state1 = container.getState('count');
			const state2 = container.getState('count');

			expect(state1).toBe(state2);
		});
	});

	describe('hasState()', () => {
		it('should return true for registered state', () => {
			container.registerState('test', 'value');

			expect(container.hasState('test')).toBeTrue();
		});

		it('should return false for non-existent state', () => {
			expect(container.hasState('missing')).toBeFalse();
		});

		it('should check parent container state', () => {
			const parent = new DependencyContainer();
			parent.registerState('shared', 'value');

			const child = parent.extend();

			expect(child.hasState('shared')).toBeTrue();
		});
	});

	describe('subscribe()', () => {
		it('should call callback when state value changes', () => {
			const state = container.registerState('counter', 0);
			const callback = jasmine.createSpy('callback');

			container.subscribe('counter', callback);
			state.value = 1;

			expect(callback).toHaveBeenCalledWith(1, 0);
		});

		it('should provide new and old values to callback', () => {
			const state = container.registerState('message', 'hello');
			const callback = jasmine.createSpy('callback');

			container.subscribe('message', callback);
			state.value = 'world';

			expect(callback).toHaveBeenCalledWith('world', 'hello');
		});

		it('should support multiple subscribers', () => {
			const state = container.registerState('value', 'initial');
			const callback1 = jasmine.createSpy('callback1');
			const callback2 = jasmine.createSpy('callback2');

			container.subscribe('value', callback1);
			container.subscribe('value', callback2);
			state.value = 'updated';

			expect(callback1).toHaveBeenCalledWith('updated', 'initial');
			expect(callback2).toHaveBeenCalledWith('updated', 'initial');
		});

		it('should return an unsubscribe function', () => {
			const state = container.registerState('count', 0);
			const callback = jasmine.createSpy('callback');

			const unsubscribe = container.subscribe('count', callback);
			state.value = 1;

			expect(callback).toHaveBeenCalledWith(1, 0);

			unsubscribe();

			state.value = 2;

			expect(callback).toHaveBeenCalledTimes(1);
		});

		it('should throw error when subscribing to non-existent state', () => {
			expect(() => {
				container.subscribe('missing', () => {});
			}).toThrowError('State \'missing\' not found in container');
		});

		it('should support subscription from class type key', () => {
			class AppState {
				isLoading: boolean = false;
			}

			const state = container.registerState(AppState, {
				isLoading: false,
			});
			const callback = jasmine.createSpy('callback');

			container.subscribe(AppState, callback);
			state.value = { isLoading: true };

			expect(callback).toHaveBeenCalledWith(
				{ isLoading: true },
				{ isLoading: false }
			);
		});
	});

	describe('Hierarchical State (container inheritance)', () => {
		it('should allow child container to access parent state', () => {
			const parent = new DependencyContainer();
			parent.registerState('shared', 'parentValue');

			const child = parent.extend();

			const state = child.getState('shared');
			expect(state.value).toBe('parentValue');
		});

		it('should allow child to register independent state', () => {
			const parent = new DependencyContainer();
			parent.registerState('sharedKey', 'parentValue');

			const child = parent.extend();
			child.registerState('childKey', 'childValue');

			expect(parent.hasState('childKey')).toBeFalse();
			expect(child.hasState('childKey')).toBeTrue();
			expect(child.hasState('sharedKey')).toBeTrue();
		});

		it('should allow child to override parent state independently', () => {
			const parent = new DependencyContainer();
			const parentState = parent.registerState('counter', 0);

			const child = parent.extend();
			const childState = child.registerState('counter', 100);

			expect(parentState).not.toBe(childState);
			expect(parentState.value).toBe(0);
			expect(childState.value).toBe(100);
		});

		it('should not affect parent when child state changes', () => {
			const parent = new DependencyContainer();
			parent.registerState('value', 'parent');

			const child = parent.extend();
			child.registerState('value', 'child');

			const childState = child.getState('value');
			childState.value = 'childUpdated';

			expect(parent.getState('value').value).toBe('parent');
			expect(childState.value).toBe('childUpdated');
		});

		it('should allow subscribing to parent state from child', () => {
			const parent = new DependencyContainer();
			const parentState = parent.registerState('shared', 'initial');

			const child = parent.extend();
			const callback = jasmine.createSpy('callback');

			child.subscribe('shared', callback);
			parentState.value = 'updated';

			expect(callback).toHaveBeenCalledWith('updated', 'initial');
		});

		it('should maintain state independence across siblings', () => {
			const parent = new DependencyContainer();
			const parentState = parent.registerState('counter', 0);

			const child1 = parent.extend();
			const child1State = child1.registerState('counter', 10);

			const child2 = parent.extend();
			const child2State = child2.registerState('counter', 20);

			expect(parentState.value).toBe(0);
			expect(child1State.value).toBe(10);
			expect(child2State.value).toBe(20);

			child1State.value = 15;

			expect(parentState.value).toBe(0);
			expect(child1State.value).toBe(15);
			expect(child2State.value).toBe(20);
		});

		it(
			'should support deep nesting of containers with ' +
				'independent state',
			() => {
				const root = new DependencyContainer();
				root.registerState('level', 0);

				const level1 = root.extend();
				level1.registerState('level', 1);

				const level2 = level1.extend();
				level2.registerState('level', 2);

				const level3 = level2.extend();

				expect(root.getState('level').value).toBe(0);
				expect(level1.getState('level').value).toBe(1);
				expect(level2.getState('level').value).toBe(2);
				expect(level3.getState('level').value).toBe(2);
			}
		);
	});

	describe('StateValue reactive wrapper', () => {
		it('should update value via setter', () => {
			const state = container.registerState('count', 0);

			state.value = 5;

			expect(state.value).toBe(5);
		});

		it('should notify subscribers on multiple updates', () => {
			const state = container.registerState('value', 1);
			const callback = jasmine.createSpy('callback');

			container.subscribe('value', callback);

			state.value = 2;
			state.value = 3;
			state.value = 4;

			expect(callback).toHaveBeenCalledTimes(3);
			expect(callback).toHaveBeenCalledWith(2, 1);
			expect(callback).toHaveBeenCalledWith(3, 2);
			expect(callback).toHaveBeenCalledWith(4, 3);
		});

		it('should handle complex type mutations', () => {
			const initialArray = [1, 2, 3];
			const state = container.registerState('items', [...initialArray]);
			const callback = jasmine.createSpy('callback');

			container.subscribe('items', callback);

			const newArray = [1, 2, 3, 4];
			state.value = newArray;

			expect(callback).toHaveBeenCalledWith(newArray, initialArray);
			expect(state.value).toEqual([1, 2, 3, 4]);
		});

		it(
			'should allow same StateValue instance to be retrieved ' +
				'and subscribed',
			() => {
				const registered = container.registerState('count', 0);
				const retrieved = container.getState('count');

				const callback = jasmine.createSpy('callback');
				registered.subscribe(callback);

				retrieved.value = 5;

				expect(callback).toHaveBeenCalledWith(5, 0);
			}
		);
	});
});
