# Registration Methods

Register dependencies using various methods depending on your instantiation and caching needs.

## `register(key, implementation?)`

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

## `registerInstance(key, instance)`

Explicitly register a pre-instantiated singleton dependency.

```typescript
const logger = new Logger();
container.registerInstance(Logger, logger);
container.registerInstance('config', { timeout: 5000 });
```

## `registerFactory(key, factory)`

Register a factory function that creates a new instance each time the dependency is retrieved (transient pattern).

```typescript
// Returns a new Service instance on every call
container.registerFactory(Service, () => new Service());

// Factory can access other dependencies
container.registerFactory('timestamp', () => Date.now());
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

## Key Registration Patterns

### String Keys
Use simple string keys for primitives and configuration values:

```typescript
container.register('apiUrl', 'https://api.example.com');
container.register('timeout', 5000);
```

### Class Constructors
Use class constructors as keys for type-safe retrieval:

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
