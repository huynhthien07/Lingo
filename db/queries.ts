import db from "@/db/drizzle";
import { challengeProgress, courses, units, userProgress, lessons } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import exp from "constants";
import { asc, eq } from "drizzle-orm";
import { cache } from "react";

export const getUserProgress = cache(async () => {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }
    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        with: {
            activeCourse: true,
        },
    });
    return data;
});

export const getUnits = cache(async () => {
    const { userId } = await auth();
    const userProgress = await getUserProgress();

    if (!userId || !userProgress?.activeCourseId) {
        return [];
    }

    // TODO: Conform whether order is needed
    const data = await db.query.units.findMany({
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            lessons: {
                with: {
                    challenges: {
                        with: {
                            challengeProgress: {
                                where: eq(
                                    challengeProgress.userId,
                                    userId,
                                )
                            },
                        }
                    }
                }
            }
        }
    });
    const normalizedData = data.map((unit) => {
        const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
            if (lesson.challenges.length === 0

            ) {
                return { ...lesson, completed: false };
            }

            const allCompletedChallenges = lesson.challenges.every((challenge) => {
                return challenge.challengeProgress
                    && challenge.challengeProgress.length > 0
                    && challenge.challengeProgress.every((progress) => progress.completed);
            });
            return { ...lesson, completed: allCompletedChallenges };
        });
        return { ...unit, lessons: lessonsWithCompletedStatus };
    });
    return normalizedData;
});

export const getCourses = cache(async () => {
    const data = await db.query.courses.findMany();
    return data;
});

export const getCourseById = cache(async (courseId: number) => {
    const data = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
        // TODO: Populate units and lessons
    });
    return data;
});

export const getCourseProgress = cache(async () => {
    const { userId } = await auth();

    if (!userId) {
        return null;
    };

    const userProgress = await getUserProgress();

    if (!userId || !userProgress?.activeCourseId) {
        return null;
    }

    const unitInActiveCourse = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    unit: true,
                    challenges: {
                        with: {
                            challengeProgress: {
                                where: eq(challengeProgress.userId, userId),
                            },
                        },
                    },

                }
            }
        }

    });

    const firstUNcompletedUnit = unitInActiveCourse
        .flatMap((unit) => unit.lessons)
        .find((lesson) => {
            //TODO: if something doesn't work, check the last if clause 
            return lesson.challenges.some((challenge) => {
                return !challenge.challengeProgress
                    || challenge.challengeProgress.length === 0
                    || challenge.challengeProgress.some((progress) => progress.completed === false);
            });
        });

    return {
        activeLesson: firstUNcompletedUnit,
        activeLessonId: firstUNcompletedUnit?.id,
    };
});

export const getLesson = cache(async (id?: number) => {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const courseProgress = await getCourseProgress();

    const lessonId = id || courseProgress?.activeLessonId;

    if (!lessonId) {
        return null;
    }

    const data = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
            challenges: {
                orderBy: (challenges, { asc }) => [asc(challenges.order)],
                with: {
                    challengeOptions: true,
                    challengeProgress: {
                        where: eq(challengeProgress.userId, userId),

                    },
                },
            },
        },
    });

    if (!data || !data.challenges) {
        return null;
    };

    const normalizedData = data.challenges.map((challenge) => {
        //TODO: if something doesn't work, check the last if clause 
        const completed = challenge.challengeProgress
            && challenge.challengeProgress.length > 0
            && challenge.challengeProgress.every((progress) => progress.completed);
        return { ...challenge, completed };
    });

    return { ...data, challenges: normalizedData };
});


export const getLessonPercentage = cache(async () => {
    const courseProgress = await getCourseProgress();

    if (!courseProgress?.activeLesson) {
        return 0;
    }

    const lesson = await getLesson(courseProgress.activeLesson.id);

    if (!lesson) {
        return 0;
    };

    const completedChallenges = lesson.challenges.filter((challenge) => challenge.completed);

    const percentage = Math.round((completedChallenges.length / lesson.challenges.length) * 100);

    return percentage;


});

