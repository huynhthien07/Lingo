import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AdmissionTestView } from "@/components/student/admission-test/admission-test-view";

export default async function AdmissionTestPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <AdmissionTestView />;
}

