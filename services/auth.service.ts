import {
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";

export type AuthMode = "app";

export function getAuthCapabilities() {
  return {
    mode: "app" as const,
    supportsPasswordResetByEmail: true,
    supportsSelfRegistration: true,
    usesAppPasswords: true,
    passwordResetMethod: "temporary_password" as const,
  };
}

export const getUserStore = async () => {
  const response = await fetch("/api/auth/app/me", {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user ?? null;
};

export const logoutUser = async () => {
  await fetch("/api/auth/app/logout", {
    method: "POST",
    credentials: "include",
  });
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = normalizeEmailInput(email);

  const response = await fetch("/api/auth/app/login", {
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
};

export const registerUser = async (
  email: string,
  password: string,
  {
    firstname,
    lastname,
    phone,
  }: {
    firstname?: string
    lastname?: string
    phone?: string
  } = {},
) => {
  const normalizedEmail = normalizeEmailInput(email);
  const normalizedFirstname = normalizeWhitespace(firstname ?? "");
  const normalizedLastname = normalizeWhitespace(lastname ?? "");
  const normalizedPhone = normalizePhoneInput(phone ?? "");

  const response = await fetch("/api/auth/app/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: normalizedEmail,
      password,
      firstname: normalizedFirstname || undefined,
      lastname: normalizedLastname || undefined,
      phone: normalizedPhone || undefined,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Registration failed");
  }

  return response.json();
};

export const requestPasswordReset = async (email: string) => {
  const normalizedEmail = normalizeEmailInput(email);

  const response = await fetch("/api/auth/app/forgot-password", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: normalizedEmail }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Unable to send the password reset email");
  }

  return {
    supported: true as const,
    method: "temporary_password" as const,
  };
};

export const updateUserPassword = async (password: string) => {
  const response = await fetch("/api/auth/app/update-password", {
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
};
