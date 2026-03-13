import {
  jsonError,
  jsonSuccess,
  requireAuthenticatedUser,
} from "@/lib/api/route-helpers";

export async function GET() {
  try {
    const currentUser = await requireAuthenticatedUser();
    if ("response" in currentUser) {
      return currentUser.response;
    }

    return jsonSuccess({
      user: currentUser.authUser,
      prismaUser: currentUser.prismaUser,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return jsonError("Internal server error", 500);
  }
}
