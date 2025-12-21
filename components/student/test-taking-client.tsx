"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TestTimer } from "./test-timer";
import { TestInstructions } from "./test-instructions";
import { TestSectionNavigation } from "./test-section-navigation";
import { TestQuestionNavigation } from "./test-question-navigation";
import { TestQuestionDisplay } from "./test-question-display";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

interface Test {
  id: number;
  title: string;
  duration: number;
  sections: Section[];
}

interface Section {
  id: number;
  title: string;
  skillType: string;
  order: number;
  passage: string | null;
  imageSrc: string | null;
  audioSrc: string | null;
  questions: Question[];
}

interface Question {
  id: number;
  sectionId: number;
  questionText: string;
  order: number;
  points: number;
  options: QuestionOption[];
}

interface QuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface Answer {
  questionId: number;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
}

interface TestTakingClientProps {
  testId: number;
}

export function TestTakingClient({ testId }: TestTakingClientProps) {
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  // Hide student sidebar when test is started
  useEffect(() => {
    if (isStarted) {
      const sidebar = document.querySelector('[data-student-sidebar]');
      if (sidebar) {
        (sidebar as HTMLElement).style.display = 'none';
      }
    }

    return () => {
      const sidebar = document.querySelector('[data-student-sidebar]');
      if (sidebar) {
        (sidebar as HTMLElement).style.display = '';
      }
    };
  }, [isStarted]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/student/tests/${testId}`);
      const data = await response.json();
      setTest(data);
    } catch (error) {
      console.error("Error fetching test:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      const response = await fetch(`/api/student/tests/${testId}/start`, {
        method: "POST",
      });
      const attempt = await response.json();
      setAttemptId(attempt.id);
      setStartTime(new Date(attempt.startedAt));
      setIsStarted(true);
      setShowConfirmStart(false);
    } catch (error) {
      console.error("Error starting test:", error);
    }
  };

  const handleAnswerChange = async (
    questionId: number,
    selectedOptionId?: number,
    textAnswer?: string
  ) => {
    if (!attemptId) return;

    // Update local state
    const newAnswers = answers.filter((a) => a.questionId !== questionId);
    newAnswers.push({ questionId, selectedOptionId, textAnswer });
    setAnswers(newAnswers);

    // Get skill type from question
    const question = allQuestions.find((q) => q.id === questionId);
    const skillType = question?.section?.skillType;

    // Save to server
    try {
      await fetch(`/api/student/tests/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, selectedOptionId, textAnswer, skillType }),
      });
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const handleSubmitTest = async () => {
    if (!attemptId) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/student/tests/attempts/${attemptId}/complete`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Error submitting test:", error);
        toast.error(error.error || "Có lỗi khi nộp bài");
        setSubmitting(false);
        return;
      }

      const result = await response.json();
      toast.success("Nộp bài thành công!");

      // Keep popup open for 2 seconds, then redirect
      setTimeout(() => {
        router.push(`/student/tests/${testId}/result/${attemptId}`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Có lỗi khi nộp bài");
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmitTest();
  };

  const handleExitTest = async () => {
    if (!attemptId) return;

    setExiting(true);
    try {
      const response = await fetch(
        `/api/student/tests/attempts/${attemptId}/abandon`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        toast.success("Đã thoát bài test");
        router.push("/student/tests");
      } else {
        toast.error("Không thể thoát bài test");
      }
    } catch (error) {
      console.error("Error exiting test:", error);
      toast.error("Không thể thoát bài test");
    } finally {
      setExiting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bài test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return <div>Test not found</div>;
  }

  // Flatten all questions
  const allQuestions = test.sections.flatMap((section) =>
    section.questions.map((q) => ({ ...q, section }))
  );

  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id
  );

  const answeredCount = answers.filter(
    (a) => a.selectedOptionId || a.textAnswer
  ).length;

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);

      // Update section if moved to next section
      const newQuestion = allQuestions[newIndex];
      const newSectionIndex = test.sections.findIndex(
        (s) => s.id === newQuestion.section.id
      );
      if (newSectionIndex !== -1 && newSectionIndex !== currentSectionIndex) {
        setCurrentSectionIndex(newSectionIndex);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);

      // Update section if moved to previous section
      const newQuestion = allQuestions[newIndex];
      const newSectionIndex = test.sections.findIndex(
        (s) => s.id === newQuestion.section.id
      );
      if (newSectionIndex !== -1 && newSectionIndex !== currentSectionIndex) {
        setCurrentSectionIndex(newSectionIndex);
      }
    }
  };

  const handleQuestionSelect = (questionId: number) => {
    const index = allQuestions.findIndex((q) => q.id === questionId);
    if (index !== -1) {
      setCurrentQuestionIndex(index);

      // Update section
      const question = allQuestions[index];
      const sectionIndex = test.sections.findIndex(
        (s) => s.id === question.section.id
      );
      if (sectionIndex !== -1 && sectionIndex !== currentSectionIndex) {
        setCurrentSectionIndex(sectionIndex);
      }
    }
  };

  const handleSectionSelect = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);

    // Jump to first question of selected section
    const sectionStartIndex = test.sections
      .slice(0, sectionIndex)
      .reduce((sum, s) => sum + s.questions.length, 0);
    setCurrentQuestionIndex(sectionStartIndex);
  };

  // Show start confirmation dialog
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {test.title}
          </h1>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-700">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>Thời gian: {test.duration} phút</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>Tổng số câu hỏi: {allQuestions.length}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>
                Kỹ năng:{" "}
                {[...new Set(test.sections.map((s) => s.skillType))].join(
                  ", "
                )}
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-yellow-900 mb-2">
              Lưu ý quan trọng:
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li>• Khi bắt đầu, đồng hồ đếm ngược sẽ chạy</li>
              <li>• Bạn không thể tạm dừng sau khi bắt đầu</li>
              <li>• Khi hết thời gian, bài test sẽ tự động nộp</li>
              <li>• Đảm bảo kết nối internet ổn định</li>
            </ul>
          </div>

          <Button
            onClick={() => setShowConfirmStart(true)}
            className="w-full"
            size="lg"
          >
            Bắt đầu làm bài
          </Button>

          <AlertDialog open={showConfirmStart} onOpenChange={setShowConfirmStart}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận bắt đầu làm bài?</AlertDialogTitle>
                <AlertDialogDescription>
                  Sau khi bắt đầu, bạn sẽ có {test.duration} phút để hoàn thành
                  bài test. Đồng hồ đếm ngược sẽ bắt đầu ngay lập tức.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleStartTest}>
                  Bắt đầu
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  // Main test taking interface with 3-column layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Đã trả lời: {answeredCount} / {allQuestions.length}
              </span>
              <Button
                onClick={() => setShowConfirmExit(true)}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Thoát
              </Button>
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                variant="default"
                disabled={submitting}
              >
                {submitting ? "Đang nộp..." : "Nộp bài"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left - Question Display (Main Content) */}
          <div className="col-span-8">
            {currentQuestion && (
              <TestQuestionDisplay
                section={currentQuestion.section}
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={allQuestions.length}
                answer={currentAnswer}
                onAnswerChange={handleAnswerChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hasNext={currentQuestionIndex < allQuestions.length - 1}
                hasPrevious={currentQuestionIndex > 0}
              />
            )}
          </div>

          {/* Right Sidebar - Timer, Navigation & Instructions */}
          <div className="col-span-4 space-y-4">
            {/* Timer */}
            {startTime && (
              <TestTimer
                duration={test.duration}
                startTime={startTime}
                onTimeUp={handleTimeUp}
                isStarted={isStarted}
                isPaused={submitting}
              />
            )}

            {/* Section Navigation */}
            {test.sections.length > 1 && (
              <TestSectionNavigation
                sections={test.sections}
                answers={answers}
                currentSectionIndex={currentSectionIndex}
                onSectionSelect={handleSectionSelect}
              />
            )}

            {/* Question Navigation */}
            <TestQuestionNavigation
              sections={test.sections}
              answers={answers}
              currentQuestionId={currentQuestion?.id || 0}
              currentSectionIndex={currentSectionIndex}
              onQuestionSelect={handleQuestionSelect}
            />

            {/* Instructions */}
            <TestInstructions />
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showConfirmSubmit} onOpenChange={(open) => !submitting && setShowConfirmSubmit(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {submitting ? "Đang nộp bài..." : "Xác nhận nộp bài?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Vui lòng đợi, hệ thống đang xử lý bài làm của bạn...</span>
                </div>
              ) : (
                <>
                  Bạn đã trả lời {answeredCount} / {allQuestions.length} câu hỏi.
                  {answeredCount < allQuestions.length && (
                    <span className="block mt-2 text-orange-600">
                      Bạn còn {allQuestions.length - answeredCount} câu chưa trả
                      lời. Bạn có chắc chắn muốn nộp bài?
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Tiếp tục làm bài</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitTest} disabled={submitting}>
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Thoát bài test?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <div>
                  Nếu bạn thoát, <strong>toàn bộ tiến độ sẽ bị xóa</strong> và bạn sẽ phải làm lại từ đầu.
                </div>
                <div className="text-orange-600 font-medium">
                  Bạn đã trả lời {answeredCount} / {allQuestions.length} câu hỏi.
                </div>
                <div>Bạn có chắc chắn muốn thoát?</div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục làm bài</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExitTest}
              disabled={exiting}
              className="bg-red-600 hover:bg-red-700"
            >
              {exiting ? "Đang thoát..." : "Thoát và xóa tiến độ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

