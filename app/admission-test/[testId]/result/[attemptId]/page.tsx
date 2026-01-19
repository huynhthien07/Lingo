import { AdmissionTestResultClient } from "@/components/student/admission-test-result-client";

interface AdmissionTestResultPageProps {
  params: Promise<{ testId: string; attemptId: string }>;
}

export default async function AdmissionTestResultPage({
  params,
}: AdmissionTestResultPageProps) {
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

  return <AdmissionTestResultClient testId={testIdNum} attemptId={attemptIdNum} />;
}

