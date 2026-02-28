/* eslint-disable no-console */

/**
 * Example: State Subscription and Pub/Sub Pattern
 *
 * This example demonstrates how to register state in a container,
 * publish state changes, and subscribe to those changes from dependents.
 */

import { DependencyContainer, HasDependencies, StateValue } from '../src';

// ============================================================================
// Setup: Define application state and services
// ============================================================================

/**
 * Application state that tracks a counter value.
 */
class CounterState {
	value: number = 0;
}

/**
 * A logger service for displaying messages.
 */
class Logger {
	log(message: string): void {
		console.log(`[Logger] ${message}`);
	}
}

/**
 * A counter service that manages the counter state and logs changes.
 * It demonstrates how to:
 * 1. Pull the state from the container
 * 2. Subscribe to state changes
 * 3. Perform side effects when state changes
 */
class CounterService implements HasDependencies {
	private logger!: Logger;
	private counterState!: StateValue<CounterState>;
	private unsubscribe?: () => void;

	/**
	 * Called after instantiation to resolve dependencies.
	 */
	inject(container: DependencyContainer): void {
		this.logger = container.require(Logger);
		this.counterState = container.getState(CounterState);

		// Subscribe to counter state changes
		this.unsubscribe = container.subscribe(
			CounterState,
			(newState, oldState) => {
				this.logger.log(
					`Counter changed: ${oldState.value} → ${newState.value}`
				);
			}
		);
	}

	/**
	 * Increment the counter value.
	 */
	increment(): void {
		const current = this.counterState.value;
		this.counterState.value = {
			...current,
			value: current.value + 1,
		};
	}

	/**
	 * Decrement the counter value.
	 */
	decrement(): void {
		const current = this.counterState.value;
		this.counterState.value = {
			...current,
			value: current.value - 1,
		};
	}

	/**
	 * Reset counter to zero.
	 */
	reset(): void {
		this.counterState.value = { value: 0 };
	}

	/**
	 * Get the current counter value.
	 */
	getCounter(): number {
		return this.counterState.value.value;
	}

	/**
	 * Cleanup: unsubscribe from state changes.
	 */
	destroy(): void {
		this.unsubscribe?.();
	}
}

/**
 * A display service that shows the current counter value.
 * It demonstrates subscribing to the same state from a different service.
 */
class CounterDisplay implements HasDependencies {
	private logger!: Logger;
	private counterState!: StateValue<CounterState>;
	private unsubscribe?: () => void;

	inject(container: DependencyContainer): void {
		this.logger = container.require(Logger);
		this.counterState = container.getState(CounterState);

		// Subscribe to display updates
		this.unsubscribe = container.subscribe(CounterState, (newState) => {
			this.display(newState.value);
		});
	}

	private display(value: number): void {
		this.logger.log(`Counter Display: ${value}`);
	}

	destroy(): void {
		this.unsubscribe?.();
	}
}

// ============================================================================
// Basic Example: Single Container
// ============================================================================

function basicExample(): void {
	console.log('\n=== Basic State Subscription Example ===\n');

	// Create container and register dependencies
	const container = new DependencyContainer();
	container.register(Logger);
	container.register(CounterService);
	container.register(CounterDisplay);

	// Register initial state
	container.registerState(CounterState, { value: 0 });

	// Inject dependencies (this calls inject() on services)
	container.inject();

	// Get service instances
	const counterService = container.require(CounterService);
	const logger = container.require(Logger);

	// Demonstrate state changes
	logger.log('Incrementing counter...');
	counterService.increment(); // Triggers subscribers
	counterService.increment();
	counterService.increment();

	logger.log('Current counter value: ' + counterService.getCounter());

	logger.log('Resetting counter...');
	counterService.reset(); // Triggers subscribers

	logger.log('Decrementing counter...');
	counterService.decrement();
	counterService.decrement();

	// Cleanup
	container.require(CounterService).destroy();
	container.require(CounterDisplay).destroy();
}

// ============================================================================
// Hierarchical Example: Parent-Child Containers
// ============================================================================

class AppConfig {
	apiUrl: string = 'https://api.example.com';
	debug: boolean = false;
}

class ConfigDisplay implements HasDependencies {
	private logger!: Logger;
	private config!: StateValue<AppConfig>;
	private unsubscribe?: () => void;

	inject(container: DependencyContainer): void {
		this.logger = container.require(Logger);
		this.config = container.getState(AppConfig);

		this.unsubscribe = container.subscribe(AppConfig, (newConfig) => {
			this.logger.log(`Config updated: ${JSON.stringify(newConfig)}`);
		});
	}

	destroy(): void {
		this.unsubscribe?.();
	}
}

function hierarchicalExample(): void {
	console.log('\n=== Hierarchical Containers Example ===\n');

	// Create root container with shared services
	const rootContainer = new DependencyContainer();
	rootContainer.register(Logger);

	// Register shared state in root
	const configState = rootContainer.registerState(AppConfig, {
		apiUrl: 'https://api.example.com',
		debug: false,
	});

	// Create a production tier (inherits from root)
	const productionContainer = rootContainer.extend();
	productionContainer.register(ConfigDisplay);
	productionContainer.inject();

	const logger = rootContainer.require(Logger);
	logger.log('Production tier created');

	// Create a development tier (also inherits from root)
	const devContainer = rootContainer.extend();
	devContainer.register(ConfigDisplay);

	// Development tier overrides config with local state
	devContainer.registerState(AppConfig, {
		apiUrl: 'http://localhost:3000',
		debug: true,
	});
	devContainer.inject();

	logger.log('\nUpdating root config...');
	configState.value = {
		apiUrl: 'https://api.example.com/v2',
		debug: false,
	};

	logger.log('\nUpdating dev config (independent)...');
	const devConfig = devContainer.getState(AppConfig);
	devConfig.value = {
		apiUrl: 'http://localhost:3000',
		debug: true,
	};

	logger.log(
		'\nNote: Production and Dev have independent state. ' +
			'Changes to one do not affect the other.'
	);

	// Cleanup
	productionContainer.require(ConfigDisplay).destroy();
	devContainer.require(ConfigDisplay).destroy();
}

// ============================================================================
// Direct Subscription Example: Without Service Classes
// ============================================================================

function directSubscriptionExample(): void {
	console.log('\n=== Direct Subscription Example ===\n');

	const container = new DependencyContainer();
	container.register(Logger);

	// Register a user state
	interface User {
		id: number;
		name: string;
		email: string;
	}

	const userState = container.registerState<User>('user', {
		id: 1,
		name: 'John Doe',
		email: 'john@example.com',
	});

	const logger = container.require(Logger);

	// Subscribe directly without a service
	const unsubscribe1 = container.subscribe<User>(
		'user',
		(newUser, oldUser) => {
			logger.log(`User changed from ${oldUser.name} to ${newUser.name}`);
		}
	);

	const unsubscribe2 = container.subscribe<User>('user', (newUser) => {
		logger.log(`Email: ${newUser.email}`);
	});

	// Change user state
	logger.log('Updating user...');
	userState.value = {
		id: 1,
		name: 'Jane Doe',
		email: 'jane@example.com',
	};

	logger.log('Unsubscribing first listener...');
	unsubscribe1();

	logger.log('Updating user again...');
	userState.value = {
		id: 1,
		name: 'Jane Smith',
		email: 'jane.smith@example.com',
	};

	// Second listener still active, first is not
	logger.log('(First listener was not called on second update)');

	unsubscribe2();
}

/**
 * Example: Subscribing to Multiple States
 *
 * This example demonstrates how to subscribe to multiple states with a single
 * callback using subscribeMany(), which is useful for dependent state.
 */
function subscribeMultipleStatesExample(): void {
	console.log('\n========================================');
	console.log('Example 4: Subscribe to Multiple States');
	console.log('========================================\n');

	// Setup container and state
	const container = new DependencyContainer();
	container.register(Logger);

	// Register multiple related state values
	container.registerState('username', 'Alice');
	container.registerState('isOnline', false);
	container.registerState('messageCount', 0);

	const logger = container.require(Logger);

	// Subscribe to multiple states with a single callback
	logger.log('Setting up multi-state subscription...');
	const unsubscribe = container.subscribeMany(
		['username', 'isOnline', 'messageCount'],
		(username, isOnline, messageCount) => {
			logger.log(
				`User: ${username}, ` +
					`Online: ${isOnline}, ` +
					`Messages: ${messageCount}`
			);
		}
	);

	// Update states - callback fires each time any state changes
	logger.log('\nUpdating username...');
	container.getState('username').value = 'Bob';

	logger.log('\nUpdating isOnline...');
	container.getState('isOnline').value = true;

	logger.log('\nUpdating messageCount...');
	container.getState('messageCount').value = 5;

	logger.log('\nUpdating multiple states...');
	container.getState('username').value = 'Charlie';
	container.getState('messageCount').value = 10;

	logger.log('\nUnsubscribing from all states...');
	unsubscribe();

	logger.log('Updating states (callback should not fire)...');
	container.getState('isOnline').value = false;

	logger.log('(Multi-state listener was not called)');
}

// ============================================================================
// Run Examples
// ============================================================================

basicExample();
hierarchicalExample();
directSubscriptionExample();
subscribeMultipleStatesExample();
