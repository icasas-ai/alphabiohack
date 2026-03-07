"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

import { User as PrismaUser } from "@/lib/prisma-browser";
import { hasSupabaseAuth } from "@/lib/auth/config";
import { readJsonResponse } from "@/lib/utils/read-json-response";
import { createClient } from "@/lib/supabase/client";

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
  const fetchedUserId = useRef<string | null>(null);

  const refreshAuthState = async () => {
    try {
      setLoading(true);
      if (hasSupabaseAuth) {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setError(error.message);
          setUser(null);
          setPrismaUser(null);
        } else if (user) {
          setUser({
            id: user.id,
            email: user.email ?? "",
          });
          setError(null);
        } else {
          setUser(null);
          setPrismaUser(null);
          setError(null);
        }
      } else {
        const response = await fetch("/api/auth/local/me", {
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
      }
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

    if (!hasSupabaseAuth) {
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      setUser(
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email ?? "",
            }
          : null,
      );
      setLoading(false);
      setError(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getPrismaUser = async () => {
      if (!user) {
        setPrismaUser(null);
        fetchedUserId.current = null;
        return;
      }

      // Solo hacer la llamada si no hemos obtenido los datos para este usuario
      if (fetchedUserId.current === user.id) {
        return;
      }

      try {
        console.log("UserContext: Fetching prisma user for supabase user:", user.id);
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await readJsonResponse<{ prismaUser?: PrismaUser | null }>(response);
          console.log("UserContext: Prisma user data received:", data);
          setPrismaUser(data?.prismaUser ?? null);
          fetchedUserId.current = user.id;
        } else {
          console.error("UserContext: Failed to fetch prisma user - Status:", response.status);
          setPrismaUser(null);
          fetchedUserId.current = null;
        }
      } catch (error) {
        console.error("UserContext: Error fetching prisma user:", error);
        setPrismaUser(null);
        fetchedUserId.current = null;
      }
    };

    getPrismaUser();
  }, [user]);

  const refreshPrismaUser = async () => {
    if (!user) return;
    
    try {
      console.log("UserContext: Refreshing prisma user data");
      fetchedUserId.current = null; // Resetear para forzar recarga
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await readJsonResponse<{ prismaUser?: PrismaUser | null }>(response);
        console.log("UserContext: Prisma user refreshed:", data);
        setPrismaUser(data?.prismaUser ?? null);
        fetchedUserId.current = user.id;
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
