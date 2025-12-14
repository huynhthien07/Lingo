/**
 * Teacher Flashcard Management Page
 * Displays flashcard categories and allows creating/editing categories
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/admin";
import FlashcardCategoriesManager from "@/components/teacher/flashcards/flashcard-categories-manager";

const TeacherFlashcardsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const role = await getUserRole(userId);

  if (role !== "TEACHER" && role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="h-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Flashcard Management</h1>
          <p className="text-gray-600 mt-2">
            Create and manage vocabulary flashcards for your students
          </p>
        </div>

        <FlashcardCategoriesManager />
      </div>
    </div>
  );
};

export default TeacherFlashcardsPage;

