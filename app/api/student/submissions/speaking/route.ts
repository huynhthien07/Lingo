import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { speakingSubmissions, challengeProgress, lessonProgress, courseEnrollments, challenges, units } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET - Check if student has submitted for this challenge
export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      return NextResponse.json({ error: "Challenge ID required" }, { status: 400 });
    }

    const submission = await db.query.speakingSubmissions.findFirst({
      where: and(
        eq(speakingSubmissions.userId, userId),
        eq(speakingSubmissions.challengeId, parseInt(challengeId))
      ),
      orderBy: (submissions, { desc }) => [desc(submissions.submittedAt)],
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Error fetching speaking submission:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

// POST - Submit speaking (with audio file)
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const challengeId = formData.get("challengeId") as string;
    const duration = formData.get("duration") as string;

    if (!audioFile || !challengeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if already submitted
    const existingSubmission = await db.query.speakingSubmissions.findFirst({
      where: and(
        eq(speakingSubmissions.userId, userId),
        eq(speakingSubmissions.challengeId, parseInt(challengeId))
      ),
    });

    if (existingSubmission) {
      return NextResponse.json({ error: "Already submitted" }, { status: 400 });
    }

    // Save audio file
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "speaking");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${userId}_${challengeId}_${timestamp}.webm`;
    const filepath = path.join(uploadsDir, filename);
    const audioUrl = `/uploads/speaking/${filename}`;

    // Write file
    await writeFile(filepath, buffer);

    // Create submission
    const [submission] = await db
      .insert(speakingSubmissions)
      .values({
        userId,
        challengeId: parseInt(challengeId),
        audioUrl,
        duration: duration ? parseInt(duration) : null,
        submittedAt: new Date(),
      })
      .returning();

    // Mark challenge as completed (submitted, waiting for grading)
    const existingProgress = await db.query.challengeProgress.findFirst({
      where: and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.challengeId, parseInt(challengeId))
      ),
    });

    if (existingProgress) {
      await db
        .update(challengeProgress)
        .set({
          completed: true,
          completedAt: new Date(),
        })
        .where(
          and(
            eq(challengeProgress.userId, userId),
            eq(challengeProgress.challengeId, parseInt(challengeId))
          )
        );
    } else {
      await db.insert(challengeProgress).values({
        userId,
        challengeId: parseInt(challengeId),
        completed: true,
        completedAt: new Date(),
        score: 0, // Will be updated when teacher grades
      });
    }

    // Check if all challenges in this lesson are completed
    const challenge = await db.query.challenges.findFirst({
      where: eq(challenges.id, parseInt(challengeId)),
      with: {
        lesson: {
          with: {
            unit: {
              with: {
                course: true,
              },
            },
            challenges: true,
          },
        },
      },
    });

    if (challenge) {
      const allChallengesInLesson = challenge.lesson.challenges;
      const allChallengeProgress = await db.query.challengeProgress.findMany({
        where: eq(challengeProgress.userId, userId),
      });

      const completedChallengesInLesson = allChallengesInLesson.filter((c) =>
        allChallengeProgress.some((cp) => cp.challengeId === c.id && cp.completed)
      );

      console.log("🎤 Speaking Progress Check:", {
        lessonId: challenge.lesson.id,
        lessonTitle: challenge.lesson.title,
        totalChallenges: allChallengesInLesson.length,
        completedChallenges: completedChallengesInLesson.length,
        allChallengeIds: allChallengesInLesson.map(c => c.id),
        completedChallengeIds: completedChallengesInLesson.map(c => c.id),
      });

      const lessonCompleted = completedChallengesInLesson.length === allChallengesInLesson.length;

      console.log("✅ Lesson completed?", lessonCompleted);

      // Update lesson progress if completed
      if (lessonCompleted) {
        console.log("➕ Updating lesson progress...");
        const existingLessonProgress = await db.query.lessonProgress.findFirst({
          where: and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.lessonId, challenge.lesson.id)
          ),
        });

        if (!existingLessonProgress) {
          await db.insert(lessonProgress).values({
            userId,
            lessonId: challenge.lesson.id,
            completed: true,
            completedAt: new Date(),
          });
        } else if (!existingLessonProgress.completed) {
          await db
            .update(lessonProgress)
            .set({
              completed: true,
              completedAt: new Date(),
            })
            .where(eq(lessonProgress.id, existingLessonProgress.id));
        }

        // Update course progress
        const courseId = challenge.lesson.unit.course.id;

        // Get all lessons in the course
        const allUnits = await db.query.units.findMany({
          where: eq(units.courseId, courseId),
          with: {
            lessons: true,
          },
        });

        const allLessonsInCourse = allUnits.flatMap(unit => unit.lessons);
        const totalLessonsInCourse = allLessonsInCourse.length;

        // Get all completed lessons for this user in this course
        const allLessonProgressInCourse = await db.query.lessonProgress.findMany({
          where: eq(lessonProgress.userId, userId),
        });

        const completedLessonsInCourse = allLessonsInCourse.filter(lesson =>
          allLessonProgressInCourse.some(lp => lp.lessonId === lesson.id && lp.completed)
        );

        const courseProgressPercentage = Math.round(
          (completedLessonsInCourse.length / totalLessonsInCourse) * 100
        );

        // Update course enrollment progress
        await db
          .update(courseEnrollments)
          .set({
            progress: courseProgressPercentage,
            completedAt: courseProgressPercentage === 100 ? new Date() : null,
          })
          .where(
            and(
              eq(courseEnrollments.userId, userId),
              eq(courseEnrollments.courseId, courseId)
            )
          );
      }
    }

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Error creating speaking submission:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

