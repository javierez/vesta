# Better Auth Complete Tutorial

## Overview

Better Auth is a comprehensive TypeScript authentication framework designed to solve authentication challenges in the ecosystem. It's framework-agnostic and provides secure, out-of-the-box authentication capabilities, allowing developers to focus on building applications rather than reinventing authentication mechanisms.

## Key Features

- **Framework Agnostic**: Works with most popular frameworks
- **Secure Authentication**: Email/password, social providers, 2FA
- **Built-in Features**: Rate limiting, session management, automatic database migrations
- **Extensible**: Plugin ecosystem for additional functionality
- **TypeScript First**: Full type safety throughout

## Installation

```bash
npm install better-auth
# For React integration
npm install better-auth/react
```

## Basic Setup

### 1. Server-Side Configuration

Create your auth configuration file (e.g., `lib/auth.ts`):

```typescript
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
        async sendResetPassword(data, request) {
            // Send an email to the user with a link to reset their password
            // Implementation depends on your email service
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        },
        // Add other providers as needed
    },
    // Database configuration (see Database Setup section)
});
```

### 2. Client-Side Configuration

Create the auth client (e.g., `lib/auth-client.ts`):

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;
```

## Authentication Methods

### Email and Password Authentication

#### Sign Up
```typescript
const { data, error } = await authClient.signUp.email({
    email: "user@example.com",
    password: "password123", // min 8 characters by default
    name: "John Doe",
    image: "https://example.com/avatar.jpg", // optional
    callbackURL: "/dashboard" // optional redirect after signup
});
```

#### Sign In
```typescript
const { data, error } = await authClient.signIn.email({
    email: "user@example.com",
    password: "password123",
    callbackURL: "/dashboard", // optional redirect after signin
    rememberMe: true // optional, defaults to true
});
```

### Social Provider Authentication

#### Google Setup
1. Create a project in Google Cloud Console
2. Set up OAuth 2.0 credentials
3. Configure redirect URLs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

```typescript
// Server configuration
export const auth = betterAuth({
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID!, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // Optional: Always ask to select account
            prompt: "select_account"
        }, 
    },
});

// Client usage
const signInWithGoogle = async () => {
    const data = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
    });
};
```

#### Other Social Providers
```typescript
socialProviders: {
    apple: {
        clientId: process.env.APPLE_CLIENT_ID!,
        clientSecret: process.env.APPLE_CLIENT_SECRET!
    },
    linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!
    }
}
```

## Session Management

### Client-Side Session Access
```typescript
import { useSession } from './lib/auth-client';

function ProfileComponent() {
    const { data: session, isPending, error } = useSession();
    
    if (isPending) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!session) return <div>Not authenticated</div>;
    
    return (
        <div>
            <h1>Welcome, {session.user.name}!</h1>
            <p>Email: {session.user.email}</p>
        </div>
    );
}
```

### Server-Side Session Access
```typescript
import { headers } from 'next/headers';
import { auth } from './lib/auth';

export async function getServerSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    return session;
}
```

## Sign Out

```typescript
const handleSignOut = async () => {
    await authClient.signOut({
        fetchOptions: {
            onSuccess: () => {
                // Redirect after successful sign out
                router.push("/login");
            }
        }
    });
};
```

## Database Setup with Drizzle

### 1. Install Dependencies
```bash
npm install drizzle-orm @better-auth/cli
npm install -D drizzle-kit
```

### 2. Configure Database Adapter
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./drizzle-config"; // Your Drizzle instance

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite", // or "pg" for PostgreSQL, "mysql" for MySQL
        usePlural: false, // Set to true if your tables use plural names
    }),
    emailAndPassword: {
        enabled: true,
    },
    // ... other configuration
});
```

### 3. Generate Schema
```bash
# Generate Better Auth schema
npx @better-auth/cli@latest generate

# Generate Drizzle migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=your_database_url

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Apple OAuth (optional)
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret

# LinkedIn OAuth (optional)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Better Auth Secret
BETTER_AUTH_SECRET=your_random_secret_key
```

## Advanced Features

### Rate Limiting
Better Auth includes built-in rate limiting to protect against brute force attacks:

```typescript
export const auth = betterAuth({
    rateLimit: {
        window: 60, // seconds
        max: 10, // maximum attempts per window
    },
    // ... other configuration
});
```

### Two-Factor Authentication
Enable 2FA with the TOTP plugin:

```typescript
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
    plugins: [
        twoFactor({
            issuer: "Your App Name",
        })
    ],
    // ... other configuration
});
```

### Magic Links
Add passwordless authentication with magic links:

```typescript
import { magicLink } from "better-auth/plugins";

export const auth = betterAuth({
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, url }) => {
                // Send magic link email
                await sendEmail(email, url);
            },
        })
    ],
    // ... other configuration
});
```

## Error Handling

```typescript
const handleSignIn = async (email: string, password: string) => {
    try {
        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });
        
        if (error) {
            // Handle authentication errors
            console.error('Sign in failed:', error.message);
            return;
        }
        
        // Handle successful sign in
        console.log('User signed in:', data.user);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
};
```

## Best Practices

1. **Security**
   - Always use HTTPS in production
   - Keep your secrets secure and use environment variables
   - Implement proper CORS policies
   - Use strong, random values for `BETTER_AUTH_SECRET`

2. **Performance**
   - Implement proper caching for session data
   - Use server-side session validation for protected routes
   - Consider implementing session refresh mechanisms

3. **User Experience**
   - Provide clear error messages
   - Implement loading states during authentication
   - Use proper redirects after authentication actions
   - Consider implementing "remember me" functionality

4. **Database**
   - Regularly backup your authentication data
   - Monitor authentication metrics and logs
   - Implement proper database indexing for auth tables

## API Routes (Next.js Example)

Create an API route to handle Better Auth requests:

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export { handler as GET, handler as POST };
```

## TypeScript Types

Better Auth provides full TypeScript support. You can extend the default types:

```typescript
// types/auth.ts
declare module "better-auth" {
    interface User {
        role: "admin" | "user";
        createdAt: Date;
    }
    
    interface Session {
        impersonatedBy?: string;
    }
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your `baseURL` matches your app's URL
2. **Environment Variables**: Double-check all required env vars are set
3. **Database Connection**: Verify database URL and permissions
4. **Social Provider Setup**: Confirm redirect URLs match exactly

### Debug Mode
Enable debug logging:

```typescript
export const auth = betterAuth({
    logger: {
        level: "debug",
    },
    // ... other configuration
});
```

## Migration from Other Auth Libraries

Better Auth provides migration utilities and guides for popular authentication libraries. Check the official documentation for specific migration paths from libraries like NextAuth.js, Supabase Auth, or Firebase Auth.

## Conclusion

Better Auth provides a comprehensive, type-safe authentication solution that reduces boilerplate and focuses on developer experience. With its extensive feature set, including social providers, 2FA, magic links, and automatic database management, it's an excellent choice for TypeScript applications requiring robust authentication.

For more advanced features and detailed API documentation, visit the [official Better Auth documentation](https://www.better-auth.com/docs).