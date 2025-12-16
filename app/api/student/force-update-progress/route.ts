/**
 * Force Update Progress API
 * POST /api/student/force-update-progress
 * Manually trigger lesson/course progress update for a specific lesson
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import {
  challengeProgress,
  lessonProgress,
  courseEnrollments,
  challenges,
  units,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    console.log("🔄 Force updating progress for lesson:", lessonId);

    // Get all challenges in this lesson
    const allChallenges = await db.query.challenges.findMany({
      where: eq(challenges.lessonId, lessonId),
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
    });

    if (allChallenges.length === 0) {
      return NextResponse.json({ error: "No challenges found in this lesson" }, { status: 404 });
    }

    const lesson = allChallenges[0].lesson;

    // Get user's challenge progress
    const allChallengeProgress = await db.query.challengeProgress.findMany({
      where: eq(challengeProgress.userId, userId),
    });

    const completedChallengesInLesson = allChallenges.filter((c) =>
      allChallengeProgress.some((cp) => cp.challengeId === c.id && cp.completed)
    );

    console.log("📊 Progress Check:", {
      lessonId,
      lessonTitle: lesson.title,
      totalChallenges: allChallenges.length,
      completedChallenges: completedChallengesInLesson.length,
      allChallengeIds: allChallenges.map(c => ({ id: c.id, type: c.type, question: c.question })),
      completedChallengeIds: completedChallengesInLesson.map(c => ({ id: c.id, type: c.type })),
    });

    const lessonCompleted = completedChallengesInLesson.length === allChallenges.length;

    console.log("✅ Lesson completed?", lessonCompleted);

    // Update lesson progress if completed
    if (lessonCompleted) {
      const existingLessonProgress = await db.query.lessonProgress.findFirst({
        where: and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.lessonId, lessonId)
        ),
      });

      if (!existingLessonProgress) {
        console.log("➕ Creating new lesson progress");
        await db.insert(lessonProgress).values({
          userId,
          lessonId,
          completed: true,
          completedAt: new Date(),
        });
      } else if (!existingLessonProgress.completed) {
        console.log("🔄 Updating existing lesson progress");
        await db
          .update(lessonProgress)
          .set({
            completed: true,
            completedAt: new Date(),
          })
          .where(eq(lessonProgress.id, existingLessonProgress.id));
      } else {
        console.log("⏭️ Lesson already marked as completed");
      }

      // Update course progress
      const courseId = lesson.unit.course.id;

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

      console.log("📈 Course Progress:", {
        courseId,
        totalLessons: totalLessonsInCourse,
        completedLessons: completedLessonsInCourse.length,
        percentage: courseProgressPercentage,
      });

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

      return NextResponse.json({
        success: true,
        lessonCompleted: true,
        courseProgress: courseProgressPercentage,
        message: "Progress updated successfully",
      });
    } else {
      return NextResponse.json({
        success: true,
        lessonCompleted: false,
        message: `Lesson not completed yet. ${completedChallengesInLesson.length}/${allChallenges.length} challenges completed.`,
      });
    }
  } catch (error: any) {
    console.error("Error force updating progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update progress" },
      { status: 500 }
    );
  }
};

