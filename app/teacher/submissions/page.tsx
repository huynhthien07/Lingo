import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SubmissionsListView } from "@/components/teacher/submissions/submissions-list-view";

export default async function SubmissionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <SubmissionsListView />;
}

