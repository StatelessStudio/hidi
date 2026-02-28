import { HasDependencies } from './has-dependencies';
import { StateValue } from './state-value';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Injectable<T = any> = T | (new (...args: any[]) => T);
export type InjectableKey<T = any> =
	| string
	| (new (...args: any[]) => T)
	| (abstract new (...args: any[]) => T);
/* eslint-enable @typescript-eslint/no-explicit-any */

enum RegistrationType {
	CLASS = 'class',
	INSTANCE = 'instance',
	FACTORY = 'factory',
}

interface Registration<T> {
	type: RegistrationType;
	value: T | (new () => T) | (() => T);
}

export class DependencyContainer {
	protected dependencies: Map<
		string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Registration<any>
	> = new Map();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected instances: Map<string, any> = new Map();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected states: Map<string, StateValue<any>> = new Map();
	// eslint-disable-next-line no-use-before-define
	protected parent?: DependencyContainer;

	// eslint-disable-next-line no-use-before-define
	constructor(parent?: DependencyContainer) {
		this.parent = parent;
	}

	/**
	 * Get the string key for an injectable
	 * @param injectable The injectable key (string or class type)
	 * @returns The string key
	 */
	public getInjectableKey<T>(injectable: InjectableKey<T>): string {
		let key: string | undefined;

		if (typeof injectable === 'string') {
			key = injectable;
		}
		else if (typeof injectable === 'function') {
			key = injectable.name;
		}

		if (!key) {
			throw new Error('Cannot get key for injectable.');
		}

		return key;
	}

	/**
	 * Register a class dependency (instantiated lazily, cached as singleton).
	 * If implementation is not provided, uses the key as the implementation.
	 * @param key The injectable key (string or class type)
	 * @param implementation Optional class implementation (defaults to key)
	 */
	public register<T>(
		key: InjectableKey<T>,
		implementation?: T | (new () => T)
	): void {
		const stringKey = this.getInjectableKey(key);
		const value = implementation ?? key;
		const type = this.isConstructor(value)
			? RegistrationType.CLASS
			: RegistrationType.INSTANCE;

		this.dependencies.set(stringKey, {
			type,
			value,
		});
	}

	/**
	 * Register a pre-instantiated singleton dependency.
	 * @param key The injectable key (string or class type)
	 * @param instance The instance to register
	 */
	public registerInstance<T>(key: InjectableKey<T>, instance: T): void {
		const stringKey = this.getInjectableKey(key);
		this.dependencies.set(stringKey, {
			type: RegistrationType.INSTANCE,
			value: instance,
		});
	}

	/**
	 * Register a factory function that creates a new instance each time.
	 * @param key The injectable key (string or class type)
	 * @param factory The factory function
	 */
	public registerFactory<T>(key: InjectableKey<T>, factory: () => T): void {
		const stringKey = this.getInjectableKey(key);
		this.dependencies.set(stringKey, {
			type: RegistrationType.FACTORY,
			value: factory,
		});
	}

	/**
	 * Get a dependency, searching up the parent chain if not found
	 * @param injectable The key of the dependency to retrieve
	 * @returns The dependency value, or undefined if not found
	 */
	public get<T>(injectable: InjectableKey<T>): T | undefined {
		const key = this.getInjectableKey(injectable);
		const registration = this.dependencies.get(key);

		if (registration) {
			// Return cached instance if it exists
			if (this.instances.has(key)) {
				return this.instances.get(key);
			}

			// Resolve based on registration type
			let instance: T;
			if (registration.type === RegistrationType.CLASS) {
				// CLASS type
				instance = new registration.value();
			}
			else if (registration.type === RegistrationType.FACTORY) {
				// FACTORY type
				instance = registration.value();
			}
			else {
				// INSTANCE type
				instance = registration.value as T;
			}

			// Cache instance unless it's from a factory
			if (registration.type !== RegistrationType.FACTORY) {
				this.instances.set(key, instance);
			}

			return instance;
		}

		// Check parent container
		if (this.parent) {
			const parentRegistration = this.parent.dependencies.get(key);

			// For CLASS types in parent, create fresh instance in this
			// container. This ensures child's overridden dependencies
			// inject properly.
			if (
				parentRegistration &&
				parentRegistration.type === RegistrationType.CLASS
			) {
				// Return cached instance if already created in this container
				if (this.instances.has(key)) {
					return this.instances.get(key);
				}

				const instance = new parentRegistration.value();
				this.instances.set(key, instance);
				return instance;
			}

			// For INSTANCE and FACTORY types, use parent's resolution
			return this.parent.get<T>(injectable);
		}

		return undefined;
	}

	/**
	 * Get a dependency, throwing an error if not found
	 * @param injectable The dependency key to retrieve
	 * @returns The dependency value
	 */
	public require<T>(injectable: InjectableKey<T>): T {
		const value = this.get<T>(injectable);

		if (value === undefined) {
			const name = this.getInjectableKey(injectable);

			throw new Error(
				`Required dependency '${name}' not found in container`
			);
		}

		return value;
	}

	/**
	 * Check if a dependency exists in the container or its parents
	 * @param injectable The injectable to check
	 */
	public has(injectable: InjectableKey): boolean {
		const key = this.getInjectableKey(injectable);
		return (this.dependencies.has(key) || this.parent?.has(key)) ?? false;
	}

	/**
	 * Register a stateful value in the container.
	 * @param key The state key (string or class type)
	 * @param initialValue The initial value for the state
	 * @returns The StateValue wrapper
	 */
	public registerState<T>(
		key: InjectableKey<T>,
		initialValue: T
	): StateValue<T> {
		const stringKey = this.getInjectableKey(key);
		const stateValue = new StateValue(initialValue);
		this.states.set(stringKey, stateValue);
		return stateValue;
	}

	/**
	 * Get a state value, searching up the parent chain if not found.
	 * @param key The state key (string or class type)
	 * @returns The StateValue wrapper
	 * @throws Error if state is not found
	 */
	public getState<T>(key: InjectableKey<T>): StateValue<T> {
		const stringKey = this.getInjectableKey(key);
		const state = this.states.get(stringKey);

		if (state) {
			return state;
		}

		if (this.parent) {
			return this.parent.getState<T>(key);
		}

		throw new Error(`State '${stringKey}' not found in container`);
	}

	/**
	 * Check if a state exists in the container or its parents.
	 * @param key The state key (string or class type)
	 */
	public hasState(key: InjectableKey): boolean {
		const stringKey = this.getInjectableKey(key);
		return (
			(this.states.has(stringKey) || this.parent?.hasState(stringKey)) ??
			false
		);
	}

	/**
	 * Subscribe to state changes.
	 * @param key The state key (string or class type)
	 * @param callback Function to call when state changes,
	 * 	receives (newValue, oldValue)
	 * @returns An unsubscribe function
	 */
	public subscribe<T>(
		key: InjectableKey<T>,
		callback: (newValue: T, oldValue: T) => void
	): () => void {
		const stateValue = this.getState<T>(key);
		return stateValue.subscribe(callback);
	}

	/**
	 * Subscribe to multiple state changes with a single callback.
	 * @param keys The state keys to subscribe to
	 * @param callback Function to call when any subscribed state changes,
	 * 	receives all current state values as arguments
	 * @returns An unsubscribe function that removes all subscriptions
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public subscribeMany(
		keys: InjectableKey[],
		callback: (...values: unknown[]) => void
	): () => void {
		const unsubscribers = keys.map((key) =>
			this.subscribe(key, () => {
				const values = keys.map((k) => this.getState(k).value);
				callback(...values);
			})
		);

		return () => unsubscribers.forEach((fn) => fn());
	}

	/**
	 * Create a child container that inherits from this one.
	 * Child containers have independent state registrations.
	 */
	public extend(): DependencyContainer {
		return new DependencyContainer(this);
	}

	/**
	 * Set the parent container
	 * @internal
	 */
	public setParent(parent: DependencyContainer): void {
		this.parent = parent;
	}

	/**
	 * Resolve dependencies for classes that implement HasDependencies
	 * @param instances Optional array of instances to inject. If not
	 * provided, injects all registered dependencies in this container.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public inject(instances?: any[]): void {
		const toInject = instances || Array.from(this.getAvailableKeys());

		for (const key of toInject) {
			const instance = this.get(key);

			// Check if the dependency has an inject method
			if (
				instance &&
				typeof (instance as HasDependencies).inject === 'function'
			) {
				(instance as HasDependencies).inject(this);
			}
		}
	}

	/**
	 * Get all available registration keys from this container and parents
	 */
	private getAvailableKeys(): Set<string> {
		const keys = new Set(this.dependencies.keys());

		if (this.parent) {
			for (const key of this.parent.dependencies.keys()) {
				keys.add(key);
			}
		}

		return keys;
	}

	protected isConstructor(value: unknown): boolean {
		return (
			typeof value === 'function' &&
			value.prototype &&
			value.prototype.constructor === value
		);
	}
}
