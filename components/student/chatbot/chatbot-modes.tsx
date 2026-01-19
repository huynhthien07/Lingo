"use client";

import { BookOpen, Mic, PenTool, Lightbulb, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ChatMode = "general" | "vocabulary" | "grammar" | "speaking" | "writing";

interface ChatModesProps {
  selectedMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modes = [
  {
    id: "general" as ChatMode,
    label: "Tổng quát",
    icon: MessageSquare,
    description: "Hỏi bất cứ điều gì về IELTS",
    color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  },
  {
    id: "vocabulary" as ChatMode,
    label: "Từ vựng",
    icon: BookOpen,
    description: "Học từ mới và cách sử dụng",
    color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
  },
  {
    id: "grammar" as ChatMode,
    label: "Ngữ pháp",
    icon: Lightbulb,
    description: "Hiểu quy tắc ngữ pháp",
    color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
  },
  {
    id: "speaking" as ChatMode,
    label: "Speaking",
    icon: Mic,
    description: "Luyện tập kỹ năng nói",
    color: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
  },
  {
    id: "writing" as ChatMode,
    label: "Writing",
    icon: PenTool,
    description: "Cải thiện kỹ năng viết",
    color: "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100",
  },
];

export function ChatbotModes({ selectedMode, onModeChange }: ChatModesProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Chọn chế độ:</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${mode.color} border-current font-semibold`
                  : `border-gray-200 text-gray-700 hover:border-gray-300`
              }`}
              title={mode.description}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs font-medium">{mode.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

