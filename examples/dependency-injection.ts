/* eslint-disable no-console */

/**
 * Simple example demonstrating the Dependency interface and injection
 */

import { DependencyContainer, HasDependencies } from '../src/index';

// Example services
class Logger {
	log(message: string): void {
		console.log(`[LOG] ${message}`);
	}

	error(message: string): void {
		console.error(`[ERROR] ${message}`);
	}
}

class Database implements HasDependencies {
	private connected = false;
	private logger: Logger;

	inject(container: DependencyContainer): void {
		this.logger = container.require(Logger);
	}

	async connect(): Promise<void> {
		this.logger.log('Connecting to database...');
		this.connected = true;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	query(sql: string): any[] {
		if (!this.connected) {
			this.logger.error('Database not connected');
			throw new Error('Database not connected');
		}

		this.logger.log(`Executing: ${sql}`);
		return [];
	}
}

// Repository implementing Dependency interface
class UserRepository implements HasDependencies {
	private db: Database;
	private logger: Logger;

	inject(container: DependencyContainer): void {
		this.db = container.require(Database);
		this.logger = container.require(Logger);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getAllUsers(): any[] {
		this.logger.log('Fetching all users');
		return this.db.query('SELECT * FROM users');
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getUserById(id: string): any {
		this.logger.log(`Fetching user ${id}`);
		return this.db.query(`SELECT * FROM users WHERE id = ${id}`)[0];
	}
}

// Service implementing Dependency interface
class UserService implements HasDependencies {
	private repository: UserRepository;
	private logger: Logger;

	inject(container: DependencyContainer): void {
		this.repository = container.require(UserRepository);
		this.logger = container.require(Logger);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	listUsers(): any[] {
		this.logger.log('Listing all users');
		return this.repository.getAllUsers();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	findUser(id: string): any {
		this.logger.log(`Finding user ${id}`);
		return this.repository.getUserById(id);
	}
}

// Main example
async function main(): Promise<void> {
	// Create container and register classes
	const container = new DependencyContainer();
	container.register(Logger);
	container.register(Database);
	container.register(UserRepository);
	container.register(UserService);

	// Resolve all dependencies
	container.inject();

	// Get instances and connect database (after injection)
	const database = container.require(Database);
	await database.connect();

	const service = container.require(UserService);

	// Use services - watch the log output to see DI in action
	console.log('\n--- Fetching all users ---');
	const users = service.listUsers();
	console.log(`Found ${users.length} users\n`);

	console.log('--- Fetching user by ID ---');
	const user = service.findUser('123');
	console.log('User:', user);
}

main().catch(console.error);
