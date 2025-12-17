/**
 * Student Flashcard Learning Page
 * Browse flashcard categories and start learning
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/admin";
import FlashcardCategoriesList from "@/components/student/flashcards/flashcard-categories-list";

const StudentFlashcardsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const role = await getUserRole(userId);

  // Allow STUDENT and ADMIN to access flashcards
  if (role !== "STUDENT" && role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="h-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Vocabulary Flashcards</h1>
          <p className="text-gray-600 mt-2">
            Learn and master new vocabulary with interactive flashcards
          </p>
        </div>

        <FlashcardCategoriesList />
      </div>
    </div>
  );
};

export default StudentFlashcardsPage;

