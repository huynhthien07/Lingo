import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is a teacher or admin
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.userName || user.email}
              </span>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {(user.userName || user.email).charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

