import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateUnitForm } from "@/components/teacher/units/create-unit-form";

export default async function NewUnitPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Create New Unit</h2>
      <CreateUnitForm />
    </div>
  );
}

