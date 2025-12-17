"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface Section {
  id: number;
  title: string;
  skillType: string;
  questions: Question[];
}

interface Question {
  id: number;
}

interface Answer {
  questionId: number;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
}

interface TestSectionNavigationProps {
  sections: Section[];
  answers: Answer[];
  currentSectionIndex: number;
  onSectionSelect: (index: number) => void;
}

export function TestSectionNavigation({
  sections,
  answers,
  currentSectionIndex,
  onSectionSelect,
}: TestSectionNavigationProps) {
  const getSectionProgress = (section: Section) => {
    const answered = section.questions.filter((q) => {
      const answer = answers.find((a) => a.questionId === q.id);
      return answer && (answer.selectedOptionId || answer.textAnswer);
    }).length;
    return { answered, total: section.questions.length };
  };

  const getSkillColor = (skillType: string) => {
    const colors: Record<string, string> = {
      LISTENING: "bg-blue-500",
      READING: "bg-green-500",
      WRITING: "bg-purple-500",
      SPEAKING: "bg-orange-500",
      VOCABULARY: "bg-pink-500",
      GRAMMAR: "bg-indigo-500",
    };
    return colors[skillType] || "bg-gray-500";
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {sections.map((section, index) => {
            const progress = getSectionProgress(section);
            const isCurrent = index === currentSectionIndex;
            const isCompleted = progress.answered === progress.total;

            return (
              <button
                key={section.id}
                onClick={() => onSectionSelect(index)}
                className="relative group"
                title={`${section.title} - ${getSkillLabel(section.skillType)}`}
              >
                {/* Circular Button */}
                <div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center
                    font-bold text-lg transition-all duration-200
                    ${
                      isCurrent
                        ? `${getSkillColor(section.skillType)} text-white ring-4 ring-offset-2 ring-${getSkillColor(section.skillType).split('-')[1]}-300 scale-110`
                        : isCompleted
                        ? "bg-green-100 text-green-700 border-2 border-green-500"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200"
                    }
                  `}
                >
                  {index + 1}
                </div>

                {/* Completion Badge */}
                {isCompleted && !isCurrent && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                )}

                {/* Progress Text */}
                <div className="mt-1 text-xs text-center text-gray-600">
                  {progress.answered}/{progress.total}
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {getSkillLabel(section.skillType)}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

