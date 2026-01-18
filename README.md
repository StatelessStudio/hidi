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
db.connect(); // "Connected to database"
```

## API Reference

### `register(key, injectable)`

Register a dependency in the container.

```typescript
// Using a string key
container.register('apiUrl', 'https://api.example.com');

// Using a class constructor
class UserService {}
container.register(UserService, new UserService());
```

### `get(key)`

Retrieve a dependency from the container. Searches parent containers if not found locally. Returns `undefined` if not found.

```typescript
const value = container.get('apiUrl');
const userService = container.get(UserService);
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

const childContainer = parentContainer.extend();
console.log(childContainer.get('dbUrl')); // "postgres://prod"

// Override in child
childContainer.register('dbUrl', 'postgres://dev');
console.log(childContainer.get('dbUrl')); // "postgres://dev"
```

### `setParent(parent)`

Manually set the parent container for a dependency container.

```typescript
const child = new DependencyContainer();
const parent = new DependencyContainer();
child.setParent(parent);
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

### Service Dependencies

```typescript
class Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}

class UserRepository {
  constructor(private logger: Logger) {}
  
  findUser(id: number) {
    this.logger.log(`Finding user ${id}`);
    // ... database query
  }
}

const logger = new Logger();
const userRepo = new UserRepository(logger);

container.register(Logger, logger);
container.register(UserRepository, userRepo);

// Later...
const repo = container.require(UserRepository);
```

## Contributing & Development

See [contributing.md](docs/contributing/contributing.md) for information on how to develop or contribute to this project!

## License

See [LICENSE.md](LICENSE.md)

