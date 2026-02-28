# Dependency Injection

Automatically resolve dependencies for classes and services.

## `inject(instances?)`

Resolve dependencies for classes that implement the `HasDependencies` interface in this container.

If no instances are provided, injects all registered dependencies in this container. Alternatively, pass an array of specific instances to inject (useful for classes not registered in the container or for selective injection).

```typescript
// Inject all registered dependencies in this container
container.inject();

// Or inject specific instances
const unregisteredService = new MyService();
container.inject([unregisteredService]);
```

## HasDependencies Interface

Implement the `HasDependencies` interface to enable automatic dependency resolution. Define an `inject(container: DependencyContainer)` method where you explicitly retrieve required dependencies using `container.require()`.

```typescript
import { DependencyContainer, HasDependencies } from 'hidi';

class UserRepository implements HasDependencies {
  private db: Database;

  inject(container: DependencyContainer): void {
    this.db = container.require(Database);
  }

  getUsers() {
    return this.db.query('SELECT * FROM users');
  }
}
```

## Full Example

Here's a complete example showing dependency chain resolution:

```typescript
class Database implements HasDependencies {
  private config: DatabaseConfig;

  inject(container: DependencyContainer): void {
    this.config = container.require('dbConfig');
  }

  connect() {
    console.log(`Connected to ${this.config.host}`);
  }
}

class UserRepository implements HasDependencies {
  private db: Database;

  inject(container: DependencyContainer): void {
    this.db = container.require(Database);
  }

  getUsers() {
    return this.db.query('SELECT * FROM users');
  }
}

class UserService implements HasDependencies {
  private repository: UserRepository;
  private logger: Logger;

  inject(container: DependencyContainer): void {
    this.repository = container.require(UserRepository);
    this.logger = container.require(Logger);
  }

  listUsers() {
    this.logger.log('Fetching users');
    return this.repository.getUsers();
  }
}

// Setup
const container = new DependencyContainer();
container.register('dbConfig', { host: 'localhost', port: 5432 });
container.register(Database, new Database());
container.register(Logger, new Logger());
container.register(UserRepository, new UserRepository());
container.register(UserService, new UserService());

// Resolve all dependencies recursively
container.inject();

// Use services
const service = container.require(UserService);
service.listUsers();
```

## Selective Injection

Inject dependencies only into specific instances without registering them:

```typescript
const repository = new UserRepository();
const customService = new CustomService();

// Only these instances get injected, not all registered dependencies
container.inject([repository, customService]);
```

## Async Initialization

For services that need to perform async initialization and then access dependencies:

```typescript
class Database {
  async connect(): Promise<void> {
    console.log('Connecting to database...');
  }
}

// Setup and resolve dependencies
const container = new DependencyContainer();
const db = new Database();

container.register(Database, db);
container.register(Logger, new Logger());
container.register(UserRepository, new UserRepository());

// Perform async initialization first
await db.connect();

// Then resolve all registered dependencies
container.inject();

// Now services have access to their initialized dependencies
```
