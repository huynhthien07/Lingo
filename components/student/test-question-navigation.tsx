"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

interface Section {
  id: number;
  title: string;
  skillType: string;
  questions: Question[];
}

interface Question {
  id: number;
  questionText: string;
  order: number;
}

interface Answer {
  questionId: number;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
}

interface TestQuestionNavigationProps {
  sections: Section[];
  answers: Answer[];
  currentQuestionId: number;
  currentSectionIndex: number;
  onQuestionSelect: (questionId: number) => void;
}

export function TestQuestionNavigation({
  sections,
  answers,
  currentQuestionId,
  currentSectionIndex,
  onQuestionSelect,
}: TestQuestionNavigationProps) {
  const isAnswered = (questionId: number) => {
    const answer = answers.find((a) => a.questionId === questionId);
    return answer && (answer.selectedOptionId || answer.textAnswer);
  };

  const getSkillIcon = (skillType: string) => {
    // You can add icons for different skill types
    return null;
  };

  const getSkillColor = (skillType: string) => {
    const colors: Record<string, string> = {
      LISTENING: "bg-blue-100 text-blue-800",
      READING: "bg-green-100 text-green-800",
      WRITING: "bg-purple-100 text-purple-800",
      SPEAKING: "bg-orange-100 text-orange-800",
      VOCABULARY: "bg-pink-100 text-pink-800",
      GRAMMAR: "bg-indigo-100 text-indigo-800",
    };
    return colors[skillType] || "bg-gray-100 text-gray-800";
  };

  const getSkillLabel = (skillType: string) => {
    const labels: Record<string, string> = {
      LISTENING: "Nghe",
      READING: "Đọc",
      WRITING: "Viết",
      SPEAKING: "Nói",
      VOCABULARY: "Từ vựng",
      GRAMMAR: "Ngữ pháp",
    };
    return labels[skillType] || skillType;
  };

  // Only show current section
  const currentSection = sections[currentSectionIndex];
  if (!currentSection) return null;

  // Calculate question numbers for current section
  const sectionStartNumber = sections
    .slice(0, currentSectionIndex)
    .reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <CardTitle className="text-base">Câu hỏi</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getSkillColor(currentSection.skillType)}>
              {getSkillLabel(currentSection.skillType)}
            </Badge>
            <span className="text-sm text-gray-600">
              {currentSection.questions.length} câu
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {currentSection.questions.map((question, qIndex) => {
            const answered = isAnswered(question.id);
            const isCurrent = question.id === currentQuestionId;
            const questionNumber = sectionStartNumber + qIndex + 1;

            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(question.id)}
                className={`
                  relative h-10 rounded-lg border-2 font-medium text-sm
                  transition-all duration-200
                  ${
                    isCurrent
                      ? "border-blue-600 bg-blue-600 text-white shadow-md"
                      : answered
                      ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                {questionNumber}
                {answered && !isCurrent && (
                  <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-600 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-4 w-4 rounded border-2 border-blue-600 bg-blue-600"></div>
            <span className="text-gray-600">Câu hiện tại</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-4 w-4 rounded border-2 border-green-500 bg-green-50"></div>
            <span className="text-gray-600">Đã trả lời</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-4 w-4 rounded border-2 border-gray-300 bg-white"></div>
            <span className="text-gray-600">Chưa trả lời</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

