# State Management & Pub/Sub

Register and subscribe to stateful values in your container, enabling reactive patterns where services can be notified of state changes.

## `registerState(key, initialValue)`

Register a stateful value in the container.

```typescript
import { DependencyContainer, StateValue } from 'hidi';

const container = new DependencyContainer();

// Register state with a string key
container.registerState('counter', 0);

// Register state with a class type as key
class UserState {
  name: string = 'Guest';
  isLoggedIn: boolean = false;
}

const userState: StateValue<UserState> = container.registerState(UserState, {
  name: 'John Doe',
  isLoggedIn: true,
});
```

## `getState(key)`

Retrieve a registered state value. Returns the `StateValue<T>` wrapper that allows you to get/set the value and subscribe to changes.

```typescript
const counterState = container.getState('counter');

// Get current value
console.log(counterState.value); // 0

// Set new value (notifies all subscribers)
counterState.value = 1;
```

## `hasState(key)`

Check if a state exists in the container or any parent container.

```typescript
if (container.hasState('counter')) {
  container.subscribe('counter', (newValue, oldValue) => {
    console.log(`Counter changed: ${oldValue} → ${newValue}`);
  });
}
```

## `subscribe(key, callback)`

Subscribe to state changes. The callback receives the new value and old value.

Returns an **unsubscribe function** that removes the subscription.

```typescript
const counterState = container.registerState('counter', 0);

// Subscribe to changes
const unsubscribe = container.subscribe('counter', (newValue, oldValue) => {
  console.log(`Counter changed: ${oldValue} → ${newValue}`);
});

// Update state (triggers all subscribers)
counterState.value = 1; // Logs: "Counter changed: 0 → 1"
counterState.value = 2; // Logs: "Counter changed: 1 → 2"

// Unsubscribe from further updates
unsubscribe();

counterState.value = 3; // No log (unsubscribed)
```

## `subscribeMany(keys, callback)`

Subscribe to multiple state changes with a single callback. The callback receives all current state values as arguments in the order the keys were provided.

Returns an **unsubscribe function** that removes all subscriptions.

This is useful for dependent state where you need to react to changes in multiple states:

```typescript
container.registerState('username', 'Alice');
container.registerState('isOnline', false);
container.registerState('messageCount', 0);

// Subscribe to all three states with one callback
const unsubscribe = container.subscribeMany(
  ['username', 'isOnline', 'messageCount'],
  (username, isOnline, messageCount) => {
    console.log(`${username} is ${isOnline ? 'online' : 'offline'} with ${messageCount} messages`);
  }
);

// Update states - callback fires each time any state changes
container.getState('username').value = 'Bob';
// Logs: "Bob is offline with 0 messages"

container.getState('isOnline').value = true;
// Logs: "Bob is online with 0 messages"

container.getState('messageCount').value = 5;
// Logs: "Bob is online with 5 messages"

// Unsubscribe from all states
unsubscribe();

container.getState('username').value = 'Charlie';
// No log (all listeners removed)
```

## StateValue Reactive Wrapper

`StateValue<T>` is a reactive wrapper around values that enables subscriptions:

```typescript
class AppState {
  isLoading: boolean = false;
  error: string | null = null;
}

const appState = container.registerState(AppState, {
  isLoading: false,
  error: null,
});

// Subscribe directly to StateValue instance
appState.subscribe((newState, oldState) => {
  console.log('App state changed:', newState);
});

// Update via setter
appState.value = {
  isLoading: true,
  error: null,
};
```

### Immutable Updates with `update()`

For complex state objects, use the `update()` method to apply immutable transformations:

```typescript
const counterState = container.registerState('counter', 0);

// Update simple values
counterState.update((current) => current + 1);

// Update objects immutably
class UserState {
  name: string;
  age: number;
}

const userState = container.registerState(UserState, {
  name: 'John',
  age: 30,
});

// Create new object with updated fields
userState.update((current) => ({
  ...current,
  age: current.age + 1,
}));

// Update array state immutably
const itemsState = container.registerState('items', ['a', 'b']);

itemsState.update((current) => [...current, 'c']);
```

The `update()` method prevents accidental mutations and enforces immutable patterns. The updater function receives the current value and returns the new value, which is then set via the normal setter (notifying all subscribers).

## State in Hierarchical Containers

Each container maintains its own independent state registrations. Child containers can inherit parent state, but registering new state or overriding state is independent.

```typescript
const root = new DependencyContainer();
root.registerState('apiUrl', 'https://api.prod.com');

// Production tier inherits root state
const prod = root.extend();
console.log(prod.getState('apiUrl').value); // "https://api.prod.com"

// Development tier creates independent state with same key
const dev = root.extend();
dev.registerState('apiUrl', 'http://localhost:3000');

// Changes are independent
const devApiState = dev.getState('apiUrl');
devApiState.value = 'http://localhost:5000';

console.log(root.getState('apiUrl').value); // Still "https://api.prod.com" (unchanged)
console.log(dev.getState('apiUrl').value); // "http://localhost:5000"
```

**State inheritance behavior by registration type:**
- **Registering new state**: Each container has independent state (not inherited)
- **Overriding state**: Child registrations override parent for that key
- **Parent state access**: Children can access parent state if not overridden locally
- **Change notifications**: Subscribers are notified within their container scope

## Practical Example: React to State Changes

Create services that respond to state changes:

```typescript
class CartState {
  items: string[] = [];
  total: number = 0;
}

class NotificationService implements HasDependencies {
  private unsubscribe?: () => void;

  inject(container: DependencyContainer): void {
    // Subscribe to cart state changes
    this.unsubscribe = container.subscribe(CartState, (newCart, oldCart) => {
      if (newCart.items.length > oldCart.items.length) {
        console.log('Item added to cart');
      }
      if (newCart.total > oldCart.total) {
        console.log(`New total: $${newCart.total}`);
      }
    });
  }

  cleanup(): void {
    this.unsubscribe?.();
  }
}

// Setup and use
const container = new DependencyContainer();
container.registerState(CartState, { items: [], total: 0 });
container.register(NotificationService);
container.inject();

const cartState = container.getState(CartState);
cartState.value = {
  items: ['book', 'pen'],
  total: 15.99,
}; // Triggers notification
```
