# Dependency Retrieval

Retrieve dependencies from the container using type-safe methods.

## `get(key)`

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

## `require(key)`

Retrieve a dependency, or throw an error if the dependency is not found in the container hierarchy.

```typescript
try {
  const config = container.require('appConfig');
}
catch (error) {
  console.error('Required dependency not found:', error.message);
}
```

This is useful when you want to ensure a dependency exists and fail fast if it doesn't.

## `has(key)`

Check if a dependency exists in the container or any parent container.

```typescript
if (container.has('logger')) {
  const logger = container.get('logger');
}
```

This allows you to conditionally retrieve dependencies or provide fallback behavior.
