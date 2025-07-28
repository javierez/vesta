# Better Auth Authentication Workflow Tutorial

## Overview

This tutorial explains how Better Auth works in practice for Vesta CRM - the complete authentication workflow from setup to user interaction. We'll cover which files handle what, how pages interact, and the step-by-step process users experience when authenticating.

**Key Architecture**: Users authenticate (have passwords), not accounts. Users belong to accounts (organizations/companies), and all data is filtered by the user's accountId.

## Authentication Architecture

Better Auth in Vesta CRM follows a user→account architecture:

- **Server Configuration** (`lib/auth.ts`) - Defines auth methods, providers, and user-account relationship
- **Client Configuration** (`lib/auth-client.ts`) - Provides React hooks and client methods
- **Custom Signup Route** (`api/auth/signup/route.ts`) - Creates account first, then user
- **API Routes** (`api/auth/[...all]/route.ts`) - Handles all other auth requests
- **Database Layer** - Users authenticate, belong to accounts (organizations)
- **Data Access Layer** (`lib/dal.ts`) - Ensures all data is filtered by user's accountId
- **UI Components** - Login, signup with company info, and profile pages

## Complete Authentication Workflow

### Step 1: Project Setup and File Structure

```
vesta-crm/
├── lib/
│   ├── auth.ts              # Server-side auth configuration with user→account mapping
│   ├── auth-client.tsx      # Client-side auth methods
│   └── dal.ts               # Data Access Layer for account filtering
├── app/
│   ├── api/auth/
│   │   ├── [...all]/        # BetterAuth API routes
│   │   └── signup/          # Custom signup (creates account + user)
│   ├── auth/signin/         # Login page
│   ├── auth/signup/         # Signup page with company info
│   ├── dashboard/           # Protected dashboard
│   └── layout.tsx           # Root layout with AuthProvider
├── components/
│   ├── providers/
│   │   └── auth-provider.tsx # Session provider with user→account logic
│   ├── auth/
│   │   ├── signin-form.tsx   # Login form component
│   │   ├── signup-form.tsx   # Signup form with company field
│   │   └── user-profile.tsx  # User profile display
│   └── ui/                   # UI components
├── server/
│   ├── db/schema.ts         # Database schema with users→accounts relationship
│   └── queries/             # Query files using getCurrentUserAccountId()
├── middleware.ts            # Route protection middleware
└── .env.local               # Environment variables
```

### Step 2: Core Configuration Files

#### Server Configuration (`lib/auth.ts`)
This file defines what authentication methods your app supports:

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db'; // Your database instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql", // SingleStore (MySQL-compatible)
    schema: {
      user: "users", // Maps to existing users table
      session: "sessions",
      account: "authAccounts", // OAuth accounts (renamed for clarity)
    },
  }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  
  // OAuth providers are optional
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    }),
    // Apple and LinkedIn can be added similarly
  },
  
  // User schema mapping for user→account architecture
  user: {
    fields: {
      email: "email",
      name: "firstName", // Maps BetterAuth 'name' to our 'firstName'
    },
    additionalFields: {
      accountId: { type: "number", required: true }, // Link to organization
      lastName: { type: "string", required: true },
      phone: { type: "string", required: false },
      timezone: { type: "string", required: false },
      language: { type: "string", required: false },
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  
  rateLimit: {
    window: 60, // 1 minute
    max: 5, // 5 attempts per minute
  },
});
```

#### Client Configuration (`lib/auth-client.ts`)
This provides React hooks and methods for your components:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Note: signUp is handled by custom /api/auth/signup endpoint
export const {
  signIn,
  signOut,
  useSession,
  getSession,
} = authClient;

// Custom signup function that creates account + user
export const signUp = {
  async email(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
  }) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    
    return response.json();
  },
};
```

#### API Routes

**Main Auth Routes (`app/api/auth/[...all]/route.ts`)**:
```typescript
import { auth } from "~/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

**Custom Signup Route (`app/api/auth/signup/route.ts`)**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { accounts } from '~/server/db/schema';
import { auth } from '~/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // 1. Create the account (organization) first
  const [newAccount] = await db
    .insert(accounts)
    .values({
      name: body.companyName.trim(),
      email: body.email.toLowerCase(),
    })
    .$returningId();

  // 2. Create user with BetterAuth, linked to account
  const authResult = await auth.api.signUpEmail({
    body: {
      email: body.email.toLowerCase(),
      password: body.password,
      name: body.firstName.trim(),
      lastName: body.lastName.trim(),
      accountId: Number(newAccount.accountId),
    },
  });

  return NextResponse.json({ success: true });
}
```

### Step 3: User Authentication Flow

## The Complete User Journey

### A. New User Registration Workflow

#### 1. User visits `/signup` page
The signup page renders a form component:

```typescript
// app/signup/page.tsx
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <SignupForm />
        </div>
    );
}
```

#### 2. SignupForm component handles account + user creation
```typescript
// components/auth/signup-form.tsx
'use client';
import { useState } from 'react';
import { signUp } from '~/lib/auth-client'; // Custom signUp with company
import { useRouter } from 'next/navigation';

export default function SignupForm() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Custom signup creates account first, then user
            await signUp.email({
                firstName,
                lastName,
                email,
                password,
                companyName,
            });

            // User successfully created and automatically signed in
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unexpected error');
            console.error('Signup error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignup} className="space-y-4">
            <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {error && (
                <div className="text-red-600 text-sm">{error}</div>
            )}
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
        </form>
    );
}
```

#### 3. What happens when user clicks "Create Account" (User→Account Architecture):
1. Form data is sent to custom `signUp.email()` function
2. Request goes to `/api/auth/signup` endpoint (custom, not BetterAuth)
3. **Step 1**: Account (organization) record is created first
4. **Step 2**: BetterAuth creates user record linked to account via `accountId`
5. BetterAuth validates password and handles hashing
6. Session cookie is set automatically by BetterAuth
7. User is redirected to `/dashboard` with active session

**Key Point**: The signup flow creates both an account (organization) and a user, establishing the user→account relationship from the start.

### B. Existing User Login Workflow

#### 1. User visits `/login` page
```typescript
// app/login/page.tsx
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoginForm />
        </div>
    );
}
```

#### 2. LoginForm component handles authentication
```typescript
// components/auth/signin-form.tsx
'use client';
import { useState } from 'react';
import { signIn } from '~/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await signIn.email({
                email,
                password,
                callbackURL: "/dashboard"
            });

            if (error) {
                console.error('Login failed:', error.message);
                return;
            }

            // User successfully authenticated
            router.push('/dashboard');
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signIn.social({
                provider: "google",
                callbackURL: "/dashboard"
            });
        } catch (error) {
            console.error('Google login failed:', error);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleEmailLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            
            <div className="text-center">
                <p>or</p>
                <button 
                    onClick={handleGoogleLogin}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
                >
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
```

#### 3. What happens during login:
- **Email/Password Login**: Credentials validated against database
- **Google Login**: User redirected to Google OAuth, then back to callback URL
- Session cookie is set on successful authentication
- User is redirected to dashboard or intended page

### C. Protected Pages and Session Management

#### 1. Dashboard (Protected Route)
```typescript
// app/dashboard/page.tsx
import { headers } from 'next/headers';
import { auth } from '~/lib/auth';
import { redirect } from 'next/navigation';
import UserProfile from '~/components/auth/user-profile';

export default async function DashboardPage() {
    // Server-side session check with user→account validation
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // Ensure user has valid session AND belongs to an account
    if (!session || !session.user.accountId) {
        redirect('/auth/signin');
    }

    return (
        <div className="p-8">
            <h1>Welcome to your Dashboard</h1>
            <p>Organization: {session.user.accountId}</p>
            <UserProfile user={session.user} />
        </div>
    );
}
```

#### 2. Client-side Session Management with Account Context
```typescript
// components/auth/user-profile.tsx
'use client';
import { useSession, signOut } from '~/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
    const { data: session, isPending, error } = useSession();
    const router = useRouter();

    if (isPending) return <div>Loading...</div>;
    if (error) return <div>Error loading session</div>;
    if (!session) return <div>Not authenticated</div>;

    // Validate user has account context
    if (!session.user.accountId) {
        return <div>Invalid session - missing account</div>;
    }

    const handleSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/');
                }
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-600">
                        {session.user.firstName?.[0]}{session.user.lastName?.[0]}
                    </span>
                </div>
                <div>
                    <h2 className="text-xl font-semibold">
                        {session.user.firstName} {session.user.lastName}
                    </h2>
                    <p className="text-gray-600">{session.user.email}</p>
                    <p className="text-sm text-gray-500">
                        Account ID: {session.user.accountId}
                    </p>
                </div>
            </div>
            <button 
                onClick={handleSignOut}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Sign Out
            </button>
        </div>
    );
}
```

#### 3. App Layout with Session Provider
```typescript
// app/layout.tsx
import { ReactNode } from 'react';

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html>
            <body>
                {/* Better Auth automatically handles session management */}
                {children}
            </body>
        </html>
    );
}
```

### Step 4: Database Schema and Setup

#### 1. Install Dependencies
```bash
npm install drizzle-orm @better-auth/cli drizzle-kit
```

#### 2. Generate Better Auth Schema
```bash
# Generate the auth schema files (for Vesta CRM)
npx @better-auth/cli@latest generate

# This creates database tables for:
# - users (id, email, firstName, lastName, accountId, password, createdAt, updatedAt)
# - sessions (id, userId, expiresAt, token, ipAddress, userAgent)
# - authAccounts (id, userId, provider, providerUserId, accessToken, refreshToken)
# - accounts (accountId, name, email, createdAt, updatedAt) - Organizations
```

#### 3. Apply Database Migrations
```bash
# Generate migration files
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate
```

### Step 5: Environment Configuration

Create `.env.local`:
```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000

# Database (Vesta uses SingleStore)
DATABASE_URL=your_singlestore_connection_string

# Auth Secret (32+ characters)
BETTER_AUTH_SECRET=your_super_secret_random_string_32_chars_min

# OAuth Providers (all optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

## Authentication Flow Diagram

```
Vesta CRM User Journey Flow (User→Account Architecture):

1. User visits app
   ↓
2. Check session (useSession hook)
   ↓
3. If no session → redirect to /auth/signin
   ↓
4. NEW USER: User fills signup form (includes company info)
   ↓
5. POST to /api/auth/signup (custom endpoint)
   ↓
6. Create account (organization) record first
   ↓
7. Create user with BetterAuth, linked to account
   ↓
8. EXISTING USER: User fills login form
   ↓
9. Form submits to authClient.signIn.email()
   ↓
10. Request sent to /api/auth/signin (BetterAuth)
    ↓
11. Better Auth validates credentials + account link
    ↓
12. If valid → create session cookie with accountId
    ↓
13. Redirect to /dashboard
    ↓
14. Dashboard checks session + accountId server-side
    ↓
15. All data queries filtered by user's accountId
    ↓
16. User sees only their organization's data
    ↓
17. User can sign out → clear session → redirect to home
```

## Page Responsibilities

| Page/Component | Purpose | Session Check | Redirects |
|---------------|---------|---------------|-----------|
| `/auth/signin` | User authentication | No session required | After login → `/dashboard` |
| `/auth/signup` | User + account registration | No session required | After signup → `/dashboard` |
| `/` (landing) | Public landing page | None | None |
| `/dashboard` | Protected user area | Server-side check + accountId | No session → `/auth/signin` |
| `UserProfile` | Display user + account info | Client-side hook | None |
| `SigninForm` | Handle login logic | None | Success → `/dashboard` |
| `SignupForm` | Handle account + user creation | None | Success → `/dashboard` |
| `AuthProvider` | Session context with accountId | Client-side provider | Auto redirects |

## API Endpoints (Handled by Better Auth)

All these endpoints are automatically created by Better Auth:

- `POST /api/auth/signin` - Email/password login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/session` - Get current session
- `GET /api/auth/callback/google` - Google OAuth callback
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/verify-email` - Email verification

## Error Handling and Edge Cases

### Common Authentication Scenarios

#### 1. Invalid Credentials
```typescript
// In LoginForm.tsx
const { data, error } = await signIn.email({ email, password });

if (error) {
    switch (error.message) {
        case 'Invalid credentials':
            setErrorMessage('Email or password is incorrect');
            break;
        case 'User not found':
            setErrorMessage('No account found with this email');
            break;
        case 'Too many requests':
            setErrorMessage('Too many login attempts. Please try again later');
            break;
        default:
            setErrorMessage('Login failed. Please try again');
    }
}
```

#### 2. Session Expiration Handling
```typescript
// Middleware to check session on protected routes
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    });

    // Check if accessing protected route
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/profile/:path*']
};
```

#### 3. Loading States and UX
```typescript
// Enhanced UserProfile with better UX
export default function UserProfile() {
    const { data: session, isPending, error } = useSession();

    if (isPending) {
        return (
            <div className="animate-pulse">
                <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-32 mt-2"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600">
                Session error. Please <a href="/login">sign in again</a>.
            </div>
        );
    }

    // ... rest of component
}
```

## Security Best Practices

### 1. Environment Variables
- Never commit secrets to version control
- Use different secrets for different environments
- Rotate secrets regularly

### 2. HTTPS in Production
- Always use HTTPS in production
- Configure secure cookie settings
- Set proper CORS policies

### 3. Rate Limiting
```typescript
// In lib/auth.ts
export const auth = betterAuth({
    rateLimit: {
        window: 60, // 1 minute window
        max: 5, // Max 5 attempts per window
    },
    // ... other config
});
```

## Testing Authentication

### 1. Unit Tests for Auth Components
```typescript
// __tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '@/components/auth/LoginForm';

jest.mock('@/lib/auth-client', () => ({
    signIn: {
        email: jest.fn()
    }
}));

test('handles login form submission', async () => {
    const mockSignIn = require('@/lib/auth-client').signIn.email;
    mockSignIn.mockResolvedValue({ data: { user: {} }, error: null });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
            callbackURL: '/dashboard'
        });
    });
});
```

### 2. Integration Tests
```typescript
// __tests__/auth-flow.test.tsx
import { render, screen } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';

// Mock the auth session
jest.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: jest.fn().mockResolvedValue({
                user: { id: '1', email: 'test@example.com', name: 'Test User' }
            })
        }
    }
}));

test('dashboard shows user content when authenticated', async () => {
    render(await Dashboard());
    expect(screen.getByText('Welcome to your Dashboard')).toBeInTheDocument();
});
```

## Quick Start Checklist

To implement Better Auth in your project, follow this checklist:

### ✅ Setup Phase
- [ ] Install Better Auth packages: `npm install better-auth better-auth/react`
- [ ] Create `lib/auth.ts` with server configuration
- [ ] Create `lib/auth-client.ts` with client configuration  
- [ ] Create API route at `app/api/auth/[...all]/route.ts`
- [ ] Set up environment variables in `.env.local`

### ✅ Database Phase
- [ ] Install database packages: `npm install drizzle-orm @better-auth/cli drizzle-kit`
- [ ] Generate schema: `npx @better-auth/cli@latest generate`
- [ ] Create and apply migrations: `npx drizzle-kit generate && npx drizzle-kit migrate`

### ✅ UI Phase
- [ ] Create login page at `app/login/page.tsx`
- [ ] Create signup page at `app/signup/page.tsx`  
- [ ] Create LoginForm component
- [ ] Create SignupForm component
- [ ] Create protected dashboard page
- [ ] Add UserProfile component with sign out

### ✅ Testing Phase
- [ ] Test email/password authentication
- [ ] Test social provider authentication (if configured)
- [ ] Test protected route access
- [ ] Test session persistence across page refreshes
- [ ] Test sign out functionality

## Summary

Better Auth in Vesta CRM provides a complete user→account authentication workflow that handles:

1. **Account + User Registration**: Secure organization and user creation in one flow
2. **User Authentication**: Users login (not accounts), with account context maintained
3. **Multi-Tenant Security**: All data automatically filtered by user's accountId
4. **Session Management**: HTTP-only cookies with account-level session context
5. **Protected Routes**: Server and client-side validation with account verification
6. **Data Access Layer**: Automatic account filtering for all database queries
7. **User Interface**: React hooks with account-aware session management
8. **Database Integration**: Custom schema with user→account relationships
9. **Security**: Built-in rate limiting, HTTPS, and multi-tenant data isolation

**Key Architecture Advantage**: The user→account model ensures that:
- Users authenticate and manage passwords
- Users belong to accounts (organizations/companies)
- All data is automatically isolated by account
- Multi-tenant security is enforced at every level
- Organizations can have multiple users while maintaining data privacy

This approach provides enterprise-level multi-tenancy while keeping the authentication flow simple and secure.

## Further Resources

- [Official Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth GitHub Repository](https://github.com/better-auth/better-auth)
- [Community Examples and Plugins](https://www.better-auth.com/docs/plugins)