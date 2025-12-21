/**
 * Teacher Test Submissions Page
 * Displays speaking/writing test submissions for grading
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { TestSubmissionsListView } from "@/components/teacher/test-submissions-list-view";

const TestSubmissionsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <TestSubmissionsListView />;
};

export default TestSubmissionsPage;

