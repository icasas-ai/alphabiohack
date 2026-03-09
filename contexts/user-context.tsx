"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { User as PrismaUser } from "@/lib/prisma-browser";
import { readJsonResponse } from "@/lib/utils/read-json-response";

type AuthUser = {
  id: string;
  email: string;
};

export type User = AuthUser;

interface UserContextType {
  user: AuthUser | null;
  prismaUser: PrismaUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshAuthState: () => Promise<void>;
  refreshPrismaUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
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
        user?: AuthUser | null;
        prismaUser?: PrismaUser | null;
      }>(response);
      setUser(data?.user ?? null);
      setPrismaUser(data?.prismaUser ?? null);
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
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await readJsonResponse<{ prismaUser?: PrismaUser | null }>(response);
        setPrismaUser(data?.prismaUser ?? null);
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
