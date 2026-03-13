import { NextResponse } from "next/server";

import type { AppUser } from "@/lib/auth/app-user";
import { getCurrentUser } from "@/lib/auth/session";
import { successResponse } from "@/services/api-errors.service";

type AuthenticatedRouteContext = {
  authUser: {
    id: string;
    email: string;
  };
  prismaUser: AppUser;
};

type RouteAuthResult =
  | AuthenticatedRouteContext
  | {
      response: NextResponse;
    };

export function jsonSuccess<T>(
  data: T,
  options?: {
    status?: number;
    successCode?: string;
    meta?: Record<string, unknown>;
  },
) {
  return NextResponse.json(
    successResponse(data, options?.successCode, options?.meta),
    options?.status ? { status: options.status } : undefined,
  );
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function requireAuthenticatedUser(): Promise<RouteAuthResult> {
  const { authUser, prismaUser } = await getCurrentUser();

  if (!authUser || !prismaUser) {
    return { response: jsonError("Unauthorized", 401) };
  }

  return { authUser, prismaUser };
}

export async function requireAuthorizedUser(
  check: (user: AppUser) => boolean,
  error = "Forbidden",
): Promise<RouteAuthResult> {
  const currentUser = await requireAuthenticatedUser();
  if ("response" in currentUser) {
    return currentUser;
  }

  if (!check(currentUser.prismaUser)) {
    return { response: jsonError(error, 403) };
  }

  return currentUser;
}
