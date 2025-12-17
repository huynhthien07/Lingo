import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TestGradingClient } from "@/components/teacher/test-grading-client";

interface TestGradingPageProps {
  params: Promise<{ attemptId: string }>;
}

export default async function TestGradingPage({ params }: TestGradingPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { attemptId } = await params;
  const attemptIdNum = parseInt(attemptId);

  if (isNaN(attemptIdNum)) {
    return (
      <div className="p-6">
        <p className="text-red-600">Invalid attempt ID</p>
      </div>
    );
  }

  return <TestGradingClient attemptId={attemptIdNum} />;
}

