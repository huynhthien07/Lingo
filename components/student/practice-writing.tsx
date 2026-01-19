"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Send, FileText, CheckCircle2, Clock, Save, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { playFinishSound } from "@/lib/utils/sound";

interface WritingPracticeProps {
  challenge: any;
  allChallenges: any[];
  allProgress: any[];
  courseId: number;
  lessonId: number;
}

export function WritingPractice({ challenge, allChallenges, allProgress, courseId, lessonId }: WritingPracticeProps) {
  console.log("WritingPractice component loaded", { challenge, courseId, lessonId });

  const router = useRouter();
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const currentChallengeIndex = allChallenges.findIndex(c => c.id === challenge.id);
  const totalChallenges = allChallenges.length;
  const completedChallengesCount = allChallenges.filter(c =>
    allProgress.some(p => p.challengeId === c.id && p.completed)
  ).length;

  // Hide student sidebar on mount
  useEffect(() => {
    const sidebar = document.querySelector('[data-student-sidebar]');
    if (sidebar) {
      (sidebar as HTMLElement).style.display = 'none';
    }

    return () => {
      const sidebar = document.querySelector('[data-student-sidebar]');
      if (sidebar) {
        (sidebar as HTMLElement).style.display = '';
      }
    };
  }, []);

  // Calculate word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Check if already submitted
  useEffect(() => {
    const checkSubmission = async () => {
      const response = await fetch(`/api/student/submissions/writing?challengeId=${challenge.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.submission) {
          setSubmission(data.submission);
          setSubmitted(true);
          setContent(data.submission.content);
        }
      }
    };
    checkSubmission();
  }, [challenge.id]);

  const handleSubmit = async () => {
    if (wordCount < 10) {
      toast.error("Bài viết phải có ít nhất 10 từ!");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/student/submissions/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          content,
          wordCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmission(data.submission);
        setSubmitted(true);
        toast.success("Đã nộp bài thành công!");

        // Refresh page to update progress
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Có lỗi xảy ra. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error submitting writing:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/student/courses/${courseId}/lessons/${lessonId}`)}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Thoát
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant={submitted ? "default" : "secondary"}>
                {submitted ? "Đã nộp" : "Chưa nộp"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Bài tập {currentChallengeIndex + 1}/{totalChallenges} - Writing
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {completedChallengesCount}/{totalChallenges} bài tập hoàn thành
                </span>
              </div>
              <Progress value={(completedChallengesCount / totalChallenges) * 100} className="h-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Content with Sidebar */}
      <div className="flex-1 overflow-y-auto flex">
        {/* Left Sidebar - All Challenges */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Danh sách bài tập</h3>
            <div className="space-y-2">
              {allChallenges.map((ch: any, idx: number) => {
                const isCompleted = allProgress.some(p => p.challengeId === ch.id && p.completed);
                const isCurrent = idx === currentChallengeIndex;

                return (
                  <Link
                    key={ch.id}
                    href={`/student/courses/${courseId}/lessons/${lessonId}/practice/${ch.id}`}
                    className={`block p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500'
                        : isCompleted
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : isCurrent ? (
                          <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Bài tập {idx + 1}
                        </p>
                        <p className="text-xs text-gray-500">
                          {ch.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-full mx-auto px-4 py-4">
            {/* Exercise Title */}
            {challenge.question && (
              <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900">{challenge.question}</h2>
              </div>
            )}

            {/* Instructions (from questions.text) */}
            {challenge.questions && challenge.questions.length > 0 && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-3">
                <h3 className="font-semibold text-base mb-2 text-blue-900">📋 Đề bài</h3>
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                  {challenge.questions.map((q: any, idx: number) => (
                    <div key={q.id} className={idx > 0 ? "mt-3" : ""}>
                      <p dangerouslySetInnerHTML={{ __html: q.text }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passage */}
            {challenge.passage && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                <h3 className="font-semibold text-base mb-2 text-gray-700">📄 Đoạn văn</h3>
                <div
                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed text-base whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: challenge.passage }}
                />
              </div>
            )}

            {/* Audio */}
            {challenge.audioSrc && (
              <div className="mb-3">
                <audio controls className="w-full">
                  <source src={challenge.audioSrc} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Image */}
            {challenge.imageSrc && (
              <div className="mb-3">
                <img
                  src={challenge.imageSrc}
                  alt="Challenge context"
                  className="w-full rounded-lg border"
                />
              </div>
            )}

            {/* Writing Area */}
            <div className="bg-white rounded-lg border p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base">✍️ Bài viết của bạn</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{wordCount} từ</span>
                </div>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập bài viết của bạn tại đây..."
                className="min-h-[400px] text-base"
                disabled={submitted}
              />
            </div>

            {/* Submit Button */}
            {!submitted && (
              <Button onClick={handleSubmit} disabled={submitting || wordCount < 10} size="lg" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Đang nộp bài..." : "Nộp bài"}
              </Button>
            )}

            {/* Submission Status */}
            {submitted && submission && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300 p-6">
                <div className="text-center mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Đã nộp bài thành công!</h3>
                  <p className="text-gray-600 mb-4">
                    Bài viết của bạn đã được gửi đến giáo viên. Vui lòng chờ giáo viên chấm bài.
                  </p>
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Số từ</p>
                    <p className="text-2xl font-bold text-blue-600">{wordCount} từ</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Nộp lúc: {new Date(submission.submittedAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setShowCompletionModal(true);
                    confetti({
                      particleCount: 100,
                      spread: 70,
                      origin: { y: 0.6 },
                      colors: ['#10B981', '#3B82F6', '#F59E0B']
                    });
                    playFinishSound();
                  }}
                  className="w-full"
                  size="lg"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Hoàn thành bài tập
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <Trophy className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Hoàn thành bài tập! 🎉
              </h2>
              <p className="text-gray-600 mb-4">
                Bài viết của bạn đã được nộp thành công
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Số từ</p>
                <p className="text-3xl font-bold text-blue-600">
                  {wordCount} từ
                </p>
                <p className="text-sm text-gray-600 mt-3">
                  Giáo viên sẽ chấm bài và gửi kết quả cho bạn
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => {
                setShowCompletionModal(false);
                router.push(`/student/courses/${courseId}/lessons/${lessonId}`);
              }} className="w-full">
                Quay lại bài học
              </Button>
              <Button variant="outline" onClick={() => {
                setShowCompletionModal(false);
                router.push(`/student/courses/${courseId}`);
              }} className="w-full">
                Quay lại khóa học
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

