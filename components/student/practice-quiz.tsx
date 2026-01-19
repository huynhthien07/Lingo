"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Star,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AudioPlayer } from "@/components/ui/audio-player";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { playCorrectSound, playIncorrectSound, playFinishSound } from "@/lib/utils/sound";
import { QuestionRenderer } from "./question-inputs/question-renderer";
import type { QuestionType } from "@/lib/utils/question-type-mapper";
import type { QuestionAnswer } from "@/shared/types/questionMetadata";

interface PracticeQuizProps {
  challenge: any;
  allChallenges: any[];
  allProgress: any[];
  courseId: number;
  lessonId: number;
}

export function PracticeQuiz({ challenge, allChallenges, allProgress, courseId, lessonId }: PracticeQuizProps) {
  const router = useRouter();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(
    allChallenges.findIndex(c => c.id === challenge.id)
  );

  // ✅ NEW: Support all question types
  const [answers, setAnswers] = useState<Record<number, QuestionAnswer>>({});
  const [questionResults, setQuestionResults] = useState<Record<number, any>>({});
  const [allSubmitted, setAllSubmitted] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentChallenge = allChallenges[currentChallengeIndex];
  const questions = currentChallenge.questions || [];
  const totalQuestions = questions.length;

  // Calculate progress based on answered questions
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Calculate overall lesson progress
  const completedChallengesCount = allChallenges.filter(c =>
    allProgress.some(p => p.challengeId === c.id && p.completed)
  ).length;
  const totalChallenges = allChallenges.length;

  // Check if current challenge is already completed
  const isCurrentChallengeCompleted = allProgress.some(
    p => p.challengeId === currentChallenge.id && p.completed
  );

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

  // ✅ NEW: Check if a question is answered correctly (from server response)
  const isQuestionCorrect = (questionId: number) => {
    if (!allSubmitted) return null;
    return questionResults[questionId]?.isCorrect || false;
  };

  // ✅ NEW: Handle answer change for any question type
  const handleAnswerChange = (questionId: number, answer: QuestionAnswer) => {
    if (allSubmitted) return; // Can't change after submit

    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  // ✅ NEW: Handle submit all answers (server-side validation)
  const handleSubmitAll = async () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter((q: any) => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      toast.error(`Vui lòng trả lời tất cả ${unansweredQuestions.length} câu hỏi còn lại!`);
      return;
    }

    try {
      // Submit to server for validation
      const response = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: currentChallenge.id,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answers");
      }

      const data = await response.json();

      // Update state with server response
      setScore(data.score);
      setCorrectCount(data.correctCount);
      setPointsEarned(data.pointsEarned);
      setAllSubmitted(true);

      // Store question results for feedback
      const results: Record<number, any> = {};
      data.questionResults.forEach((result: any) => {
        results[result.questionId] = result;
      });
      setQuestionResults(results);

      // Show appropriate message based on score
      const scorePercentage = (data.score / 10) * 100;
      if (data.correctCount === totalQuestions) {
        toast.success(`Hoàn hảo! Bạn đã trả lời đúng tất cả ${totalQuestions} câu! 🎉`);
        playCorrectSound();
      } else if (scorePercentage >= 80) {
        toast.success(`Tốt lắm! Điểm: ${data.score}/10 (${data.correctCount}/${totalQuestions} câu đúng hoàn toàn)`);
        playCorrectSound();
      } else if (scorePercentage >= 50) {
        toast.info(`Khá tốt! Điểm: ${data.score}/10 (${data.correctCount}/${totalQuestions} câu đúng hoàn toàn)`);
        playIncorrectSound();
      } else {
        toast.info(`Cần cố gắng thêm! Điểm: ${data.score}/10 (${data.correctCount}/${totalQuestions} câu đúng hoàn toàn)`);
        playIncorrectSound();
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      toast.error("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!");
    }
  };

  // Handle reset
  const handleReset = () => {
    if (confirm("Bạn có chắc muốn làm lại bài tập? Tiến độ hiện tại sẽ bị xóa.")) {
      setAnswers({});
      setQuestionResults({});
      setAllSubmitted(false);
      setChallengeCompleted(false);
      setScore(0);
      setCorrectCount(0);
      toast.info("Đã reset bài tập!");
    }
  };

  // ✅ NEW: Handle complete challenge (already submitted in handleSubmitAll)
  const handleComplete = () => {
    if (!allSubmitted) {
      toast.error("Vui lòng nộp bài trước khi hoàn thành!");
      return;
    }

    setChallengeCompleted(true);

    if (lessonCompleted) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
      });
      playFinishSound();
    } else {
      playCorrectSound();
    }
  };

  // Handle exit with confirmation
  const handleExit = () => {
    const hasProgress = Object.keys(answers).length > 0;
    if (hasProgress && !challengeCompleted) {
      setShowExitConfirm(true);
    } else {
      router.push(`/student/courses/${courseId}/lessons/${lessonId}`);
    }
  };

  const confirmExit = () => {
    router.push(`/student/courses/${courseId}/lessons/${lessonId}`);
  };

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bài tập này chưa có câu hỏi.</p>
          <Link href={`/student/courses/${courseId}/lessons/${lessonId}`}>
            <Button>Quay lại bài học</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Xác nhận thoát</h3>
            <p className="text-gray-600 mb-6">Bạn có muốn lưu tiến độ hiện tại không?</p>
            <div className="flex gap-3">
              <Button variant="secondaryOutline" onClick={() => setShowExitConfirm(false)} className="flex-1">
                Hủy
              </Button>
              <Button onClick={() => confirmExit()} className="flex-1">
                Thoát
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Completion Modal */}
      {challengeCompleted && !lessonCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Hoàn thành bài tập! 🎉
              </h2>
              <p className="text-gray-600 mb-4">
                Bạn đã hoàn thành bài tập này
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Điểm số</p>
                <p className="text-4xl font-bold text-blue-600">
                  {correctCount}/{totalQuestions}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Điểm: {score}/10
                </p>
                <p className="text-sm text-green-600 mt-2 font-semibold">
                  +{pointsEarned} điểm
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">Tiến độ bài học</p>
                <p className="text-lg font-semibold text-gray-900">
                  {isCurrentChallengeCompleted ? completedChallengesCount : completedChallengesCount + 1}/{totalChallenges} bài tập
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {currentChallengeIndex < allChallenges.length - 1 ? (
                <Button
                  onClick={() => {
                    const nextChallenge = allChallenges[currentChallengeIndex + 1];
                    router.push(`/student/courses/${courseId}/lessons/${lessonId}/practice/${nextChallenge.id}`);
                  }}
                  className="w-full"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Bài tập tiếp theo
                </Button>
              ) : (
                <Button onClick={() => router.push(`/student/courses/${courseId}/lessons/${lessonId}`)} className="w-full">
                  Quay lại bài học
                </Button>
              )}
              <Button variant="secondaryOutline" onClick={handleReset} className="w-full">
                Làm lại bài tập này
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Completion Modal */}
      {lessonCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Xuất sắc! 🎊
              </h2>
              <p className="text-gray-600 mb-4">
                Bạn đã hoàn thành toàn bộ bài học!
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-4">
                <p className="text-sm text-gray-600 mb-2">Tổng điểm nhận được</p>
                <p className="text-5xl font-bold text-green-600 mb-2">
                  +{pointsEarned}
                </p>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-8 h-8 fill-yellow-400 text-yellow-400 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-lg font-semibold text-gray-900">
                  {totalChallenges}/{totalChallenges} bài tập
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push(`/student/courses/${courseId}`)} className="w-full">
                Quay lại khóa học
              </Button>
              <Button variant="secondaryOutline" onClick={() => router.push(`/student/courses/${courseId}/lessons/${lessonId}`)} className="w-full">
                Xem lại bài học
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Quiz Interface */}
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" size="sm" onClick={handleExit}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Thoát
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondaryOutline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Làm lại
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Bài tập {currentChallengeIndex + 1}/{totalChallenges} - {totalQuestions} câu hỏi
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
                            {ch.questions?.length || 0} câu hỏi
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
            {/* Exercise Information Section - Unified for all question types */}

            {/* Instructions/Question */}
            {currentChallenge.question && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-3">
                <div
                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed text-base"
                  dangerouslySetInnerHTML={{ __html: currentChallenge.question }}
                />
              </div>
            )}

            {/* Passage */}
            {currentChallenge.passage && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
                <h3 className="font-semibold text-base mb-2 text-gray-700">📄 Đoạn văn</h3>
                <div
                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed text-base whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: currentChallenge.passage }}
                />
              </div>
            )}

            {/* Image */}
            {currentChallenge.imageSrc && (
              <div className="mb-3">
                <img
                  src={currentChallenge.imageSrc}
                  alt="Exercise"
                  className="w-full max-w-2xl mx-auto rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Audio */}
            {currentChallenge.audioSrc && (
              <div className="mb-3">
                <AudioPlayer
                  src={currentChallenge.audioSrc}
                />
              </div>
            )}

            {/* All Questions */}
            <div className="space-y-4">
              {questions.map((question: any, qIndex: number) => {
                const isCorrect = isQuestionCorrect(question.id);
                const result = questionResults[question.id]; // Get detailed result

                return (
                  <div key={question.id} className="bg-white rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Câu hỏi {qIndex + 1}:</h3>
                        <div
                          className="prose prose-sm max-w-none text-lg font-semibold text-gray-900"
                          dangerouslySetInnerHTML={{ __html: question.text }}
                        />
                        {question.imageSrc && (
                          <img
                            src={question.imageSrc}
                            alt={`Question ${qIndex + 1}`}
                            className="mt-3 max-w-full h-auto rounded-lg border"
                          />
                        )}
                      </div>
                      {allSubmitted && (
                        <div className="flex-shrink-0 ml-3">
                          {isCorrect ? (
                            <CheckCircle2 className="h-7 w-7 text-green-500" />
                          ) : (
                            <XCircle className="h-7 w-7 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* ✅ NEW: Use QuestionRenderer for all question types */}
                    <QuestionRenderer
                      questionType={question.questionType || "SINGLE_CHOICE"}
                      options={question.options.map((opt: any) => ({
                        id: opt.id,
                        optionText: opt.text,
                        isCorrect: opt.correct,
                        order: opt.order || 0,
                      }))}
                      metadata={question.metadata}
                      answer={answers[question.id]}
                      onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                      disabled={allSubmitted}
                    />

                    {/* Show correct answer after submission */}
                    {allSubmitted && (
                      <div className={`mt-4 p-4 rounded-lg border-2 ${
                        isCorrect
                          ? 'bg-green-50 border-green-300'
                          : 'bg-red-50 border-red-300'
                      }`}>
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            {/* Show feedback for MATCHING/LABELING/ORDERING */}
                            {(question.questionType === "MATCHING" ||
                              question.questionType === "LABELING" ||
                              question.questionType === "ORDERING") && result.feedback && (
                              <>
                                <p className="text-sm font-semibold mb-1" style={{ color: isCorrect ? '#166534' : '#991b1b' }}>
                                  Kết quả: {result.feedback}
                                </p>
                                <p className="text-sm text-gray-700">
                                  Điểm: {result.pointsEarned.toFixed(2)}/{result.maxPoints}
                                </p>
                              </>
                            )}

                            {/* Show correct answer for TEXT_INPUT */}
                            {question.questionType === "TEXT_INPUT" && question.correctAnswer && (
                              <>
                                <p className="text-sm font-semibold text-green-900 mb-1">
                                  Đáp án đúng:
                                </p>
                                <p className="text-base text-gray-900 font-medium">
                                  {question.correctAnswer}
                                </p>
                              </>
                            )}

                            {/* Show correct answer for SINGLE_CHOICE/MULTIPLE_CHOICE */}
                            {(question.questionType === "SINGLE_CHOICE" || question.questionType === "MULTIPLE_CHOICE") && (
                              <>
                                <p className="text-sm font-semibold text-green-900 mb-2">
                                  Đáp án đúng:
                                </p>
                                <div className="space-y-1">
                                  {question.options
                                    .filter((opt: any) => opt.correct)
                                    .map((opt: any) => (
                                      <div
                                        key={opt.id}
                                        className="prose prose-sm max-w-none text-base text-gray-900 font-medium"
                                        dangerouslySetInnerHTML={{ __html: opt.text }}
                                      />
                                    ))}
                                </div>
                              </>
                            )}

                            {/* Show explanation if available */}
                            {question.explanation && (
                              <div className="mt-2 pt-2 border-t border-green-200">
                                <p className="text-sm text-gray-700 font-semibold mb-1">💡 Giải thích:</p>
                                <div
                                  className="prose prose-sm max-w-none text-sm text-gray-700"
                                  dangerouslySetInnerHTML={{ __html: question.explanation }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Submit All Button */}
            {!allSubmitted && (
              <div className="mt-6 bg-white rounded-lg border-2 border-blue-300 p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Đã trả lời {answeredCount}/{totalQuestions} câu
                  </h3>
                  <p className="text-sm text-gray-600">
                    {answeredCount === totalQuestions
                      ? "Bạn đã trả lời tất cả câu hỏi. Nhấn nộp bài để xem kết quả!"
                      : `Vui lòng trả lời ${totalQuestions - answeredCount} câu còn lại`
                    }
                  </p>
                </div>
                <Button
                  onClick={handleSubmitAll}
                  className="w-full"
                  size="lg"
                  disabled={answeredCount < totalQuestions}
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Nộp bài
                </Button>
              </div>
            )}

            {/* Explanation Section - Show after submission (only for questions with explanation from challenge) */}
            {allSubmitted && currentChallenge.explanation && (
              <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Giải thích đáp án
                  </h3>
                </div>

                <div className="bg-white rounded-lg p-5 border border-blue-200">
                  <div
                    className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentChallenge.explanation }}
                  />
                </div>
              </div>
            )}

            {/* Complete Challenge Button */}
            {allSubmitted && !challengeCompleted && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300 p-6">
                <div className="text-center mb-4">
                  <Trophy className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sẵn sàng hoàn thành?
                  </h3>
                  <p className="text-sm text-gray-500">
                    Bạn có thể cuộn lên xem lại đáp án hoặc nhấn "Hoàn thành" để kết thúc bài tập
                  </p>
                </div>
                <Button onClick={handleComplete} className="w-full" size="lg">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Hoàn thành bài tập
                </Button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Footer - Progress Summary */}
        <div className="bg-white border-t sticky bottom-0 shadow-lg">
          <div className="max-w-[1400px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Tiến độ: </span>
                  <span className="font-semibold text-gray-900">
                    {answeredCount}/{totalQuestions} câu
                  </span>
                </div>
                {allSubmitted && (
                  <div className="text-sm">
                    <span className="text-gray-600">Đúng: </span>
                    <span className="font-semibold text-green-600">
                      {correctCount}/{totalQuestions}
                    </span>
                    <span className="text-gray-500 ml-2">({score}/10 điểm)</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondaryOutline" onClick={handleReset} size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Làm lại
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


