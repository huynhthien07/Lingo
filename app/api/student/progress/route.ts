/**
 * Student Progress API
 * POST /api/student/progress - Update challenge progress and calculate lesson/course completion
 *
 * ✅ NEW: Server-side answer validation for all question types
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
  courseEnrollments,
  questions
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { validateAnswer } from "@/lib/utils/answer-validator";
import type { QuestionType } from "@/lib/utils/question-type-mapper";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { challengeId, answers } = body; // ✅ REMOVED: score (will calculate server-side)

    // Get challenge info with questions
    const challenge = await db.query.challenges.findFirst({
      where: eq(challenges.id, challengeId),
      with: {
        questions: {
          with: {
            options: true,
          },
        },
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

    // ✅ NEW: Validate answers server-side
    let totalScore = 0;
    let totalPossible = 0;
    let correctCount = 0;
    const questionResults: any[] = [];

    for (const question of challenge.questions) {
      const questionType = question.questionType as QuestionType | null;
      const answerData = answers[question.id];

      if (!answerData) {
        // Question not answered
        questionResults.push({
          questionId: question.id,
          isCorrect: false,
          pointsEarned: 0,
          maxPoints: 1,
        });
        totalPossible += 1;
        continue;
      }

      // Validate answer based on question type
      if (questionType) {
        let correctAnswer: any = null;
        let shouldValidate = true;

        if (questionType === "SINGLE_CHOICE") {
          const correctOption = question.options.find(opt => opt.correct);
          correctAnswer = correctOption?.id;
        } else if (questionType === "MULTIPLE_CHOICE") {
          correctAnswer = question.options.filter(opt => opt.correct).map(opt => opt.id);
        } else if (questionType === "TEXT_INPUT") {
          correctAnswer = question.correctAnswer || null;
          shouldValidate = correctAnswer !== null;
        } else if (questionType === "MATCHING" || questionType === "LABELING" || questionType === "ORDERING") {
          correctAnswer = null;
          shouldValidate = question.metadata !== null;
        }

        if (shouldValidate) {
          const validation = validateAnswer(
            questionType,
            answerData,
            correctAnswer,
            question.metadata,
            1 // Each question worth 1 point
          );

          questionResults.push({
            questionId: question.id,
            isCorrect: validation.isCorrect,
            pointsEarned: validation.pointsEarned,
            maxPoints: validation.maxPoints,
            feedback: validation.feedback, // ✅ Include feedback (e.g., "3/5 pairs correct")
          });

          totalScore += validation.pointsEarned;
          totalPossible += validation.maxPoints;
          if (validation.isCorrect) {
            correctCount++;
          }
        }
      } else {
        // ⚠️ FALLBACK: Old validation for backward compatibility (SINGLE_CHOICE only)
        const selectedOptionId = typeof answerData === 'number' ? answerData : answerData.selectedOptionId;
        const correctOption = question.options.find(opt => opt.correct);
        const isCorrect = selectedOptionId === correctOption?.id;

        questionResults.push({
          questionId: question.id,
          isCorrect,
          pointsEarned: isCorrect ? 1 : 0,
          maxPoints: 1,
        });

        totalScore += isCorrect ? 1 : 0;
        totalPossible += 1;
        if (isCorrect) {
          correctCount++;
        }
      }
    }

    // Calculate final score (0-10 scale)
    const score = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 10) : 0;

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
      score, // ✅ NEW: Return calculated score
      correctCount, // ✅ NEW: Return number of correct answers
      totalQuestions: challenge.questions.length, // ✅ NEW: Return total questions
      questionResults, // ✅ NEW: Return detailed results for each question
    });
  } catch (error: any) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update progress" },
      { status: 500 }
    );
  }
};

