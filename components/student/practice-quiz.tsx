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
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [allSubmitted, setAllSubmitted] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [score, setScore] = useState(0);
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

  // Check if a question is answered correctly
  const isQuestionCorrect = (questionId: number) => {
    if (!allSubmitted) return null;
    const selectedOptionId = answers[questionId];
    const question = questions.find((q: any) => q.id === questionId);
    const correctOption = question?.options.find((opt: any) => opt.correct);
    return selectedOptionId === correctOption?.id;
  };

  // Handle answer selection
  const handleSelectOption = (questionId: number, optionId: number) => {
    if (allSubmitted) return; // Can't change after submit

    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  // Handle submit all answers
  const handleSubmitAll = () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter((q: any) => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      toast.error(`Vui lòng trả lời tất cả ${unansweredQuestions.length} câu hỏi còn lại!`);
      return;
    }

    // Calculate score
    let correctCount = 0;
    questions.forEach((q: any) => {
      const selectedOptionId = answers[q.id];
      const correctOption = q.options.find((opt: any) => opt.correct);
      if (selectedOptionId === correctOption?.id) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setAllSubmitted(true);

    if (correctCount === totalQuestions) {
      toast.success(`Hoàn hảo! Bạn đã trả lời đúng tất cả ${totalQuestions} câu! 🎉`);
      playCorrectSound();
    } else {
      toast.info(`Bạn đã trả lời đúng ${correctCount}/${totalQuestions} câu`);
      playIncorrectSound();
    }
  };

  // Handle reset
  const handleReset = () => {
    if (confirm("Bạn có chắc muốn làm lại bài tập? Tiến độ hiện tại sẽ bị xóa.")) {
      setAnswers({});
      setAllSubmitted(false);
      setChallengeCompleted(false);
      setScore(0);
      toast.info("Đã reset bài tập!");
    }
  };

  const submitProgress = async (challengeScore: number) => {
    try {
      const response = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: currentChallenge.id,
          answers,
          score: challengeScore,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPointsEarned(data.pointsEarned);
        setChallengeCompleted(true);

        if (data.lessonCompleted) {
          setLessonCompleted(true);

          // Celebration for lesson completion
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
      }
    } catch (error) {
      console.error("Error submitting progress:", error);
    }
  };

  // Handle complete challenge
  const handleComplete = () => {
    if (!allSubmitted) {
      toast.error("Vui lòng nộp bài trước khi hoàn thành!");
      return;
    }

    const challengeScore = Math.round((score / questions.length) * 10);
    submitProgress(challengeScore);
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
                  {score}/{totalQuestions}
                </p>
                <p className="text-sm text-green-600 mt-2 font-semibold">
                  +{pointsEarned} điểm
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">Tiến độ bài học</p>
                <p className="text-lg font-semibold text-gray-900">
                  {completedChallengesCount + 1}/{totalChallenges} bài tập
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
            {/* Exercise Instructions */}
            {currentChallenge.question && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-3">
                <h3 className="font-semibold text-base mb-2 text-blue-900">📋 Đề bài</h3>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                  {currentChallenge.question}
                </p>
              </div>
            )}

            {/* Passage/Audio if available */}
            {currentChallenge.passage && (
              <div className="bg-white rounded-lg border p-4 mb-3">
                <h3 className="font-semibold text-base mb-2.5">📖 Đoạn văn</h3>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                  {currentChallenge.passage}
                </p>
              </div>
            )}

            {currentChallenge.audioSrc && (
              <div className="mb-3">
                <AudioPlayer
                  src={currentChallenge.audioSrc}
                  title="🔊 Audio cho bài tập"
                />
              </div>
            )}

            {/* All Questions */}
            <div className="space-y-4">
              {questions.map((question: any, qIndex: number) => {
                const isCorrect = isQuestionCorrect(question.id);

                return (
                  <div key={question.id} className="bg-white rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Câu hỏi {qIndex + 1}:</h3>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {question.text}
                        </h2>
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

                    {/* Options */}
                    <div className="space-y-2.5">
                      {question.options.map((option: any) => {
                        const isSelected = answers[question.id] === option.id;
                        const isOptionCorrect = option.correct;

                        let optionClass = "border-2 p-3.5 rounded-lg cursor-pointer transition-all ";
                        if (allSubmitted) {
                          if (isOptionCorrect) {
                            optionClass += "border-green-500 bg-green-50 ";
                          } else if (isSelected && !isOptionCorrect) {
                            optionClass += "border-red-500 bg-red-50 ";
                          } else {
                            optionClass += "border-gray-200 bg-gray-50 ";
                          }
                        } else {
                          optionClass += isSelected
                            ? "border-blue-500 bg-blue-50 "
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 ";
                        }

                        return (
                          <div
                            key={option.id}
                            className={optionClass}
                            onClick={() => handleSelectOption(question.id, option.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                              }`}>
                                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                              </div>
                              <span className="text-gray-900 text-base">{option.text}</span>
                              {allSubmitted && isOptionCorrect && (
                                <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Show individual answer if question has correctAnswer */}
                    {allSubmitted && question.correctAnswer && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-300">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-900 mb-1">
                              Đáp án đúng:
                            </p>
                            <p className="text-base text-gray-900 font-medium">
                              {question.correctAnswer}
                            </p>
                            {question.explanation && (
                              <div className="mt-2 pt-2 border-t border-green-200">
                                <p className="text-sm text-gray-700">
                                  <strong>💡 Giải thích:</strong> {question.explanation}
                                </p>
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
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {currentChallenge.explanation}
                  </p>
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
                    <span className="text-gray-600">Điểm: </span>
                    <span className="font-semibold text-green-600">
                      {score}/{totalQuestions}
                    </span>
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


