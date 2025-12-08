import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/services/clerk.service";
import Link from "next/link";

export default async function TestDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getUserRole(userId);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧪 Dashboard Test Page
          </h1>

          {/* User Info */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Current User Info
            </h2>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">User ID:</span>{" "}
                <code className="bg-gray-200 px-2 py-1 rounded">{userId}</code>
              </p>
              <p>
                <span className="font-medium">Role:</span>{" "}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {role}
                </span>
              </p>
            </div>
          </div>

          {/* Dashboard Links */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Test Dashboard Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Admin Dashboard */}
              <Link
                href="/admin"
                className="block p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Admin Dashboard</h3>
                  <p className="text-sm opacity-90 mb-4">
                    React-Admin panel for system management
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">
                      ADMIN only
                    </span>
                    {role === "ADMIN" ? (
                      <span className="text-xs">✅ Accessible</span>
                    ) : (
                      <span className="text-xs">🚫 Blocked</span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Teacher Dashboard */}
              <Link
                href="/teacher"
                className="block p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Teacher Dashboard</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Course & student management
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">
                      TEACHER only
                    </span>
                    {role === "TEACHER" ? (
                      <span className="text-xs">✅ Accessible</span>
                    ) : (
                      <span className="text-xs">🚫 Blocked</span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Student Dashboard */}
              <Link
                href="/student"
                className="block p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Student Dashboard</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Learning & progress tracking
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">
                      STUDENT only
                    </span>
                    {role === "STUDENT" ? (
                      <span className="text-xs">✅ Accessible</span>
                    ) : (
                      <span className="text-xs">🚫 Blocked</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Expected Behavior */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              ⚠️ Expected Behavior
            </h2>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>
                If you click on a dashboard you <strong>don't have access to</strong>,
                you will be <strong>redirected</strong> to your role's dashboard
              </li>
              <li>
                <strong>ADMIN</strong> → Can only access <code>/admin</code>
              </li>
              <li>
                <strong>TEACHER</strong> → Can only access <code>/teacher</code>
              </li>
              <li>
                <strong>STUDENT</strong> → Can only access <code>/student</code>
              </li>
            </ul>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#18AA26] hover:bg-[#159620] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18AA26]"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

