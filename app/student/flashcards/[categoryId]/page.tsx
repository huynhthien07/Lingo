/**
 * Student Flashcard Learning Page
 * Interactive flashcard learning with flip animation
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/admin";
import FlashcardLearning from "@/components/student/flashcards/flashcard-learning";

interface Props {
  params: Promise<{
    categoryId: string;
  }>;
}

const CategoryLearningPage = async ({ params }: Props) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const role = await getUserRole(userId);

  if (role !== "STUDENT") {
    redirect("/");
  }

  const { categoryId } = await params;

  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto">
        <FlashcardLearning categoryId={parseInt(categoryId)} />
      </div>
    </div>
  );
};

export default CategoryLearningPage;

