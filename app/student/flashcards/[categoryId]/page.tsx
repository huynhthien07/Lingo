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

  // Allow STUDENT and ADMIN to access flashcards
  if (role !== "STUDENT" && role !== "ADMIN") {
    redirect("/");
  }

  const { categoryId } = await params;

  return <FlashcardLearning categoryId={parseInt(categoryId)} />;
};

export default CategoryLearningPage;

