import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudentChatbotView } from "@/components/student/chatbot/student-chatbot-view";

export default async function StudentChatbotPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <StudentChatbotView />;
}

