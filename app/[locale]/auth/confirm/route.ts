import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams;
  const next = searchParams.get("next") ?? "/";
  redirect(next === "/" ? "/auth/login" : next);
}
