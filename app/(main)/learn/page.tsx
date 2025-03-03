import { StickyWrapper } from "@/components/sticky-wrapper";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";

import { Header } from "./header";


const LearnPage = () => {
    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper >
                <UserProgress
                    activeCourse={{ title: "Course Title", imageSrc: "/en.svg" }}
                    hearts={5}
                    points={100}
                    hasActiveSubscription={false}
                >

                </UserProgress>

            </StickyWrapper>

            <FeedWrapper>
                <Header title="Course" ></Header>
            </FeedWrapper>

        </div>

    );
};
export default LearnPage;
