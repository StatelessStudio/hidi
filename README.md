# hidi - Hierarchical Dependency Injection for TypeScript

A lightweight, type-safe dependency injection container for TypeScript applications. Simplify dependency management with support for hierarchical containers, explicit key registration, and a minimal API.

Software Development by [Stateless Studio](https://stateless.studio)

## Features

- 🎯 **Type-Safe** - Full TypeScript support with generic types for type-safe dependency retrieval
- 🌳 **Hierarchical Containers** - Support for parent-child container relationships with automatic fallback
- 🔑 **Flexible Key Registration** - Register dependencies using string keys or class constructors
- ⚙️ **Multiple Registration Types** - Register classes, instances, or factory functions with different caching behavior
- 🔔 **Reactivity (Pub/Sub)** - Register stateful values and subscribe to changes with a simple pub/sub API
- 🚀 **Fast & Efficient** - Optimized for performance with minimal overhead and fast lookups
- 🧩 **Minimal API** - Focused set of methods for common dependency injection patterns without unnecessary complexity
- 🔒 **No External Dependencies** - Zero dependencies for maximum compatibility and minimal bundle size
- ⚡ **Lightweight** - Minimal API surface with zero external dependencies
- 🧪 **Well-Tested** - 100% code coverage with comprehensive test suite

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

## Documentation

Comprehensive guides are available for each capability:

### [Registration Methods](docs/registration.md)

Register dependencies using `register()`, `registerInstance()`, or `registerFactory()`. Each method offers different caching and instantiation behavior for different use cases.

```typescript
// Singleton instance registration
container.registerInstance('apiUrl', 'https://api.example.com');

// Class registration (lazy instantiation, cached)
container.register(UserService);

// Factory registration (new instance per request)
container.registerFactory('timestamp', () => Date.now());
```

→ [Full Registration Guide](docs/registration.md)

### [Dependency Retrieval](docs/retrieval.md)

Retrieve your registered dependencies with `get()`, `require()`, and `has()` methods for safe and reliable access.

```typescript
const config = container.get('apiUrl');
const service = container.require(UserService); // Throws if not found
if (container.has('logger')) {
  const logger = container.get('logger');
}
```

→ [Full Retrieval Guide](docs/retrieval.md)

### [Hierarchical Containers](docs/hierarchical-containers.md)

Create parent-child container relationships with `extend()` and `setParent()`. Child containers inherit and can override parent dependencies.

```typescript
const parentContainer = new DependencyContainer();
parentContainer.register('dbUrl', 'postgres://prod');

const childContainer = parentContainer.extend();
childContainer.registerInstance('dbUrl', 'postgres://dev'); // Override
```

→ [Full Hierarchical Containers Guide](docs/hierarchical-containers.md)

### [Dependency Injection](docs/dependency-injection.md)

Implement the `HasDependencies` interface and use `inject()` to automatically resolve dependencies for your classes.

```typescript
class UserService implements HasDependencies {
  private repository: UserRepository;

  inject(container: DependencyContainer): void {
    this.repository = container.require(UserRepository);
  }
}

container.register(UserService, new UserService());
container.inject(); // Resolve all dependencies
```

→ [Full Dependency Injection Guide](docs/dependency-injection.md)

### [State Management & Pub/Sub](docs/state-management.md)

Register reactive state values and subscribe to changes. Build reactive systems where services are notified of state updates.

```typescript
const counter = container.registerState('counter', 0);

const unsubscribe = container.subscribe('counter', (newValue, oldValue) => {
  console.log(`Counter: ${oldValue} → ${newValue}`);
});

counter.value = 1; // Notifies subscribers
```

→ [Full State Management Guide](docs/state-management.md)

### [Usage Examples](docs/examples.md)

Practical, real-world examples including application configuration, service layers, request scoping, reactive state, and more.

```typescript
// Environment-specific configuration
const dev = rootContainer.extend();
dev.registerInstance('apiUrl', 'http://localhost:3000');

// Request scoping
const requestContainer = globalContainer.extend();
requestContainer.register('requestId', req.id);

// Reactive state management
appState.update((state) => ({
  ...state,
  errors: [...state.errors, 'New error']
}));
```

→ [View All Examples](docs/examples.md)

## API Reference Summary

For a quick reference of all available methods:

| Method | Purpose | Documentation |
|--------|---------|---|
| `register()` | Register singleton dependencies | [Registration Methods](docs/registration.md) |
| `registerInstance()` | Register pre-created instances | [Registration Methods](docs/registration.md) |
| `registerFactory()` | Register factory functions | [Registration Methods](docs/registration.md) |
| `get()` | Retrieve a dependency | [Dependency Retrieval](docs/retrieval.md) |
| `require()` | Retrieve or throw error | [Dependency Retrieval](docs/retrieval.md) |
| `has()` | Check dependency existence | [Dependency Retrieval](docs/retrieval.md) |
| `extend()` | Create child container | [Hierarchical Containers](docs/hierarchical-containers.md) |
| `setParent()` | Set parent container | [Hierarchical Containers](docs/hierarchical-containers.md) |
| `inject()` | Resolve dependencies | [Dependency Injection](docs/dependency-injection.md) |
| `registerState()` | Register reactive state | [State Management](docs/state-management.md) |
| `getState()` | Retrieve state wrapper | [State Management](docs/state-management.md) |
| `subscribe()` | Listen to state changes | [State Management](docs/state-management.md) |
| `subscribeMany()` | Listen to multiple states | [State Management](docs/state-management.md) |

## Contributing & Development

See [contributing.md](docs/contributing/contributing.md) for information on how to develop or contribute to this project!

## License

See [LICENSE.md](LICENSE.md)

