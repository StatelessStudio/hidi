# hidi - Hierarchical Dependency Injection for TypeScript

A lightweight, type-safe dependency injection container for TypeScript applications. Simplify dependency management with support for hierarchical containers, explicit key registration, and a minimal API.

Software Development by [Stateless Studio](https://stateless.studio)

## Features

- 🎯 **Type-Safe** - Full TypeScript support with generic types for type-safe dependency retrieval
- 🔑 **Flexible Key Registration** - Register dependencies using string keys or class constructors
- 🌳 **Hierarchical Containers** - Support for parent-child container relationships with automatic fallback
- ⚡ **Lightweight** - Minimal API surface with zero external dependencies
- 🧪 **Well-Tested** - 100% code coverage with comprehensive test suite
- 📦 **Production-Ready** - Simple, predictable behavior for reliable dependency management

## Installation

```bash
npm install hidi
```

## Quick Start

### Basic Registration and Retrieval

Register dependencies using string keys:

```typescript
import { DependencyContainer } from 'hidi';

const container = new DependencyContainer();

// Register a dependency with a string key
container.register('logger', console.log);

// Retrieve the dependency
const logger = container.get('logger');
```

### Using Class Constructors as Keys

Register and retrieve using class constructors:

```typescript
class DatabaseService {
  connect() {
    console.log('Connected to database');
  }
}

const dbService = new DatabaseService();
container.register(DatabaseService, dbService);

// Retrieve by class constructor
const db = container.get(DatabaseService);
db?.connect(); // "Connected to database"
```

## API Reference

### Registration Methods

#### `register(key, implementation?)`

Register a dependency as a singleton (cached after first instantiation). If `implementation` is a class constructor, it will be instantiated once and cached. If it's an instance, it will be registered directly.

```typescript
// Register an instance with a string key
container.register('apiUrl', 'https://api.example.com');

// Register a class constructor (lazy instantiation, cached as singleton)
class UserService {}
container.register(UserService);

// Or provide an explicit instance
container.register(UserService, new UserService());
```

#### `registerInstance(key, instance)`

Explicitly register a pre-instantiated singleton dependency.

```typescript
const logger = new Logger();
container.registerInstance(Logger, logger);
container.registerInstance('config', { timeout: 5000 });
```

#### `registerFactory(key, factory)`

Register a factory function that creates a new instance each time the dependency is retrieved (transient pattern).

```typescript
// Returns a new Service instance on every call
container.registerFactory(Service, () => new Service());

// Factory can access other dependencies
container.registerFactory('timestamp', () => Date.now());
```

### `get(key)`

Retrieve a dependency from the container. Searches parent containers if not found locally. Returns `undefined` if not found.

For singleton registrations (class or instance), returns the cached instance on subsequent calls.

```typescript
const value = container.get('apiUrl');
const userService = container.get(UserService);

// Factory registrations return a new instance each time
const timestamp1 = container.get('timestamp');
const timestamp2 = container.get('timestamp');
// timestamp1 !== timestamp2
```

### `require(key)`

Retrieve a dependency, or throw an error if the dependency is not found in the container hierarchy.

```typescript
try {
  const config = container.require('appConfig');
}
catch (error) {
  console.error('Required dependency not found:', error.message);
}
```

### `has(key)`

Check if a dependency exists in the container or any parent container.

```typescript
if (container.has('logger')) {
  const logger = container.get('logger');
}
```

### `extend()`

Create a child container that inherits from the current container. Child containers can override parent dependencies.

```typescript
const parentContainer = new DependencyContainer();
parentContainer.register('dbUrl', 'postgres://prod');
parentContainer.register(Logger);

const childContainer = parentContainer.extend();

// Child inherits parent registrations
console.log(childContainer.get('dbUrl')); // "postgres://prod"
console.log(childContainer.get(Logger)); // Logger instance

// Override in child - instances from parent are inherited as-is
childContainer.registerInstance('dbUrl', 'postgres://dev');
console.log(childContainer.get('dbUrl')); // "postgres://dev"

// Class registrations create fresh instances in child containers
const parentLogger = parentContainer.get(Logger);
const childLogger = childContainer.get(Logger);
// parentLogger !== childLogger (different instances, both singletons in their containers)
```

**Note on inheritance by registration type:**
- **CLASS registrations**: Child containers create their own cached instances (fresh singleton)
- **INSTANCE registrations**: Child containers inherit parent's instance as-is
- **FACTORY registrations**: Child containers inherit the factory function and create new instances on each call

### `setParent(parent)`

Manually set the parent container for a dependency container.

```typescript
const child = new DependencyContainer();
const parent = new DependencyContainer();
child.setParent(parent);
```

### `inject(instances?)`

Resolve dependencies for classes that implement the `HasDependencies` interface in this container.

If no instances are provided, injects all registered dependencies in this container. Alternatively, pass an array of specific instances to inject (useful for classes not registered in the container or for selective injection).

```typescript
// Inject all registered dependencies in this container
container.inject();

// Or inject specific instances
const unregisteredService = new MyService();
container.inject([unregisteredService]);
```

## Registration Types & Caching

Understanding how different registration methods work is important for choosing the right approach:

| Registration | Method | Behavior | Use Case |
|---|---|---|---|
| **CLASS** | `register(Class)` | Lazy instantiated singleton | Classes that need single instance |
| **INSTANCE** | `registerInstance(key, obj)` | Pre-created singleton | Objects, configs, shared resources |
| **FACTORY** | `registerFactory(key, fn)` | New instance per request | Transient services, per-request instances |

```typescript
class Database { connected = Math.random(); }

// CLASS: Created once, cached
container.register(Database);
const db1 = container.get(Database);
const db2 = container.get(Database);
console.log(db1 === db2); // true - same cached instance

// INSTANCE: Pre-created singleton
const dbInstance = new Database();
container.registerInstance('db', dbInstance);
const db3 = container.get('db');
console.log(db3 === dbInstance); // true

// FACTORY: New instance each time
container.registerFactory('newDb', () => new Database());
const db4 = container.get('newDb');
const db5 = container.get('newDb');
console.log(db4 === db5); // false - different instances
```

## HasDependencies Interface

Implement the `HasDependencies` interface to enable automatic dependency resolution. Use `container.require()` to retrieve required dependencies with automatic error handling.

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
container.register(Database, new Database());
container.register(Logger, new Logger());
container.register(UserRepository, new UserRepository());
container.register(UserService, new UserService());

// Resolve all dependencies
container.inject();

// Use services
const service = container.require(UserService);
service.listUsers();
```

## Usage Examples

### Application Configuration

```typescript
interface Config {
  apiUrl: string;
  timeout: number;
}

const container = new DependencyContainer();

container.register('config', {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} as Config);

const config = container.get<Config>('config');
```

### Async Dependency Injection with HasDependencies

For services that need to perform async initialization and access dependencies:

```typescript
class Database {
  async connect(): Promise<void> {
    console.log('Connecting to database...');
  }
}

class UserRepository implements HasDependencies {
  private db: Database;
  private logger: Logger;

  inject(container: DependencyContainer): void {
    this.db = container.require(Database);
    this.logger = container.require(Logger);
  }

  getUsers() {
    return this.db.query('SELECT * FROM users');
  }
}

// Setup and resolve dependencies
const container = new DependencyContainer();
const db = new Database();
const logger = new Logger();

container.register(Database, db);
container.register(Logger, logger);
container.register(UserRepository, new UserRepository());

// Perform async initialization separately
await db.connect();

// Resolve all registered dependencies
container.inject();

// Now services have access to their dependencies
```

### Injecting Unregistered Instances

You can also inject dependencies into instances not registered in the container:

```typescript
const repository = new UserRepository();
const customService = new CustomService();

// Only these instances get injected, not all registered dependencies
container.inject([repository, customService]);
```

## Contributing & Development

See [contributing.md](docs/contributing/contributing.md) for information on how to develop or contribute to this project!

## License

See [LICENSE.md](LICENSE.md)

