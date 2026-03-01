import "server-only";

import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { hasSupabaseAuth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

const SESSION_COOKIE = "alphabiohack_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.LOCAL_AUTH_SECRET;
  if (secret) {
    return secret;
  }

  throw new Error(
    "LOCAL_AUTH_SECRET is required when Supabase auth is disabled.",
  );
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function encodeSession(payload: SessionPayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function decodeSession(raw: string): SessionPayload | null {
  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  if (signature.length !== expected.length) {
    return null;
  }
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (!payload.userId || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const derived = scryptSync(password, salt, 64).toString("hex");
  if (hash.length !== derived.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(hash), Buffer.from(derived));
}

export async function createLocalSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession({
    userId,
    exp: Date.now() + SESSION_DURATION_MS,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearLocalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getLocalSessionUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const payload = decodeSession(raw);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
  });
}

export async function getCurrentUser() {
  if (hasSupabaseAuth) {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { authUser: null, prismaUser: null };
    }

    const prismaUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    return {
      authUser: {
        id: user.id,
        email: user.email ?? "",
      },
      prismaUser,
    };
  }

  const prismaUser = await getLocalSessionUser();
  if (!prismaUser) {
    return { authUser: null, prismaUser: null };
  }

  return {
    authUser: {
      id: prismaUser.id,
      email: prismaUser.email,
    },
    prismaUser,
  };
}
