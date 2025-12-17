"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AudioPlayer } from "@/components/ui/audio-player";

interface PracticeClientProps {
  challenge: any;
  courseId: number;
  lessonId: number;
}

export function PracticeClient({ challenge, courseId, lessonId }: PracticeClientProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = challenge.questions[currentQuestionIndex];
  const totalQuestions = challenge.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleSelectOption = (optionId: number) => {
    if (showResults) return;
    
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId,
    });
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Vui lòng chọn câu trả lời!");
      return;
    }

    if (isLastQuestion) {
      // Calculate score
      let correctCount = 0;
      challenge.questions.forEach((q: any) => {
        const selectedOptionId = answers[q.id];
        const correctOption = q.options.find((opt: any) => opt.correct);
        if (selectedOptionId === correctOption?.id) {
          correctCount++;
        }
      });

      setScore(correctCount);
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed ? "bg-green-100" : "bg-red-100"
            }`}>
              {passed ? (
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
            <CardTitle className="text-3xl">
              {passed ? "Chúc mừng!" : "Cần cố gắng thêm!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{percentage}%</div>
              <p className="text-gray-600">
                Bạn đã trả lời đúng {score}/{totalQuestions} câu hỏi
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                Làm lại
              </Button>
              <Link href={`/student/courses/${courseId}/lessons/${lessonId}`} className="flex-1">
                <Button className="w-full">Quay lại bài học</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/student/courses/${courseId}/lessons/${lessonId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Thoát
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Câu {currentQuestionIndex + 1}/{totalQuestions}
              </Badge>
              <Badge>{challenge.type}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Passage/Audio */}
        {challenge.passage && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Đoạn văn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 whitespace-pre-wrap">{challenge.passage}</p>
            </CardContent>
          </Card>
        )}

        {challenge.audioSrc && (
          <div className="mb-6">
            <AudioPlayer
              src={challenge.audioSrc}
              title="🔊 Audio cho bài tập"
            />
          </div>
        )}

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option: any) => {
                const isSelected = answers[currentQuestion.id] === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{option.text}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                Câu trước
              </Button>
              <Button onClick={handleNext}>
                {isLastQuestion ? "Hoàn thành" : "Câu tiếp theo"}
                {!isLastQuestion && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

