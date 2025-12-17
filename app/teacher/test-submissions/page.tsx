/**
 * Teacher Test Submissions Page
 * Displays speaking/writing test submissions for grading
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import TestSubmissionsClient from "@/components/teacher/test-submissions-client";

async function getUserRole(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);
  return user?.role;
}

const TestSubmissionsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getUserRole(userId);

  if (role !== "TEACHER" && role !== "ADMIN") {
    redirect("/");
  }

  return <TestSubmissionsClient />;
};

export default TestSubmissionsPage;

