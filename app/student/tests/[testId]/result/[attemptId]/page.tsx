import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TestResultClient } from "@/components/student/test-result-client";

interface TestResultPageProps {
  params: Promise<{ testId: string; attemptId: string }>;
}

export default async function TestResultPage({ params }: TestResultPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { testId, attemptId } = await params;
  const testIdNum = parseInt(testId);
  const attemptIdNum = parseInt(attemptId);

  if (isNaN(testIdNum) || isNaN(attemptIdNum)) {
    return (
      <div className="p-6">
        <p className="text-red-600">Invalid parameters</p>
      </div>
    );
  }

  return <TestResultClient testId={testIdNum} attemptId={attemptIdNum} />;
}

