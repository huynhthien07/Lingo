import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isUserBlocked } from "@/db/queries";
import { upsertUserToUsersTable } from "@/lib/user-management";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/stripe",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/blocked",
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
      console.log(`🔍 Middleware check for user: ${userId}`);

      // Check if user is blocked (skip user upsert to avoid Clerk issues in middleware)
      const blocked = await isUserBlocked(userId);
      console.log(`🔒 User ${userId} blocked status: ${blocked}`);

      if (blocked) {
        console.log(`🚫 Redirecting blocked user ${userId} to /blocked`);
        // Redirect blocked users to a blocked page
        const url = new URL("/blocked", req.url);
        return NextResponse.redirect(url);
      }

      // Try to save/update user information, but don't let it break the blocking check
      try {
        await upsertUserToUsersTable();
      } catch (upsertError) {
        console.log("⚠️  User upsert failed in middleware (non-critical):",
          upsertError instanceof Error ? upsertError.message : String(upsertError));
      }
    } catch (error) {
      console.error("❌ Error in user middleware operations:", error);
      // Continue with normal flow if there's an error to avoid breaking the app
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


