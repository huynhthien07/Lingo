import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UnitList } from "@/components/teacher/units/unit-list";

export default async function TeacherUnitsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Unit Management</h2>
          <p className="text-gray-600 mt-1">Manage course units and topics</p>
        </div>
      </div>

      <UnitList />
    </div>
  );
}

