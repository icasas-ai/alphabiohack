import { jsonError, jsonSuccess } from "@/lib/api/route-helpers";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const { authUser, prismaUser } = await getCurrentUser();

  if (!authUser || !prismaUser) {
    return jsonError("Unauthorized", 401);
  }

  return jsonSuccess({
    user: authUser,
    prismaUser,
  });
}
