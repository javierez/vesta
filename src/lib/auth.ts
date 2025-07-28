import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "~/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql", // SingleStore is MySQL compatible
    // Map our custom table names to BetterAuth expectations
    schema: {
      user: "users",           // Our users table
      session: "sessions",     // Our sessions table  
      account: "auth_accounts", // Our auth_accounts table (OAuth providers)
      verification: "verification_tokens", // Our verification_tokens table
    },
  }),
  
  // Email and Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Start with false for development
    // Optional: Disable auto sign-in after registration
    autoSignIn: true,
  },
  
  // Social Providers Configuration (only enable if credentials are provided)
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // Advanced Google configuration
        accessType: "offline", // Ensures refresh token
        prompt: "select_account", // Always prompt account selection
      },
    }),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET && {
      apple: {
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
      },
    }),
    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET && {
      linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      },
    }),
  },
  
  // User schema mapping - Users authenticate and belong to accounts
  user: {
    fields: {
      name: "firstName", // Map BetterAuth's 'name' to our 'firstName'
      email: "email",    // Direct mapping
    },
    additionalFields: {
      // Key field: Users belong to an account (organization)
      accountId: {
        type: "number", 
        required: true,
        input: false, // Don't allow direct input - set programmatically
      },
      lastName: {
        type: "string",
        required: true,
      },
      // Keep existing user fields
      phone: {
        type: "string",
        required: false,
      },
      timezone: {
        type: "string", 
        required: false,
        defaultValue: "UTC",
      },
      language: {
        type: "string",
        required: false, 
        defaultValue: "en",
      },
    },
  },
  
  // Next.js integration
  plugins: [nextCookies()],
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  
  // Built-in rate limiting
  rateLimit: {
    window: 60, // 1 minute window
    max: 5, // max 5 attempts
  },
});