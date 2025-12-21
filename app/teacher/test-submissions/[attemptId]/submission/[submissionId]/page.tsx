import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TestSubmissionGradingView } from "@/components/teacher/test-submission-grading-view";

interface TestSubmissionGradingPageProps {
  params: Promise<{ attemptId: string; submissionId: string }>;
}

export default async function TestSubmissionGradingPage({ params }: TestSubmissionGradingPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { attemptId, submissionId } = await params;
  const attemptIdNum = parseInt(attemptId);
  const submissionIdNum = parseInt(submissionId);

  if (isNaN(attemptIdNum) || isNaN(submissionIdNum)) {
    return (
      <div className="p-6">
        <p className="text-red-600">Invalid attempt or submission ID</p>
      </div>
    );
  }

  return <TestSubmissionGradingView attemptId={attemptIdNum} submissionId={submissionIdNum} />;
}

