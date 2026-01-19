"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface TextInputProps {
  value?: string;
  onAnswerChange: (text: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number; // Optional: character limit
  showWordCount?: boolean; // Show word count for IELTS writing
}

export function TextInput({
  value = "",
  onAnswerChange,
  disabled = false,
  multiline = false,
  placeholder = "Nhập câu trả lời của bạn...",
  maxLength,
  showWordCount = false,
}: TextInputProps) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleChange = (newText: string) => {
    if (maxLength && newText.length > maxLength) {
      return; // Don't allow exceeding max length
    }
    setText(newText);
    onAnswerChange(newText);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  if (multiline) {
    return (
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="min-h-[120px] resize-none"
          maxLength={maxLength}
        />
        <div className="flex justify-between text-xs text-gray-500">
          {showWordCount && (
            <span>
              Số từ: <span className="font-medium">{wordCount}</span>
            </span>
          )}
          {maxLength && (
            <span className={charCount >= maxLength ? "text-red-500 font-medium" : ""}>
              {charCount}/{maxLength} ký tự
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full"
        maxLength={maxLength}
      />
      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          <span className={charCount >= maxLength ? "text-red-500 font-medium" : ""}>
            {charCount}/{maxLength} ký tự
          </span>
        </div>
      )}
    </div>
  );
}

