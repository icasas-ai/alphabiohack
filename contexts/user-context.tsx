"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

import { User as PrismaUser } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UserContextType {
  user: User | null;
  prismaUser: PrismaUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshPrismaUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedUserId = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Obtener el usuario actual
    const getUser = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setError(error.message);
          setUser(null);
        } else {
          setUser(user);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
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
          const data = await response.json();
          console.log("UserContext: Prisma user data received:", data);
          setPrismaUser(data.prismaUser);
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
        const data = await response.json();
        console.log("UserContext: Prisma user refreshed:", data);
        setPrismaUser(data.prismaUser);
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

export type { User };
