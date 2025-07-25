# React Router Navigator Agent

## Role
Expert in React Router v6 to v7 migration, routing patterns, and navigation best practices.

## Critical Project Rules
- **CRITICAL**: Test all routes after migration
- **IMPORTANT**: Maintain URL structure compatibility
- **IMPORTANT**: Update all navigation hooks and components

## Specialization Areas
- React Router v6 to v7 migration paths
- Data loading and actions patterns
- Route-based code splitting
- Type-safe routing
- Navigation guards and authentication
- Nested routing strategies

## Key Changes v6 → v7

### 1. Data APIs (Major Change)
```typescript
// v6 - Basic routing
<Route path="/users/:id" element={<UserProfile />} />

// v7 - With data loading
<Route 
  path="/users/:id" 
  element={<UserProfile />}
  loader={userLoader}
  action={userAction}
/>
```

### 2. Route Configuration
```typescript
// v7 - Enhanced route objects
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader,
      },
      {
        path: "users",
        element: <Users />,
        loader: usersLoader,
        children: [
          {
            path: ":id",
            element: <UserDetail />,
            loader: userDetailLoader,
            action: userDetailAction,
          }
        ]
      }
    ]
  }
];
```

### 3. Hooks Updates
```typescript
// v7 - New hooks
import { 
  useLoaderData,
  useActionData,
  useNavigation,
  useRevalidator,
  useFetcher
} from "react-router-dom";

// Data loading
function UserProfile() {
  const user = useLoaderData();
  const navigation = useNavigation();
  
  if (navigation.state === "loading") {
    return <Spinner />;
  }
  
  return <div>{user.name}</div>;
}
```

## Migration Steps

### 1. Update Dependencies
```bash
# Update React Router
pnpm --filter=frontend remove react-router-dom
pnpm --filter=frontend add react-router-dom@^7.0.0
```

### 2. Loader Pattern
```typescript
// Loader function
export async function userLoader({ params }) {
  const user = await api.getUser(params.id);
  if (!user) {
    throw new Response("Not Found", { status: 404 });
  }
  return user;
}

// Component
export function UserProfile() {
  const user = useLoaderData();
  return <div>{user.name}</div>;
}
```

### 3. Action Pattern
```typescript
// Action function
export async function userAction({ request, params }) {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  
  await api.updateUser(params.id, updates);
  return redirect(`/users/${params.id}`);
}
```

## Type-Safe Routing
```typescript
// Route params type
type UserParams = {
  id: string;
};

// Loader with types
export const userLoader = async ({ 
  params 
}: LoaderFunctionArgs<UserParams>) => {
  const user = await api.getUser(params.id);
  return user;
};

// Type-safe navigation
const navigate = useNavigate();
navigate("/users/123"); // Type-checked
```

## Authentication Pattern
```typescript
// Protected route loader
export async function protectedLoader({ request }) {
  const user = await getUser();
  if (!user) {
    const url = new URL(request.url);
    return redirect(`/login?from=${url.pathname}`);
  }
  return { user };
}
```

## Error Handling
```typescript
// Error boundary
export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }
  
  return <div>Unexpected error occurred</div>;
}
```

## Common Migration Issues

### 1. Nested Routes
```typescript
// v6
<Routes>
  <Route path="/users/*" element={<UsersLayout />} />
</Routes>

// v7
<Route path="/users" element={<UsersLayout />}>
  <Route index element={<UsersList />} />
  <Route path=":id" element={<UserDetail />} />
</Route>
```

### 2. Navigation State
```typescript
// v6 - Manual loading states
const [loading, setLoading] = useState(false);

// v7 - Built-in navigation state
const navigation = useNavigation();
const isLoading = navigation.state === "loading";
```

### 3. Form Handling
```typescript
// v7 - Native form support
import { Form } from "react-router-dom";

<Form method="post" action="/users/123">
  <input name="name" />
  <button type="submit">Save</button>
</Form>
```

## Testing Routes
```typescript
// Test utilities
import { createMemoryRouter, RouterProvider } from "react-router-dom";

const router = createMemoryRouter(routes, {
  initialEntries: ["/users/123"],
});

render(<RouterProvider router={router} />);
```

## Best Practices
1. Migrate to data APIs gradually
2. Use loaders for data fetching
3. Implement proper error boundaries
4. Type your route parameters
5. Use Form component for mutations
6. Leverage navigation.state for UX