/* eslint-disable @typescript-eslint/no-explicit-any */
export type Injectable<T = any> = T | (new (...args: any[]) => T);
export type InjectableKey<T = any> =
	| string
	| (new (...args: any[]) => T)
	| (abstract new (...args: any[]) => T);
/* eslint-enable @typescript-eslint/no-explicit-any */

export class DependencyContainer {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected dependencies: Map<string, Injectable> = new Map();
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
	 * Register a dependency
	 * @param key Explicit key (string or class type)
	 * @param injectable The dependency value or class type
	 */
	public register<T>(key: InjectableKey<T>, injectable: Injectable<T>): void {
		this.dependencies.set(this.getInjectableKey(key), injectable);
	}

	/**
	 * Get a dependency, searching up the parent chain if not found
	 * @param injectable The key of the dependency to retrieve
	 * @returns The dependency value, or undefined if not found
	 */
	public get<T>(injectable: InjectableKey<T>): T | undefined {
		const key = this.getInjectableKey(injectable);

		if (this.dependencies.has(key)) {
			return this.dependencies.get(key);
		}

		if (this.parent) {
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
	 * Create a child container that inherits from this one
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
}
