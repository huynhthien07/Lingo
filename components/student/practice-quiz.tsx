"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface PracticeQuizProps {
  challenge: any;
  courseId: number;
  lessonId: number;
}

export function PracticeQuiz({ challenge, courseId, lessonId }: PracticeQuizProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});
  const [allCompleted, setAllCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const questions = challenge.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Calculate progress based on submitted questions
  const submittedCount = Object.keys(submitted).filter(key => submitted[parseInt(key)]).length;
  const progressPercentage = totalQuestions > 0 ? (submittedCount / totalQuestions) * 100 : 0;

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

  // Check if current question is answered correctly
  const isCurrentCorrect = () => {
    if (!submitted[currentQuestion.id]) return null;
    const selectedOptionId = answers[currentQuestion.id];
    const correctOption = currentQuestion.options.find((opt: any) => opt.correct);
    return selectedOptionId === correctOption?.id;
  };

  // Handle answer selection
  const handleSelectOption = (optionId: number) => {
    if (submitted[currentQuestion.id]) return; // Can't change after submit
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId,
    });
  };

  // Handle submit current question
  const handleSubmit = () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Vui lòng chọn câu trả lời!");
      return;
    }

    setSubmitted({
      ...submitted,
      [currentQuestion.id]: true,
    });

    const correct = isCurrentCorrect();
    if (correct) {
      toast.success("Chính xác! 🎉");
    } else {
      toast.error("Chưa đúng. Hãy xem đáp án!");
    }
  };

  // Navigate to question
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Handle save progress
  const handleSave = () => {
    // TODO: Save to database
    toast.success("Đã lưu tiến độ!");
  };

  // Handle reset
  const handleReset = () => {
    if (confirm("Bạn có chắc muốn làm lại bài tập? Tiến độ hiện tại sẽ bị xóa.")) {
      setAnswers({});
      setSubmitted({});
      setShowAnswer({});
      setCurrentQuestionIndex(0);
      setAllCompleted(false);
      setScore(0);
      toast.info("Đã reset bài tập!");
    }
  };

  // Check if all questions completed
  useEffect(() => {
    const allSubmitted = questions.every((q: any) => submitted[q.id]);
    if (allSubmitted && questions.length > 0 && !allCompleted) {
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
      setAllCompleted(true);

      // Celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
      });

      // Play success sound
      const audio = new Audio("/sound/success.mp3");
      audio.play().catch((err) => {
        console.log("Audio play failed:", err);
      });
    }
  }, [submitted, questions, answers, allCompleted]);

  // Handle exit with confirmation
  const handleExit = () => {
    const hasProgress = Object.keys(answers).length > 0;
    if (hasProgress && !allCompleted) {
      setShowExitConfirm(true);
    } else {
      router.push(`/student/courses/${courseId}/lessons/${lessonId}`);
    }
  };

  const confirmExit = (save: boolean) => {
    if (save) {
      handleSave();
    }
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
              <Button variant="outline" onClick={() => setShowExitConfirm(false)} className="flex-1">
                Hủy
              </Button>
              <Button variant="outline" onClick={() => confirmExit(false)} className="flex-1">
                Không lưu
              </Button>
              <Button onClick={() => confirmExit(true)} className="flex-1">
                Lưu & Thoát
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Celebration */}
      {allCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Chúc mừng!</h2>
              <p className="text-gray-600">Bạn đã hoàn thành bài tập</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className="text-4xl font-bold text-blue-600">{score}/{totalQuestions}</span>
              </div>
              <p className="text-sm text-gray-600">
                Điểm số: {Math.round((score / totalQuestions) * 100)}%
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push(`/student/courses/${courseId}/lessons/${lessonId}`)} className="w-full">
                Quay lại bài học
              </Button>
              <Button variant="outline" onClick={handleReset} className="w-full">
                Làm lại bài tập
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
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1.5" />
                  Lưu
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Làm lại
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Câu {currentQuestionIndex + 1}/{totalQuestions}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {submittedCount}/{totalQuestions} đã hoàn thành
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 py-4">
            {/* Passage/Audio if available */}
            {challenge.passage && (
              <div className="bg-white rounded-lg border p-4 mb-3">
                <h3 className="font-semibold text-base mb-2.5">Đoạn văn</h3>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                  {challenge.passage}
                </p>
              </div>
            )}

            {challenge.audioSrc && (
              <div className="bg-white rounded-lg border p-4 mb-3">
                <h3 className="font-semibold text-base mb-2.5">Audio</h3>
                <audio controls className="w-full">
                  <source src={challenge.audioSrc} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {/* Question */}
            <div className="bg-white rounded-lg border p-4 mb-3">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex-1">
                  {currentQuestion.questionText}
                </h2>
                {submitted[currentQuestion.id] && (
                  <div className="flex-shrink-0 ml-3">
                    {isCurrentCorrect() ? (
                      <CheckCircle2 className="h-7 w-7 text-green-500" />
                    ) : (
                      <XCircle className="h-7 w-7 text-red-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option: any) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  const isSubmitted = submitted[currentQuestion.id];
                  const isCorrect = option.correct;

                  let optionClass = "border-2 p-3.5 rounded-lg cursor-pointer transition-all ";
                  if (isSubmitted) {
                    if (isCorrect) {
                      optionClass += "border-green-500 bg-green-50 ";
                    } else if (isSelected && !isCorrect) {
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
                      onClick={() => handleSelectOption(option.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-gray-900 text-base">{option.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!submitted[currentQuestion.id] && (
                <div className="mt-4">
                  <Button onClick={handleSubmit} className="w-full" size="lg">
                    Nộp câu trả lời
                  </Button>
                </div>
              )}

              {/* Answer Explanation */}
              {submitted[currentQuestion.id] && currentQuestion.explanation && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowAnswer({
                      ...showAnswer,
                      [currentQuestion.id]: !showAnswer[currentQuestion.id]
                    })}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    {showAnswer[currentQuestion.id] ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Ẩn giải thích
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Xem giải thích
                      </>
                    )}
                  </button>
                  {showAnswer[currentQuestion.id] && (
                    <div className="mt-2.5 p-3.5 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700 leading-relaxed">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Question Navigation */}
        <div className="bg-white border-t sticky bottom-0 shadow-lg">
          <div className="max-w-[1400px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q: any, index: number) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isSubmitted = submitted[q.id];
                  const isCurrent = index === currentQuestionIndex;

                  let btnClass = "w-11 h-11 rounded-lg font-semibold transition-all text-sm ";
                  if (isCurrent) {
                    btnClass += "ring-2 ring-offset-2 ring-blue-500 ";
                  }
                  if (isSubmitted) {
                    const selectedOptionId = answers[q.id];
                    const correctOption = q.options.find((opt: any) => opt.correct);
                    const isCorrect = selectedOptionId === correctOption?.id;
                    btnClass += isCorrect
                      ? "bg-green-500 text-white hover:bg-green-600 shadow-md "
                      : "bg-red-500 text-white hover:bg-red-600 shadow-md ";
                  } else if (isAnswered) {
                    btnClass += "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 ";
                  } else {
                    btnClass += "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 ";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(index)}
                      className={btnClass}
                      title={`Câu ${index + 1}${isSubmitted ? (isAnswered && q.options.find((opt: any) => opt.correct)?.id === answers[q.id] ? ' - Đúng' : ' - Sai') : (isAnswered ? ' - Đã chọn' : ' - Chưa làm')}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


