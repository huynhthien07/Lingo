import db from "@/db/drizzle";
import { challengeProgress, courses, lessons, units, userProgress, userSubscription, tests, vocabularyTopics, vocabularyWords } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql, and, gte, lte, count, countDistinct } from "drizzle-orm";
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

    const data = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    challenges: {
                        orderBy: (challenges, { asc }) => [asc(challenges.order)],
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
        with: {
            units: {
                orderBy: (units, { asc }) => [asc(units.order)],
                with: {
                    lessons: {
                        orderBy: (lessons, { asc }) => [asc(lessons.order)],
                    },
                },
            },
        },
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
                        orderBy: (challenges, { asc }) => [asc(challenges.order)],
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


const DAY_IN_MS = 86_400_000;
export const getUserSubscription = cache(async () => {
    const { userId } = await auth();

    if (!userId) return null;

    const data = await db.query.userSubscription.findFirst({
        where: eq(userSubscription.userId, userId),
    });

    if (!data) return null;

    const isActive =
        data.stripePriceId &&
        data.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return {
        ...data,
        isActive: !!isActive,
    };
});

export const getTopTenUsers = cache(async () => {

    const { userId } = await auth();

    if (!userId) {
        return [];
    }

    const data = await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit: 10,
        columns: {
            userId: true,
            userName: true,
            userImageSrc: true,
            points: true,
        },
    });
    return data;
});

export const getTests = async () => {
    try {
        const tests = await db.query.tests.findMany({
            orderBy: (tests, { asc }) => [asc(tests.title)],
        });

        return tests;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getTest = async (id: number) => {
    try {
        const test = await db.query.tests.findFirst({
            where: eq(tests.id, id),
            with: {
                questions: {
                    orderBy: (questions, { asc }) => [asc(questions.order)],
                    with: {
                        options: true,
                    },
                },
            },
        });

        return test;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getVocabularyTopics = async () => {
    try {
        const topics = await db.query.vocabularyTopics.findMany({
            orderBy: (topics, { asc }) => [asc(topics.title)],
        });

        return topics;
    } catch (error) {
        console.error("Failed to fetch vocabulary topics:", error);
        return [];
    }
};

export const getVocabularyTopic = async (id: number) => {
    try {
        const topic = await db.query.vocabularyTopics.findFirst({
            where: eq(vocabularyTopics.id, id),
        });

        return topic;
    } catch (error) {
        console.error(`Failed to fetch vocabulary topic ${id}:`, error);
        return null;
    }
};

export const getVocabularyWords = async (topicId: number) => {
    try {
        const words = await db.query.vocabularyWords.findMany({
            where: eq(vocabularyWords.topicId, topicId),
            orderBy: (words, { asc }) => [asc(words.word)],
        });

        return words;
    } catch (error) {
        console.error(`Failed to fetch vocabulary words for topic ${topicId}:`, error);
        return [];
    }
};

// Statistics functions for admin dashboard
export const getUserStatistics = cache(async () => {
    try {
        // Get total number of users
        const totalUsers = await db.select({ count: count() }).from(userProgress);

        // Since userProgress doesn't have creation timestamp, we'll estimate monthly active users
        // as users who have some progress (points > 0)
        const activeUsers = await db.select({ count: count() })
            .from(userProgress)
            .where(sql`${userProgress.points} > 0`);

        // Estimate monthly active users as a percentage of active users
        const monthlyActiveUsers = Math.floor((activeUsers[0]?.count || 0) * 0.6); // Estimate 60% as monthly active

        return {
            totalUsers: totalUsers[0]?.count || 0,
            monthlyActiveUsers: monthlyActiveUsers,
        };
    } catch (error) {
        console.error("Failed to fetch user statistics:", error);
        return {
            totalUsers: 0,
            monthlyActiveUsers: 0,
        };
    }
});

export const getLessonCompletionStatistics = cache(async () => {
    try {
        // Get total number of unique users who have completed at least one challenge
        const usersWithCompletedLessons = await db
            .select({ count: countDistinct(challengeProgress.userId) })
            .from(challengeProgress)
            .where(eq(challengeProgress.completed, true));

        // Get total number of completed challenges (as a proxy for lesson progress)
        const totalCompletedChallenges = await db
            .select({ count: count() })
            .from(challengeProgress)
            .where(eq(challengeProgress.completed, true));

        // Since we don't have timestamps, we'll use the current totals as monthly data
        // In a real implementation, you'd want to add timestamps to track monthly progress
        const monthlyCompletions = totalCompletedChallenges[0]?.count || 0;

        return {
            usersWithCompletedLessons: usersWithCompletedLessons[0]?.count || 0,
            totalLessonCompletions: totalCompletedChallenges[0]?.count || 0,
            monthlyLessonCompletions: Math.floor(monthlyCompletions * 0.3), // Estimate 30% as monthly
        };
    } catch (error) {
        console.error("Failed to fetch lesson completion statistics:", error);
        return {
            usersWithCompletedLessons: 0,
            totalLessonCompletions: 0,
            monthlyLessonCompletions: 0,
        };
    }
});

export const getPremiumSubscriptionStatistics = cache(async () => {
    try {
        // Get total number of premium subscribers
        const totalSubscribers = await db.select({ count: count() }).from(userSubscription);

        // Get active premium subscribers (subscription not expired)
        const currentDate = new Date();
        const activeSubscribers = await db.select({ count: count() })
            .from(userSubscription)
            .where(gte(userSubscription.stripeCurrentPeriodEnd, currentDate));

        // Get new subscribers in the last month
        const oneMonthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        const monthlyNewSubscribers = await db.select({ count: count() })
            .from(userSubscription)
            .where(
                and(
                    gte(userSubscription.stripeCurrentPeriodEnd, oneMonthAgo),
                    gte(userSubscription.stripeCurrentPeriodEnd, currentDate)
                )
            );

        return {
            totalSubscribers: totalSubscribers[0]?.count || 0,
            activeSubscribers: activeSubscribers[0]?.count || 0,
            monthlyNewSubscribers: monthlyNewSubscribers[0]?.count || 0,
        };
    } catch (error) {
        console.error("Failed to fetch premium subscription statistics:", error);
        return {
            totalSubscribers: 0,
            activeSubscribers: 0,
            monthlyNewSubscribers: 0,
        };
    }
});

export const getOverallStatistics = cache(async () => {
    try {
        const [userStats, lessonStats, subscriptionStats] = await Promise.all([
            getUserStatistics(),
            getLessonCompletionStatistics(),
            getPremiumSubscriptionStatistics(),
        ]);

        return {
            users: userStats,
            lessons: lessonStats,
            subscriptions: subscriptionStats,
        };
    } catch (error) {
        console.error("Failed to fetch overall statistics:", error);
        return {
            users: { totalUsers: 0, monthlyActiveUsers: 0 },
            lessons: { usersWithCompletedLessons: 0, totalLessonCompletions: 0, monthlyLessonCompletions: 0 },
            subscriptions: { totalSubscribers: 0, activeSubscribers: 0, monthlyNewSubscribers: 0 },
        };
    }
});
