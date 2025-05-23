import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { lessons, units as unitScheme } from "@/db/schema";

import {
    getCourseProgress,
    getLessonPercentage,
    getUnits,
    getUserProgress,
    getUserSubscription,
} from "@/db/queries";

import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { Header } from "./header";
import { Unit } from "./unit";


const LearnPage = async () => {
    const userProgressData = getUserProgress();
    const lessonPercentageData = getLessonPercentage();
    const courseProgressData = getCourseProgress();
    const unitsData = getUnits();

    const userSubscriptionData = getUserSubscription();

    const [
        userProgress,
        units,
        courseProgress,
        lessonPercentage,
        userSubscription,
    ] = await Promise.all([
        userProgressData,
        unitsData,
        courseProgressData,
        lessonPercentageData,
        userSubscriptionData,
    ]);

    if (!userProgress || !userProgress.activeCourse) {
        redirect("/courses");
    }

    if (!courseProgress) {
        redirect("/courses");
    }

    const isPro = !!userSubscription?.isActive;

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper >
                <UserProgress
                    activeCourse={userProgress.activeCourse}
                    hearts={userProgress.hearts}
                    points={userProgress.points}
                    hasActiveSubscription={isPro}
                >

                </UserProgress>

                {!isPro && (
                    <Promo/>
                )};
                <Quests points = {userProgress.points}/>

            </StickyWrapper>

            <FeedWrapper>
                <Header title={userProgress.activeCourse.title} ></Header>
                {units.map((unit) => (
                    <div key={unit.id} className="mb-10">
                        <Unit
                            id={unit.id}
                            order={unit.order}
                            description={unit.description}
                            title={unit.title}
                            lessons={unit.lessons}
                            activeLesson={courseProgress.activeLesson as typeof lessons.$inferSelect
                                & {
                                    unit: typeof unitScheme.$inferSelect;
                                } | undefined}
                            activeLessonPercent={lessonPercentage}
                        />
                    </div>
                ))}
            </FeedWrapper>

        </div>

    );
};
export default LearnPage;
