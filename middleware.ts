import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public images and static assets
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
    "/",
  ],
};
