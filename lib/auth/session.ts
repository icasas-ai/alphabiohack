import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

import { appUserSelect } from "@/lib/auth/app-user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "myalphapulse_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.APP_AUTH_SECRET;
  if (secret) {
    return secret;
  }

  throw new Error(
    "APP_AUTH_SECRET is required for app-managed auth sessions.",
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

export { hashPassword, verifyPassword };

export async function createAppSession(userId: string) {
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

export async function clearAppSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAppSessionUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const payload = decodeSession(raw);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: appUserSelect,
  });
}

export async function getCurrentUser() {
  const prismaUser = await getAppSessionUser();
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
