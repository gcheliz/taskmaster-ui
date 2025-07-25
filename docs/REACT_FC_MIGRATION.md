# React.FC Migration Guide

This guide helps migrate components from `React.FC` to explicit prop typing, following modern React best practices.

## Why Migrate Away from React.FC?

1. **Implicit children**: React.FC automatically includes `children` in props, which isn't always desired
2. **Generic constraints**: Difficulties with generic components
3. **Default props**: Issues with defaultProps handling
4. **Performance**: Slightly larger bundle size
5. **Future compatibility**: React team recommends explicit typing

## Migration Patterns

### Basic Component

#### Before (React.FC)
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return <button onClick={onClick}>{label}</button>;
};
```

#### After (Explicit Typing)
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};
```

### Component with Children

#### Before (React.FC)
```typescript
interface CardProps {
  title: string;
  // children is implicitly included by React.FC
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

#### After (Explicit Typing)
```typescript
interface CardProps {
  title: string;
  children: React.ReactNode; // Explicitly declare children
}

const Card = ({ title, children }: CardProps) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

### Component with Optional Props

#### Before (React.FC)
```typescript
interface AlertProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ 
  message, 
  type = 'info', 
  onClose 
}) => {
  return (
    <div className={`alert alert-${type}`}>
      {message}
      {onClose && <button onClick={onClose}>×</button>}
    </div>
  );
};
```

#### After (Explicit Typing)
```typescript
interface AlertProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
  onClose?: () => void;
}

const Alert = ({ 
  message, 
  type = 'info', 
  onClose 
}: AlertProps) => {
  return (
    <div className={`alert alert-${type}`}>
      {message}
      {onClose && <button onClick={onClose}>×</button>}
    </div>
  );
};
```

### Generic Component

#### Before (React.FC with generics - awkward)
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

// This doesn't work well with React.FC
const List: React.FC<ListProps<any>> = ({ items, renderItem }) => {
  return <ul>{items.map(renderItem)}</ul>;
};
```

#### After (Explicit Typing - cleaner)
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

const List = <T,>({ items, renderItem }: ListProps<T>) => {
  return <ul>{items.map(renderItem)}</ul>;
};
```

### Component with ForwardRef

#### Before (React.FC doesn't work well with forwardRef)
```typescript
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// Awkward with React.FC
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, value, onChange }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
);
```

#### After (Cleaner without React.FC)
```typescript
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, value, onChange }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
);

Input.displayName = 'Input'; // Good practice for debugging
```

## Return Type Annotations

When you need explicit return types:

```typescript
interface UserProfileProps {
  userId: string;
}

// Explicit return type when needed
const UserProfile = ({ userId }: UserProfileProps): JSX.Element => {
  return <div>User ID: {userId}</div>;
};

// Or for conditional rendering
const ConditionalComponent = ({ show }: { show: boolean }): JSX.Element | null => {
  if (!show) return null;
  return <div>Visible</div>;
};
```

## Migration Checklist

1. **Remove React.FC type annotation**
   ```typescript
   // Remove: React.FC<Props>
   // Add: explicit props typing
   ```

2. **Add children to props interface if used**
   ```typescript
   interface Props {
     // ... other props
     children?: React.ReactNode; // Add this if component uses children
   }
   ```

3. **Update function signature**
   ```typescript
   const Component = (props: Props) => { /* ... */ };
   // or with destructuring
   const Component = ({ prop1, prop2 }: Props) => { /* ... */ };
   ```

4. **Handle default props**
   ```typescript
   const Component = ({ prop = 'default' }: Props) => { /* ... */ };
   ```

5. **Test the component** - Ensure TypeScript compilation succeeds

## Automated Migration

Use this regex find/replace in VS Code:

**Find:**
```regex
const\s+(\w+):\s*React\.FC<(.+?)>\s*=\s*\(
```

**Replace:**
```regex
const $1 = (
```

Note: You'll need to manually adjust the props typing after this.

## ESLint Rule

Our ESLint configuration will warn about React.FC usage:

```javascript
'no-restricted-syntax': [
  'error',
  {
    selector: 'TSTypeReference[typeName.name="FC"]',
    message: 'Avoid using React.FC. Use explicit typing for props instead.'
  }
]
```

## Common Issues and Solutions

### Issue: Missing children type
```typescript
// Error: Property 'children' does not exist
const Container = ({ children }: ContainerProps) => <div>{children}</div>;

// Solution: Add children to interface
interface ContainerProps {
  children: React.ReactNode;
}
```

### Issue: Event handler types
```typescript
// Verbose but correct
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};

// Can also extract to interface
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

### Issue: Ref typing
```typescript
// Use forwardRef properly
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <button ref={ref} {...props} />
);
```

## Benefits After Migration

1. ✅ More explicit about children props
2. ✅ Better generic component support
3. ✅ Cleaner code without unnecessary type annotations
4. ✅ Better compatibility with forwardRef and other HOCs
5. ✅ Aligns with React team recommendations

## Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript React Guide](https://www.typescriptlang.org/docs/handbook/react.html)
- [React.FC Discussion](https://github.com/facebook/create-react-app/pull/8177)