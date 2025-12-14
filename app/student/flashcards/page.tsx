import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudentFlashcardsView } from "@/components/student/flashcards/student-flashcards-view";

export default async function StudentFlashcardsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <StudentFlashcardsView />;
}

