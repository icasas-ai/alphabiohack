"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { AppUser } from "@/lib/auth/app-user";
import { readJsonResponse } from "@/lib/utils/read-json-response";

type AuthUser = {
  id: string;
  email: string;
};

export type User = AuthUser;

interface UserContextType {
  user: AuthUser | null;
  prismaUser: AppUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshAuthState: () => Promise<void>;
  refreshPrismaUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [prismaUser, setPrismaUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuthState = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/app/me", {
        credentials: "include",
      });
      if (!response.ok) {
        setUser(null);
        setPrismaUser(null);
        setError(null);
        return;
      }

      const data = await readJsonResponse<{
        success?: boolean;
        data?: {
          user?: AuthUser | null;
          prismaUser?: AppUser | null;
        };
      }>(response);
      setUser(data?.data?.user ?? null);
      setPrismaUser(data?.data?.prismaUser ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setUser(null);
      setPrismaUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuthState();
  }, []);

  const refreshPrismaUser = async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/auth/app/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await readJsonResponse<{
          success?: boolean;
          data?: {
            prismaUser?: AppUser | null;
          };
        }>(response);
        setPrismaUser(data?.data?.prismaUser ?? null);
      }
    } catch (error) {
      console.error("UserContext: Error refreshing prisma user:", error);
    }
  };

  const value: UserContextType = {
    user,
    prismaUser,
    loading,
    error,
    isAuthenticated: !!user,
    refreshAuthState,
    refreshPrismaUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
