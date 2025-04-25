// import { FeedWrapper } from "@/components/feed-wrapper";
// import { Promo } from "@/components/promo";
// import { Quests } from "@/components/quests";
// import { StickyWrapper } from "@/components/sticky-wrapper";
// import { UserProgress } from "@/components/user-progress";
// import { getUserProgress, getUserSubscription } from "@/db/queries";
// import Image from "next/image";
// import { redirect } from "next/navigation";
// import ClauseAI from "@/components/clause-ai";


// const ChatbotPage = async () => {
//     const userProgressData = getUserProgress();
//     const userSubscriptionData = getUserSubscription();

//     const [
//         userProgress,
//         userSubscription,
//     ] = await Promise.all([
//         userProgressData,
//         userSubscriptionData
//     ]);

//     if (!userProgress || !userProgress.activeCourse) {
//         redirect("/chatbot");
//     }

//     const isPro = !!userSubscription?.isActive;

//     return (
//         <div className="flex flex-col gap-6 px-6">
//             {/* Chatbot Header */}
//             <div className="flex justify-between items-center">
//                 <h1 className="text-2xl font-bold">Chatbot</h1>
//                 <ClauseAI />
//             </div>

//             {/* Main Chatbot Content */}
//             <div className="flex flex-row gap-[48px]">
//                 <div className="flex-1">
//                     {/* Chatbox or Chat Interface */}
//                     <div className="chatbox">
//                         {/* Chat messages and input field */}
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// }

// export default ChatbotPage;

import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import Image from "next/image";
import { redirect } from "next/navigation";
import ClauseAI from "@/components/clause-ai";

const ChatbotPage = async () => {
    const userProgressData = getUserProgress();
    const userSubscriptionData = getUserSubscription();

    const [
        userProgress,
        userSubscription,
    ] = await Promise.all([
        userProgressData,
        userSubscriptionData
    ]);

    if (!userProgress || !userProgress.activeCourse) {
        redirect("/chatbot");
    }

    const isPro = !!userSubscription?.isActive;

    return (
        <div className="flex flex-col gap-8 px-6 py-6 bg-gray-50 min-h-screen">
            {/* Chatbot Header */}
            <div className="flex flex-col items-start mb-6">
                <h1 className="text-3xl font-bold text-neutral-800 mb-4">Chatbot</h1>
                <div className="flex items-center w-full">
                    <ClauseAI />
                </div>

            </div>

            {/* Các thành phần khác */}
        </div>
    );
};

export default ChatbotPage;
