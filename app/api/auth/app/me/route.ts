import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const { authUser, prismaUser } = await getCurrentUser();

  if (!authUser || !prismaUser) {
    return NextResponse.json(
      { user: null, prismaUser: null },
      { status: 401 },
    );
  }

  return NextResponse.json({
    user: authUser,
    prismaUser,
  });
}
