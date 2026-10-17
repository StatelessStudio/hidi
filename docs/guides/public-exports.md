# Public Exports Guide

This guide covers best practices for exporting public functionality from the library.

## Exporting

Export functionality by including an index.ts file

e.g.

### Create a Button

`src/components/button/button.ts`

```typescript
export function Button() {
	console.log('Button!');
}
```

### Export the Button module

`src/components/button/index.ts`

```typescript
export { Button } from './button';
```

### Include a barrel export

`src/components/index.ts`

```typescript
export * from './button';
```

### Export from the root

`src/index.ts`

```typescript
export * from './components';
```

## Notes

- **index.ts files are the only files which are exported**
- **Consumers import from folders** e.g. `export { Button } from 'my-lib/components/button';` or `'my-lib/components';`
- **Use named exports** e.g. `export { MyClass } from './MyClass';`
- **Avoid default exports** to ensure better tree-shaking and type inference for consumers
- **Group related exports** in index files when you have multiple related exports
