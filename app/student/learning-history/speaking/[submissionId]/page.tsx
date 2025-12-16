import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import db from "@/db/drizzle";
import { speakingSubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import SpeakingSubmissionDetail from "@/components/student/speaking-submission-detail";

export default async function SpeakingSubmissionDetailPage({
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
  const submission = await db.query.speakingSubmissions.findFirst({
    where: and(
      eq(speakingSubmissions.id, submissionIdNum),
      eq(speakingSubmissions.userId, userId)
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

  return <SpeakingSubmissionDetail submission={submission} />;
}

