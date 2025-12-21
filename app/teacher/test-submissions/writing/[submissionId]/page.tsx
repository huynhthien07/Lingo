import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TestWritingGradingView } from "@/components/teacher/test-writing-grading-view";

export default async function TestWritingGradingPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { submissionId } = await params;

  return <TestWritingGradingView submissionId={parseInt(submissionId)} />;
}

