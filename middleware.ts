import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isUserBlocked } from "@/db/queries";
import { upsertUserToUsersTable } from "@/lib/user-management";
import { getUserRole } from "@/lib/services/clerk.service";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/blocked",
]);

// Admin-only route matcher (React-Admin panel)
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Teacher-only route matcher
const isTeacherRoute = createRouteMatcher(["/teacher(.*)"]);

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

      // Get user role for route protection
      const role = await getUserRole(userId);

      // Admin panel protection - only ADMIN can access /admin
      if (isAdminRoute(req)) {
        if (role !== "ADMIN") {
          console.log(`🚫 Non-admin user ${userId} (${role}) tried to access admin panel`);
          const url = new URL("/", req.url);
          return NextResponse.redirect(url);
        }
      }

      // Teacher area protection - TEACHER or ADMIN can access /teacher
      if (isTeacherRoute(req)) {
        if (role !== "TEACHER" && role !== "ADMIN") {
          console.log(`🚫 Non-teacher user ${userId} (${role}) tried to access teacher area`);
          const url = new URL("/", req.url);
          return NextResponse.redirect(url);
        }
      }

      // Try to save/update user information, but don't let it break the blocking check
      // Temporarily disabled to avoid errors
      // try {
      //   await upsertUserToUsersTable();
      // } catch (upsertError) {
      //   console.log("⚠️  User upsert failed in middleware (non-critical):",
      //     upsertError instanceof Error ? upsertError.message : String(upsertError));
      // }
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


