import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TestTakingClient } from "@/components/student/test-taking-client";

interface TestPageProps {
  params: Promise<{ testId: string }>;
}

export default async function TestPage({ params }: TestPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { testId } = await params;
  const testIdNum = parseInt(testId);

  if (isNaN(testIdNum)) {
    return (
      <div className="p-6">
        <p className="text-red-600">Invalid test ID</p>
      </div>
    );
  }

  return <TestTakingClient testId={testIdNum} />;
}

