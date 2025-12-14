import { TestDetailView } from "@/components/teacher/tests/test-detail-view";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;

  return <TestDetailView testId={parseInt(testId)} />;
}

