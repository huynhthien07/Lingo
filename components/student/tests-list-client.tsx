"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  BookOpen,
  Play,
  CheckCircle2,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Test {
  id: number;
  title: string;
  description: string | null;
  imageSrc: string | null;
  testType: string;
  examType: string;
  duration: number;
  totalQuestions: number;
  attemptCount: number;
  lastAttempt: any;
  canRetake: boolean;
  sections: any[];
}

export function TestsListClient() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterExam, setFilterExam] = useState<string>("ALL");

  useEffect(() => {
    fetchTests();
  }, [filterType, filterExam]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "ALL") params.append("testType", filterType);
      if (filterExam !== "ALL") params.append("examType", filterExam);

      const response = await fetch(`/api/student/tests?${params.toString()}`);
      const data = await response.json();
      setTests(data.tests || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (testId: number) => {
    router.push(`/student/tests/${testId}`);
  };

  const filteredTests = tests.filter((test) =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PRACTICE: "Luyện tập",
      MOCK_TEST: "Thi thử",
      FULL_TEST: "Bài thi đầy đủ",
      ADMISSION_TEST: "Kiểm tra đầu vào",
      SPEAKING_TEST: "Thi Speaking",
      WRITING_TEST: "Thi Writing",
    };
    return labels[type] || type;
  };

  const getTestTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PRACTICE: "bg-blue-100 text-blue-800",
      MOCK_TEST: "bg-purple-100 text-purple-800",
      FULL_TEST: "bg-green-100 text-green-800",
      ADMISSION_TEST: "bg-orange-100 text-orange-800",
      SPEAKING_TEST: "bg-pink-100 text-pink-800",
      WRITING_TEST: "bg-indigo-100 text-indigo-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getSkillTypes = (sections: any[]) => {
    const skills = sections.map((s) => s.skillType);
    return [...new Set(skills)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách bài test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bài Test</h1>
        <p className="text-gray-600 mt-2">
          Làm bài test để đánh giá và nâng cao trình độ của bạn
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Tìm kiếm bài test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">Tất cả loại</option>
          <option value="PRACTICE">Luyện tập</option>
          <option value="MOCK_TEST">Thi thử</option>
          <option value="FULL_TEST">Bài thi đầy đủ</option>
        </select>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{test.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {test.description || "Không có mô tả"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getTestTypeColor(test.testType)}>
                  {getTestTypeLabel(test.testType)}
                </Badge>
                <Badge variant="outline">{test.examType}</Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{test.duration} phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{test.totalQuestions} câu hỏi</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {getSkillTypes(test.sections).join(", ")}
                  </span>
                </div>
              </div>

              {test.attemptCount > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">
                      Đã làm {test.attemptCount} lần
                    </span>
                  </div>
                  {test.lastAttempt && test.lastAttempt.bandScore && (
                    <p className="text-sm text-gray-600 mt-1">
                      Điểm gần nhất: {test.lastAttempt.bandScore}
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={() => handleStartTest(test.id)}
                className="w-full"
                variant={test.attemptCount > 0 ? "outline" : "default"}
              >
                <Play className="h-4 w-4 mr-2" />
                {test.attemptCount > 0 ? "Làm lại" : "Bắt đầu"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy bài test
          </h3>
          <p className="text-gray-600">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      )}
    </div>
  );
}

