import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UnitDetailView } from "@/components/teacher/units/unit-detail-view";
import db from "@/db/drizzle";
import { units, teacherAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface UnitDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const unitId = parseInt(id);

  // Validate unitId
  if (isNaN(unitId)) {
    redirect("/teacher/units");
  }

  // Get unit with course info
  const unit = await db.query.units.findFirst({
    where: eq(units.id, unitId),
    with: {
      course: true,
    },
  });

  if (!unit) {
    redirect("/teacher/units");
  }

  // Check if teacher is assigned to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, unit.courseId),
      eq(teacherAssignments.teacherId, userId)
    ),
  });

  if (!assignment) {
    redirect("/teacher/units");
  }

  return (
    <div className="space-y-6">
      <UnitDetailView unitId={unitId} initialUnit={unit} />
    </div>
  );
}

