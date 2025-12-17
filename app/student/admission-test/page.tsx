import { redirect } from "next/navigation";

export default async function StudentAdmissionTestPage() {
  // Redirect to unified tests page
  redirect("/student/tests");
}

