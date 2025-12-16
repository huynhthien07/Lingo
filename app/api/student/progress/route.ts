/**
 * Student Progress API
 * POST /api/student/progress - Update challenge progress and calculate lesson/course completion
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import {
  challengeProgress,
  lessonProgress,
  userProgress,
  challenges,
  units,
  courseEnrollments
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { challengeId, answers, score } = body;

    // Get challenge info
    const challenge = await db.query.challenges.findFirst({
      where: eq(challenges.id, challengeId),
      with: {
        lesson: {
          with: {
            unit: {
              with: {
                course: true,
              },
            },
            challenges: true, // Get all challenges in this lesson
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Update or create challenge progress
    const existingProgress = await db.query.challengeProgress.findFirst({
      where: and(
        eq(challengeProgress.userId, userId),
        eq(challengeProgress.challengeId, challengeId)
      ),
    });

    if (existingProgress) {
      await db
        .update(challengeProgress)
        .set({
          completed: true,
          userAnswer: JSON.stringify(answers),
          score,
          completedAt: new Date(),
        })
        .where(eq(challengeProgress.id, existingProgress.id));
    } else {
      await db.insert(challengeProgress).values({
        userId,
        challengeId,
        completed: true,
        userAnswer: JSON.stringify(answers),
        score,
        completedAt: new Date(),
      });
    }

    // Check if all challenges in this lesson are completed
    const allChallengesInLesson = challenge.lesson.challenges;
    const allChallengeProgress = await db.query.challengeProgress.findMany({
      where: eq(challengeProgress.userId, userId),
    });

    const completedChallengesInLesson = allChallengesInLesson.filter((c) =>
      allChallengeProgress.some((cp) => cp.challengeId === c.id && cp.completed)
    );

    const lessonCompleted = completedChallengesInLesson.length === allChallengesInLesson.length;
    let pointsEarned = score;

    // Update lesson progress if completed
    if (lessonCompleted) {
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

        // Bonus points for completing lesson
        pointsEarned += 50;
      } else if (!existingLessonProgress.completed) {
        await db
          .update(lessonProgress)
          .set({
            completed: true,
            completedAt: new Date(),
          })
          .where(eq(lessonProgress.id, existingLessonProgress.id));

        // Bonus points for completing lesson
        pointsEarned += 50;
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

    // Update user progress (points)
    const userProgressData = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    });

    if (userProgressData) {
      const newPoints = userProgressData.points + pointsEarned;
      const newLevel = Math.floor(newPoints / 100) + 1;

      await db
        .update(userProgress)
        .set({
          points: newPoints,
          level: newLevel,
        })
        .where(eq(userProgress.userId, userId));
    } else {
      await db.insert(userProgress).values({
        userId,
        points: pointsEarned,
        level: 1,
      });
    }

    return NextResponse.json({
      success: true,
      lessonCompleted,
      pointsEarned,
      totalPoints: (userProgressData?.points || 0) + pointsEarned,
    });
  } catch (error: any) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update progress" },
      { status: 500 }
    );
  }
};

