import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();

    // Obtener el usuario de Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { user: null, prismaUser: null },
        { status: 401 }
      );
    }

    // Obtener el usuario de Prisma
    const prismaUser = await prisma.user.findUnique({
      where: {
        supabaseId: user.id,
      },
    });

    return NextResponse.json({
      user,
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
