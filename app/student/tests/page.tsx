import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TestsListClient } from "@/components/student/tests-list-client";

export default async function StudentTestsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <TestsListClient />
    </div>
  );
}

