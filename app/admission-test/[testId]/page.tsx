import { TestTakingClient } from "@/components/student/test-taking-client";

interface AdmissionTestPageProps {
  params: Promise<{ testId: string }>;
}

export default async function AdmissionTestPage({
  params,
}: AdmissionTestPageProps) {
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

