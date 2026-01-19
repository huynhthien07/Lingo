"use client";

import { QuestionType } from "@/lib/utils/question-type-mapper";
import { 
  Circle, 
  CheckSquare, 
  Type, 
  Link2, 
  MapPin, 
  ArrowUpDown 
} from "lucide-react";

interface QuestionTypeSelectorProps {
  selectedType: QuestionType | null;
  onSelect: (type: QuestionType) => void;
  disabled?: boolean;
}

const QUESTION_TYPES = [
  {
    type: "SINGLE_CHOICE" as QuestionType,
    icon: Circle,
    title: "Single Choice",
    description: "Radio button - Multiple Choice (1 answer), True/False/Not Given, Yes/No/Not Given",
    color: "blue",
  },
  {
    type: "MULTIPLE_CHOICE" as QuestionType,
    icon: CheckSquare,
    title: "Multiple Choice",
    description: "Checkbox - Choose TWO/THREE answers",
    color: "green",
  },
  {
    type: "TEXT_INPUT" as QuestionType,
    icon: Type,
    title: "Text Input",
    description: "Textbox - Form/Note/Table Completion, Sentence Completion, Short Answer",
    color: "purple",
  },
  {
    type: "MATCHING" as QuestionType,
    icon: Link2,
    title: "Matching",
    description: "Dropdown - Matching Headings, Matching Information, Matching Features",
    color: "orange",
  },
  {
    type: "LABELING" as QuestionType,
    icon: MapPin,
    title: "Labeling",
    description: "Select labels - Map Labeling, Diagram Labeling, Plan Labeling",
    color: "pink",
  },
  {
    type: "ORDERING" as QuestionType,
    icon: ArrowUpDown,
    title: "Ordering",
    description: "Drag & Drop - Flow-chart Completion, Process Ordering",
    color: "indigo",
  },
];

export function QuestionTypeSelector({
  selectedType,
  onSelect,
  disabled = false,
}: QuestionTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Question Type *
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {QUESTION_TYPES.map(({ type, icon: Icon, title, description, color }) => {
          const isSelected = selectedType === type;
          
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              disabled={disabled}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${isSelected 
                  ? `border-${color}-500 bg-${color}-50` 
                  : "border-gray-300 bg-white hover:border-gray-400"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  p-2 rounded-lg flex-shrink-0
                  ${isSelected ? `bg-${color}-100` : "bg-gray-100"}
                `}>
                  <Icon className={`
                    w-5 h-5
                    ${isSelected ? `text-${color}-600` : "text-gray-600"}
                  `} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 mb-1">
                    {title}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {description}
                  </div>
                </div>
                
                {isSelected && (
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                    bg-${color}-500
                  `}>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500">
        💡 Chọn loại câu hỏi phù hợp với dạng bài tập IELTS bạn muốn tạo
      </p>
    </div>
  );
}

