import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { writingSubmissions, speakingSubmissions, challenges } from "@/db/schema";
import { eq, desc, or } from "drizzle-orm";
import LearningHistoryClient from "@/components/student/learning-history-client";

export default async function LearningHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch writing submissions
  const writingSubmissionsData = await db.query.writingSubmissions.findMany({
    where: eq(writingSubmissions.userId, userId),
    orderBy: [desc(writingSubmissions.submittedAt)],
    with: {
      challenge: {
        with: {
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

  // Fetch speaking submissions
  const speakingSubmissionsData = await db.query.speakingSubmissions.findMany({
    where: eq(speakingSubmissions.userId, userId),
    orderBy: [desc(speakingSubmissions.submittedAt)],
    with: {
      challenge: {
        with: {
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

  return (
    <LearningHistoryClient
      writingSubmissions={writingSubmissionsData}
      speakingSubmissions={speakingSubmissionsData}
    />
  );
}

