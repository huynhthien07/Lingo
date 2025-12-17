"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer } from "@/components/ui/audio-player";
import { AudioRecorder } from "@/components/ui/audio-recorder";

interface Question {
  id: number;
  sectionId: number;
  questionText: string;
  imageSrc?: string | null;
  audioSrc?: string | null;
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

interface Section {
  id: number;
  title: string;
  skillType: string;
  passage: string | null;
  imageSrc: string | null;
  audioSrc: string | null;
  questions: Question[];
}

interface Answer {
  questionId: number;
  selectedOptionId?: number | null;
  textAnswer?: string | null;
}

interface TestQuestionDisplayProps {
  section: Section;
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  answer: Answer | undefined;
  onAnswerChange: (questionId: number, selectedOptionId?: number, textAnswer?: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function TestQuestionDisplay({
  section,
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: TestQuestionDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(
    answer?.selectedOptionId || null
  );
  const [textAnswer, setTextAnswer] = useState<string>(
    answer?.textAnswer || ""
  );

  useEffect(() => {
    setSelectedOption(answer?.selectedOptionId || null);
    setTextAnswer(answer?.textAnswer || "");
  }, [question.id, answer]);

  const handleOptionSelect = (optionId: number) => {
    setSelectedOption(optionId);
    onAnswerChange(question.id, optionId);
  };

  const handleTextChange = (text: string) => {
    setTextAnswer(text);
    onAnswerChange(question.id, undefined, text);
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    // For speaking, we'll store the audio URL in textAnswer temporarily
    // In a real implementation, you'd upload the blob and get a URL
    const url = URL.createObjectURL(blob);
    handleTextChange(url);
  };

  const isSpeaking = section.skillType === "SPEAKING";
  const isWriting = section.skillType === "WRITING";
  const isMultipleChoice = question.options && question.options.length > 0;

  return (
    <div className="space-y-6">
      {/* Section Info */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
        <p className="text-sm text-gray-600 mt-1">
          Câu {questionNumber} / {totalQuestions}
        </p>
      </div>

      {/* Section Audio (for Listening sections) */}
      {section.audioSrc && (
        <AudioPlayer
          src={section.audioSrc}
          title="Audio cho phần này"
        />
      )}

      {/* Passage (for Reading sections) */}
      {section.passage && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: section.passage }}
            />
          </CardContent>
        </Card>
      )}

      {/* Section Image (if exists) */}
      {section.imageSrc && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <img
              src={section.imageSrc}
              alt="Section context"
              className="max-w-full h-auto rounded-lg border"
            />
          </CardContent>
        </Card>
      )}

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-start gap-3">
            <Badge variant="outline" className="mt-1">
              {question.points} điểm
            </Badge>
            <div className="flex-1">
              <div dangerouslySetInnerHTML={{ __html: question.questionText }} />
              {question.imageSrc && (
                <img
                  src={question.imageSrc}
                  alt="Question"
                  className="mt-4 max-w-full h-auto rounded-lg border"
                />
              )}
              {question.audioSrc && (
                <div className="mt-4">
                  <AudioPlayer
                    src={question.audioSrc}
                    title="Audio cho câu hỏi này"
                  />
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Multiple Choice Options */}
          {isMultipleChoice && question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${
                  selectedOption === option.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                  mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center
                  ${
                    selectedOption === option.id
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
                  }
                `}
                >
                  {selectedOption === option.id && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: option.optionText }}
                />
              </div>
            </button>
          ))}

          {/* Speaking - Audio Recorder */}
          {isSpeaking && (
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              existingAudioUrl={textAnswer || null}
            />
          )}

          {/* Writing - Text Area */}
          {isWriting && (
            <div className="space-y-2">
              <Textarea
                value={textAnswer}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                className="min-h-[200px] resize-none"
              />
              <p className="text-sm text-gray-500">
                {textAnswer.length} ký tự
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          onClick={onPrevious}
          disabled={!hasPrevious}
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Câu trước
        </Button>
        <Button onClick={onNext} disabled={!hasNext}>
          Câu sau
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

