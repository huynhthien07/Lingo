import { StudentDetailView } from "@/components/teacher/students/student-detail-view";

interface StudentDetailPageProps {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ courseId?: string }>;
}

export default async function StudentDetailPage({ params, searchParams }: StudentDetailPageProps) {
  const { studentId } = await params;
  const { courseId } = await searchParams;

  if (!courseId) {
    return (
      <div className="p-6">
        <p className="text-red-600">Course ID is required</p>
      </div>
    );
  }

  return <StudentDetailView studentId={studentId} courseId={parseInt(courseId)} />;
}

