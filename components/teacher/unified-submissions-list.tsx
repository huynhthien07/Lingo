"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Mic, Search, User, Calendar, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type SubmissionType = "EXERCISE" | "TEST";
type SkillType = "WRITING" | "SPEAKING";

interface UnifiedSubmission {
  id: number;
  type: SubmissionType; // EXERCISE or TEST
  skillType: SkillType;
  userId: string;
  studentName: string | null;
  studentEmail: string;
  
  // For exercises
  challengeId?: number;
  challengeTitle?: string;
  unitTitle?: string;
  lessonTitle?: string;
  
  // For tests
  testId?: number;
  testTitle?: string;
  attemptId?: number;
  questionText?: string;
  
  // Common fields
  content?: string; // Writing content or audio URL
  submittedAt: Date;
  status: "PENDING" | "GRADING" | "GRADED" | "RETURNED";
  overallBandScore: number | null;
  gradedAt: Date | null;
}

export function UnifiedSubmissionsList() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<SubmissionType | "ALL">("ALL");
  const [skillFilter, setSkillFilter] = useState<SkillType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [submissions, setSubmissions] = useState<UnifiedSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchSubmissions();
  }, [page, typeFilter, skillFilter, statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (skillFilter !== "ALL") params.append("skillType", skillFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);

      console.log("Fetching with params:", params.toString());
      console.log("URL:", `/api/teacher/submissions/unified?${params}`);

      const response = await fetch(`/api/teacher/submissions/unified?${params}`);

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        toast.error("Failed to load submissions");
        setLoading(false);
        return;
      }

      const data = await response.json();

      console.log("API Response:", data);
      console.log("Submissions count:", data.submissions?.length);
      console.log("Total:", data.total);

      setSubmissions(data.submissions || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchSubmissions();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Chờ chấm", className: "bg-yellow-500" },
      GRADING: { label: "Đang chấm", className: "bg-blue-500" },
      GRADED: { label: "Đã chấm", className: "bg-green-500" },
      RETURNED: { label: "Đã trả", className: "bg-gray-500" },
    };
    const variant = variants[status] || variants.PENDING;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleViewSubmission = (submission: UnifiedSubmission) => {
    // Use unified grading page for both exercise and test
    const skillPath = submission.skillType.toLowerCase();
    const typePrefix = submission.type === "TEST" ? "test-" : "";
    router.push(`/teacher/submissions/${typePrefix}${skillPath}/${submission.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chấm bài</h1>
        <p className="text-gray-600 mt-1">
          Quản lý và chấm điểm bài tập Writing/Speaking và bài test
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Type and Skill Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Loại bài
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setTypeFilter("ALL"); setPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      typeFilter === "ALL"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => { setTypeFilter("EXERCISE"); setPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      typeFilter === "EXERCISE"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Bài tập
                  </button>
                  <button
                    onClick={() => { setTypeFilter("TEST"); setPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      typeFilter === "TEST"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Bài test
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Kỹ năng
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSkillFilter("ALL"); setPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      skillFilter === "ALL"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => { setSkillFilter("WRITING"); setPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      skillFilter === "WRITING"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-1" />
                    Writing
                  </button>
                  <button
                    onClick={() => { setSkillFilter("SPEAKING"); setPage(1); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      skillFilter === "SPEAKING"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Mic className="w-4 h-4 inline mr-1" />
                    Speaking
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Status Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên học viên, email..."
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
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ chấm</option>
                <option value="GRADING">Đang chấm</option>
                <option value="GRADED">Đã chấm</option>
                <option value="RETURNED">Đã trả</option>
              </select>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Đang tải...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">Không tìm thấy bài nộp</p>
              <p className="text-sm mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Học viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bài tập/Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nộp lúc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={`${submission.type}-${submission.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {submission.skillType === "WRITING" ? (
                            <FileText className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Mic className="w-4 h-4 text-purple-600" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.skillType === "WRITING" ? "Writing" : "Speaking"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {submission.type === "EXERCISE" ? "Bài tập" : "Bài test"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {submission.studentName || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">{submission.studentEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900 max-w-xs">
                            {submission.type === "EXERCISE" ? (
                              <div>
                                <div className="font-medium">{submission.challengeTitle || "N/A"}</div>
                                <div className="text-xs text-gray-500">
                                  {submission.lessonTitle} - {submission.unitTitle}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="font-medium">{submission.testTitle || "N/A"}</div>
                                {submission.questionText && (
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {submission.questionText}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(submission.submittedAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.overallBandScore
                            ? `${submission.overallBandScore.toFixed(1)}`
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          {submission.status === "GRADED" ? "Xem" : "Chấm điểm"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Hiển thị {(page - 1) * limit + 1} đến {Math.min(page * limit, total)} trong tổng số {total} kết quả
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Trước
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-2"
            >
              Sau
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

