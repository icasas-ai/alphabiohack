import { hasSupabaseAuth } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/client";

export const getUserStore = async () => {
  if (!hasSupabaseAuth) {
    const response = await fetch("/api/auth/local/me", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user ?? null;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data.session?.user ?? null;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  if (!hasSupabaseAuth) {
    await fetch("/api/auth/local/logout", {
      method: "POST",
      credentials: "include",
    });
    return;
  }

  const supabase = createClient();
  await supabase.auth.signOut();
};

export const loginUser = async (email: string, password: string) => {
  if (!hasSupabaseAuth) {
    const response = await fetch("/api/auth/local/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Login failed");
    }

    return response.json();
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return {
      user: user
        ? {
            id: user.id,
            email: user.email ?? email,
          }
        : null,
    };
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (email: string, password: string) => {
  if (!hasSupabaseAuth) {
    const response = await fetch("/api/auth/local/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Registration failed");
    }

    return response.json();
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/protected`,
      },
    });
    if (error) throw error;
    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email ?? email,
          }
        : null,
    };
  } catch (error) {
    throw error;
  }
};
