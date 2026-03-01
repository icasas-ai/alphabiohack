import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const { authUser, prismaUser } = await getCurrentUser();
    if (!authUser || !prismaUser) {
      console.log("GET /api/user: No authenticated user found");
      return NextResponse.json(
        { user: null, prismaUser: null },
        { status: 401 }
      );
    }

    console.log("GET /api/user: Prisma user data:", prismaUser);

    return NextResponse.json({
      user: authUser,
      prismaUser,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
