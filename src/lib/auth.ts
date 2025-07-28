import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "~/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql", // SingleStore is MySQL compatible
    // Optional: Map existing schema if table names differ
    schema: {
      user: "users", // Map to existing users table
    },
  }),
  
  // Email and Password Authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Start with false for development
    // Optional: Disable auto sign-in after registration
    autoSignIn: true,
  },
  
  // Social Providers Configuration
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Advanced Google configuration
      accessType: "offline", // Ensures refresh token
      prompt: "select_account", // Always prompt account selection
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    },
  },
  
  // User schema mapping to existing structure
  user: {
    fields: {
      name: "firstName", // Map to existing schema
      email: "email",
    },
    additionalFields: {
      accountId: {
        type: "number",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
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