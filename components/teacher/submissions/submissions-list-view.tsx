"use client";

import { useState, useEffect } from "react";
import { Search, Filter, FileText, Mic, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

type SubmissionType = "writing" | "speaking";
type SubmissionStatus = "PENDING" | "GRADING" | "GRADED" | "RETURNED";

interface Submission {
  id: number;
  userId: string;
  challengeId: number;
  submittedAt: string;
  status: SubmissionStatus;
  overallBandScore: number | null;
  user: {
    userName: string | null;
    email: string;
    imageUrl: string | null;
  };
  challenge: {
    question: string;
    lesson: {
      title: string;
      unit: {
        title: string;
        course: {
          title: string;
        };
      };
    };
  };
  teacher: {
    userName: string | null;
  } | null;
}

export function SubmissionsListView() {
  const [activeTab, setActiveTab] = useState<SubmissionType>("writing");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchSubmissions();
  }, [activeTab, statusFilter, page]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);

      const endpoint =
        activeTab === "writing"
          ? "/api/teacher/submissions/writing"
          : "/api/teacher/submissions/speaking";

      const response = await fetch(`${endpoint}?${params}`);
      const data = await response.json();

      setSubmissions(data.submissions || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchSubmissions();
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    const badges = {
      PENDING: "bg-yellow-100 text-yellow-800",
      GRADING: "bg-blue-100 text-blue-800",
      GRADED: "bg-green-100 text-green-800",
      RETURNED: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    const icons = {
      PENDING: Clock,
      GRADING: Clock,
      GRADED: CheckCircle,
      RETURNED: CheckCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submission Review</h1>
        <p className="text-gray-600 mt-2">
          Review and grade student writing and speaking submissions
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => {
              setActiveTab("writing");
              setPage(1);
            }}
            className={`pb-4 border-b-2 flex items-center gap-2 ${
              activeTab === "writing"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="w-5 h-5" />
            Writing Submissions
          </button>
          <button
            onClick={() => {
              setActiveTab("speaking");
              setPage(1);
            }}
            className={`pb-4 border-b-2 flex items-center gap-2 ${
              activeTab === "speaking"
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Mic className="w-5 h-5" />
            Speaking Submissions
          </button>
        </nav>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="GRADING">Grading</option>
          <option value="GRADED">Graded</option>
          <option value="RETURNED">Returned</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Total Submissions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {submissions.filter((s) => s.status === "PENDING").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Grading</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {submissions.filter((s) => s.status === "GRADING").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Graded</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {submissions.filter((s) => s.status === "GRADED" || s.status === "RETURNED").length}
          </p>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">No submissions found</p>
            <p className="text-sm mt-2">
              {activeTab === "writing"
                ? "Writing submissions will appear here"
                : "Speaking submissions will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course / Lesson
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Band Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {(submission.user.userName || submission.user.email)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {submission.user.userName || "Student"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {submission.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {submission.challenge.question}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {submission.challenge.lesson.unit.course.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {submission.challenge.lesson.title}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          submission.status
                        )}`}
                      >
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.overallBandScore
                        ? submission.overallBandScore.toFixed(1)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/teacher/submissions/${activeTab}/${submission.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, total)} of {total} submissions
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= total}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

