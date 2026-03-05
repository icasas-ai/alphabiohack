import { hasSupabaseAuth } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/client";
import { normalizeEmailInput } from "@/lib/validation/form-fields";

export type AuthMode = "local" | "supabase";

export function getAuthMode(): AuthMode {
  return hasSupabaseAuth ? "supabase" : "local";
}

export function getAuthCapabilities() {
  const mode = getAuthMode();

  return {
    mode,
    supportsPasswordResetByEmail: mode === "supabase",
    supportsSelfRegistration: mode === "supabase",
    usesLocalPasswords: mode === "local",
  };
}

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
  const normalizedEmail = normalizeEmailInput(email);

  if (!hasSupabaseAuth) {
    const response = await fetch("/api/auth/local/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Login failed");
    }

    return response.json() as Promise<{
      user: { id: string; email: string } | null;
      role?: string[];
      mustChangePassword?: boolean;
    }>;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) throw error;
    return {
      user: user
        ? {
            id: user.id,
            email: user.email ?? normalizedEmail,
          }
        : null,
    };
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (email: string, password: string) => {
  const normalizedEmail = normalizeEmailInput(email);

  if (!hasSupabaseAuth) {
    const response = await fetch("/api/auth/local/register", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: normalizedEmail, password }),
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
      email: normalizedEmail,
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
            email: data.user.email ?? normalizedEmail,
          }
        : null,
    };
  } catch (error) {
    throw error;
  }
};

export const requestPasswordReset = async (email: string) => {
  const normalizedEmail = normalizeEmailInput(email);

  if (!hasSupabaseAuth) {
    return {
      supported: false as const,
      reason: "local_auth_no_email_reset",
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  });

  if (error) {
    throw error;
  }

  return {
    supported: true as const,
  };
};

export const updateUserPassword = async (password: string) => {
  if (!hasSupabaseAuth) {
    const response = await fetch("/api/auth/local/update-password", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Unable to update password");
    }

    return data as {
      user?: { id: string; email: string; role?: string[] } | null;
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw error;
  }

  return { user: null };
};
