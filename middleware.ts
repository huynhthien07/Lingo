import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isUserBlocked } from "@/db/queries";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/stripe",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Get user authentication
  const { userId } = await auth();

  // If user is authenticated, check if they are blocked
  if (userId) {
    try {
      const blocked = await isUserBlocked(userId);
      if (blocked) {
        // Redirect blocked users to a blocked page or sign out
        const url = new URL("/blocked", req.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Error checking user blocked status:", error);
      // Continue with normal flow if there's an error checking blocked status
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};


