import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import db from "@/db/drizzle";
import { writingSubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import WritingSubmissionDetail from "@/components/student/writing-submission-detail";

export default async function WritingSubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { submissionId } = await params;
  const submissionIdNum = parseInt(submissionId);

  if (isNaN(submissionIdNum)) {
    notFound();
  }

  // Fetch submission
  const submission = await db.query.writingSubmissions.findFirst({
    where: and(
      eq(writingSubmissions.id, submissionIdNum),
      eq(writingSubmissions.userId, userId)
    ),
    with: {
      challenge: {
        with: {
          questions: true,
          lesson: {
            with: {
              unit: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!submission) {
    notFound();
  }

  return <WritingSubmissionDetail submission={submission} />;
}

