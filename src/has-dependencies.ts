import { DependencyContainer } from './container';

/**
 * Interface for classes that have dependencies to resolve from the container
 *
 * Use `container.require()` with class types as keys. It automatically throws
 * a descriptive error if a dependency is not found, eliminating the need for
 * manual null checking or type casting.
 *
 * @example
 * ```typescript
 * class UserRepository implements HasDependencies {
 *   private db: Database;
 *
 *   inject(container: DependencyContainer): void {
 *     this.db = container.require(Database);
 *   }
 * }
 *
 * const container = new DependencyContainer();
 * const db = new Database();
 * container.register(Database, db);
 *
 * const repo = new UserRepository();
 * container.inject([repo]);
 * ```
 */
export interface HasDependencies {
	/**
	 * Called to resolve dependencies from the container into this object.
	 * Synchronously retrieve required dependencies using
	 * 	`container.require(ClassName)`.
	 * @param container The DependencyContainer to pull dependencies from
	 */
	inject(container: DependencyContainer): void;
}
