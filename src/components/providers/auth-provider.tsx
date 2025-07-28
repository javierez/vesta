"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession as useBetterAuthSession } from "~/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  accountId: number; // Required: User must belong to an account/organization
  phone?: string;
  timezone?: string;
  language?: string;
  image?: string;
  emailVerified?: boolean;
}

export interface Session {
  user: User;
  session: {
    id: string;
    expiresAt: Date;
  };
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: betterAuthSession, isPending } = useBetterAuthSession();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
  ];

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false);
      
      // Redirect logic for protected routes
      if (!betterAuthSession && !isPublicPath) {
        router.push('/auth/signin');
      }
    }
  }, [betterAuthSession, isPending, isPublicPath, router]);

  const session: Session | null = betterAuthSession && betterAuthSession.user.accountId ? {
    user: {
      id: betterAuthSession.user.id,
      email: betterAuthSession.user.email,
      firstName: betterAuthSession.user.name, // BetterAuth uses 'name' field
      lastName: betterAuthSession.user.lastName || '',
      name: betterAuthSession.user.name,
      accountId: betterAuthSession.user.accountId, // Required for valid session
      phone: betterAuthSession.user.phone || undefined,
      timezone: betterAuthSession.user.timezone || undefined,
      language: betterAuthSession.user.language || undefined,
      image: betterAuthSession.user.image || undefined,
      emailVerified: betterAuthSession.user.emailVerified,
    },
    session: {
      id: betterAuthSession.session.id,
      expiresAt: betterAuthSession.session.expiresAt,
    }
  } : null;

  const contextValue: AuthContextType = {
    session,
    user: session?.user || null,
    isLoading: isLoading || isPending,
    isAuthenticated: !!session,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Additional hooks for convenience
export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}