import { StudentSidebar } from "@/components/student/student-sidebar";

type Props = {
  children: React.ReactNode;
};

const StudentLayout = ({ children }: Props) => {
  return (
    <div className="flex h-screen">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;

