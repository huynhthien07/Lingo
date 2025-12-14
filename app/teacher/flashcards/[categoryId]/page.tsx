/**
 * Teacher Flashcard Category Detail Page
 * Manage flashcards within a category
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/admin";
import FlashcardsManager from "@/components/teacher/flashcards/flashcards-manager";

interface Props {
  params: Promise<{
    categoryId: string;
  }>;
}

const CategoryFlashcardsPage = async ({ params }: Props) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const role = await getUserRole(userId);

  if (role !== "TEACHER" && role !== "ADMIN") {
    redirect("/");
  }

  const { categoryId } = await params;

  return (
    <div className="h-full p-6">
      <div className="max-w-7xl mx-auto">
        <FlashcardsManager categoryId={parseInt(categoryId)} />
      </div>
    </div>
  );
};

export default CategoryFlashcardsPage;

