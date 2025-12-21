"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Mic, Clock, CheckCircle2, XCircle, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LearningHistoryClientProps {
  writingSubmissions: any[];
  speakingSubmissions: any[];
  testSubmissions?: any[];
}

export default function LearningHistoryClient({
  writingSubmissions,
  speakingSubmissions,
  testSubmissions = [],
}: LearningHistoryClientProps) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "GRADED" | "PENDING">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "EXERCISE" | "TEST">("ALL");

  const filterSubmissions = (submissions: any[]) => {
    let filtered = submissions;

    // Filter by status
    if (statusFilter === "GRADED") {
      filtered = filtered.filter(s => s.status === "GRADED");
    } else if (statusFilter === "PENDING") {
      filtered = filtered.filter(s => s.status === "PENDING");
    }

    return filtered;
  };

  // Combine exercise and test submissions
  const allWritingSubmissions = [
    ...writingSubmissions.map(s => ({ ...s, type: "EXERCISE" })),
    ...testSubmissions.filter(s => s.skillType === "WRITING").map(s => ({ ...s, type: "TEST" }))
  ];

  const allSpeakingSubmissions = [
    ...speakingSubmissions.map(s => ({ ...s, type: "EXERCISE" })),
    ...testSubmissions.filter(s => s.skillType === "SPEAKING").map(s => ({ ...s, type: "TEST" }))
  ];

  // Apply filters
  const filteredWriting = typeFilter === "TEST"
    ? filterSubmissions(allWritingSubmissions.filter(s => s.type === "TEST"))
    : typeFilter === "EXERCISE"
    ? filterSubmissions(allWritingSubmissions.filter(s => s.type === "EXERCISE"))
    : filterSubmissions(allWritingSubmissions);

  const filteredSpeaking = typeFilter === "TEST"
    ? filterSubmissions(allSpeakingSubmissions.filter(s => s.type === "TEST"))
    : typeFilter === "EXERCISE"
    ? filterSubmissions(allSpeakingSubmissions.filter(s => s.type === "EXERCISE"))
    : filterSubmissions(allSpeakingSubmissions);

  const getStatusBadge = (status: string) => {
    if (status === "GRADED") {
      return <Badge className="bg-green-500">Đã chấm</Badge>;
    }
    return <Badge variant="secondary">Chờ chấm</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử học tập</h1>
          <p className="text-gray-600">Xem lại các bài tập Writing và Speaking đã nộp</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Type Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Loại bài:</p>
            <div className="flex gap-2">
              <Button
                variant={typeFilter === "ALL" ? "default" : "outline"}
                onClick={() => setTypeFilter("ALL")}
                size="sm"
              >
                Tất cả
              </Button>
              <Button
                variant={typeFilter === "EXERCISE" ? "default" : "outline"}
                onClick={() => setTypeFilter("EXERCISE")}
                size="sm"
              >
                Bài tập
              </Button>
              <Button
                variant={typeFilter === "TEST" ? "default" : "outline"}
                onClick={() => setTypeFilter("TEST")}
                size="sm"
              >
                Bài test
              </Button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Trạng thái:</p>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "ALL" ? "default" : "outline"}
                onClick={() => setStatusFilter("ALL")}
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Tất cả
              </Button>
              <Button
                variant={statusFilter === "GRADED" ? "default" : "outline"}
                onClick={() => setStatusFilter("GRADED")}
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Đã chấm
              </Button>
              <Button
                variant={statusFilter === "PENDING" ? "default" : "outline"}
                onClick={() => setStatusFilter("PENDING")}
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Chờ chấm
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="writing" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="writing">
              <FileText className="h-4 w-4 mr-2" />
              Writing ({filteredWriting.length})
            </TabsTrigger>
            <TabsTrigger value="speaking">
              <Mic className="h-4 w-4 mr-2" />
              Speaking ({filteredSpeaking.length})
            </TabsTrigger>
          </TabsList>

          {/* Writing Tab */}
          <TabsContent value="writing" className="mt-6">
            {filteredWriting.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Chưa có bài Writing nào</p>
                  <p className="text-sm mt-1">Các bài Writing bạn nộp sẽ hiển thị ở đây</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Table Header */}
                <div className="bg-gray-100 rounded-lg p-4 hidden md:grid md:grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-4">Bài tập</div>
                  <div className="col-span-2">Khóa học</div>
                  <div className="col-span-2">Ngày nộp</div>
                  <div className="col-span-1 text-center">Số từ</div>
                  <div className="col-span-1 text-center">Điểm</div>
                  <div className="col-span-1 text-center">Trạng thái</div>
                  <div className="col-span-1 text-right">Thao tác</div>
                </div>

                {/* Table Rows */}
                {filteredWriting.map((submission) => {
                  const isTest = submission.type === "TEST";
                  const title = isTest
                    ? (submission.testTitle || "Test Question")
                    : (submission.challenge?.question || "No question");
                  const subtitle = isTest
                    ? (submission.questionText || "Writing Test")
                    : "Writing Exercise";

                  return (
                  <Card key={`${submission.type}-${submission.id}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-12 gap-4 items-center">
                        {/* Title */}
                        <div className="col-span-12 md:col-span-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 ${isTest ? "bg-green-100" : "bg-blue-100"} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <FileText className={`h-5 w-5 ${isTest ? "text-green-600" : "text-blue-600"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {title}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">
                                {subtitle}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Course/Type */}
                        <div className="col-span-6 md:col-span-2">
                          <Badge variant={isTest ? "default" : "secondary"}>
                            {isTest ? "Bài test" : "Bài tập"}
                          </Badge>
                        </div>

                        {/* Date */}
                        <div className="col-span-6 md:col-span-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4 md:hidden" />
                            <span>{new Date(isTest ? submission.createdAt : submission.submittedAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>

                        {/* Word Count (only for exercises) */}
                        <div className="col-span-4 md:col-span-1 text-center">
                          {!isTest && submission.wordCount ? (
                            <span className="text-sm font-medium text-gray-900">
                              {submission.wordCount}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>

                        {/* Score */}
                        <div className="col-span-4 md:col-span-1 text-center">
                          {submission.status === "GRADED" && submission.overallBandScore ? (
                            <span className="text-lg font-bold text-blue-600">
                              {submission.overallBandScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>

                        {/* Status */}
                        <div className="col-span-4 md:col-span-1 text-center">
                          {getStatusBadge(submission.status)}
                        </div>

                        {/* Action */}
                        <div className="col-span-12 md:col-span-1 text-right">
                          <Link href={isTest ? `/student/learning-history/test/${submission.id}` : `/student/learning-history/writing/${submission.id}`}>
                            <Button size="sm" variant="outline" className="w-full md:w-auto">
                              <Eye className="h-4 w-4 md:mr-0" />
                              <span className="md:hidden ml-2">Xem chi tiết</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Speaking Tab */}
          <TabsContent value="speaking" className="mt-6">
            {filteredSpeaking.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <Mic className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Chưa có bài Speaking nào</p>
                  <p className="text-sm mt-1">Các bài Speaking bạn nộp sẽ hiển thị ở đây</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Table Header */}
                <div className="bg-gray-100 rounded-lg p-4 hidden md:grid md:grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                  <div className="col-span-4">Bài tập</div>
                  <div className="col-span-2">Khóa học</div>
                  <div className="col-span-2">Ngày nộp</div>
                  <div className="col-span-1 text-center">Thời lượng</div>
                  <div className="col-span-1 text-center">Điểm</div>
                  <div className="col-span-1 text-center">Trạng thái</div>
                  <div className="col-span-1 text-right">Thao tác</div>
                </div>

                {/* Table Rows */}
                {filteredSpeaking.map((submission) => {
                  const isTest = submission.type === "TEST";
                  const title = isTest
                    ? (submission.testTitle || "Test Question")
                    : (submission.challenge?.question || "No question");
                  const subtitle = isTest
                    ? (submission.questionText || "Speaking Test")
                    : "Speaking Exercise";

                  return (
                  <Card key={`${submission.type}-${submission.id}`} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-12 gap-4 items-center">
                        {/* Title */}
                        <div className="col-span-12 md:col-span-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 ${isTest ? "bg-blue-100" : "bg-red-100"} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Mic className={`h-5 w-5 ${isTest ? "text-blue-600" : "text-red-600"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {title}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">
                                {subtitle}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Course/Type */}
                        <div className="col-span-6 md:col-span-2">
                          <Badge variant={isTest ? "default" : "secondary"}>
                            {isTest ? "Bài test" : "Bài tập"}
                          </Badge>
                        </div>

                        {/* Date */}
                        <div className="col-span-6 md:col-span-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4 md:hidden" />
                            <span>{new Date(isTest ? submission.createdAt : submission.submittedAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>

                        {/* Duration (only for exercises) */}
                        <div className="col-span-4 md:col-span-1 text-center">
                          {!isTest && submission.duration ? (
                            <span className="text-sm font-medium text-gray-900">
                              {Math.floor(submission.duration / 60)}:{(submission.duration % 60).toString().padStart(2, '0')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>

                        {/* Score */}
                        <div className="col-span-4 md:col-span-1 text-center">
                          {submission.status === "GRADED" && submission.overallBandScore ? (
                            <span className="text-lg font-bold text-blue-600">
                              {submission.overallBandScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>

                        {/* Status */}
                        <div className="col-span-4 md:col-span-1 text-center">
                          {getStatusBadge(submission.status)}
                        </div>

                        {/* Action */}
                        <div className="col-span-12 md:col-span-1 text-right">
                          <Link href={isTest ? `/student/learning-history/test/${submission.id}` : `/student/learning-history/speaking/${submission.id}`}>
                            <Button size="sm" variant="outline" className="w-full md:w-auto">
                              <Eye className="h-4 w-4 md:mr-0" />
                              <span className="md:hidden ml-2">Xem chi tiết</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

