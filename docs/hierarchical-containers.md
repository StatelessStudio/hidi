# Hierarchical Containers

Create parent-child container relationships with automatic fallback and inheritance.

## `extend()`

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

## `setParent(parent)`

Manually set the parent container for a dependency container.

```typescript
const child = new DependencyContainer();
const parent = new DependencyContainer();
child.setParent(parent);
```

This provides a way to establish parent-child relationships after container creation.

## Inheritance by Registration Type

How dependencies are inherited depends on their registration type:

- **CLASS registrations**: Child containers create their own cached instances (fresh singleton)
- **INSTANCE registrations**: Child containers inherit parent's instance as-is
- **FACTORY registrations**: Child containers inherit the factory function and create new instances on each call

## Use Cases

### Environment-Specific Configuration

Use hierarchical containers to manage different configurations for different environments:

```typescript
const root = new DependencyContainer();
root.register('logLevel', 'info');
root.register('timeout', 30000);

const dev = root.extend();
dev.registerInstance('logLevel', 'debug');

const prod = root.extend();
prod.registerInstance('timeout', 60000);
```

### Service Isolation

Create scoped containers for different service areas or request handlers:

```typescript
const globalContainer = new DependencyContainer();
globalContainer.register(Logger);
globalContainer.register(Database);

// Each request gets its own container with shared global dependencies
const requestContainer = globalContainer.extend();
requestContainer.register('requestId', 'req-12345');
```
