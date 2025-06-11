import ClauseAI from "@/components/clause-ai";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";

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
