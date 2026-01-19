"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer } from "@/components/ui/audio-player";
import { AudioRecorder } from "@/components/ui/audio-recorder";
import { QuestionRenderer } from "./question-inputs/question-renderer";
import type { QuestionType } from "@/lib/utils/question-type-mapper";
import type { QuestionAnswer } from "@/shared/types/questionMetadata";

interface Question {
  id: number;
  sectionId: number;
  questionText: string;
  questionType?: QuestionType | null; // ✅ NEW: Question input type
  metadata?: any; // ✅ NEW: Metadata for complex question types
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
  // ⚠️ DEPRECATED: Only used for Speaking/Writing now
  const [textAnswer, setTextAnswer] = useState<string>(
    answer?.textAnswer || ""
  );

  useEffect(() => {
    setTextAnswer(answer?.textAnswer || "");
  }, [question.id, answer]);

  const handleTextChange = (text: string) => {
    setTextAnswer(text);
    onAnswerChange(question.id, undefined, text);
  };

  const handleRecordingComplete = (blob: Blob, _duration: number) => {
    // For speaking, we'll store the audio URL in textAnswer temporarily
    // In a real implementation, you'd upload the blob and get a URL
    const url = URL.createObjectURL(blob);
    handleTextChange(url);
  };

  // ✅ NEW: Determine question type (fallback to old logic if not set)
  const questionType: QuestionType = question.questionType ||
    (section.skillType === "SPEAKING" ? "TEXT_INPUT" :
     section.skillType === "WRITING" ? "TEXT_INPUT" :
     question.options && question.options.length > 0 ? "SINGLE_CHOICE" : "TEXT_INPUT");

  const isSpeaking = section.skillType === "SPEAKING";
  const isWriting = section.skillType === "WRITING";

  // ✅ NEW: Convert answer to QuestionAnswer format
  const currentAnswer: QuestionAnswer | undefined = answer ? {
    selectedOptionId: answer.selectedOptionId || undefined,
    text: answer.textAnswer || undefined,
  } as any : undefined;

  // ✅ NEW: Handle answer change from QuestionRenderer
  const handleAnswerChange = (newAnswer: QuestionAnswer) => {
    const singleChoice = newAnswer as any;
    const textInput = newAnswer as any;

    if (singleChoice.selectedOptionId !== undefined) {
      onAnswerChange(question.id, singleChoice.selectedOptionId);
    } else if (textInput.text !== undefined) {
      onAnswerChange(question.id, undefined, textInput.text);
    }
  };

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
          {/* ✅ NEW: Use QuestionRenderer for all question types */}
          {!isSpeaking && !isWriting && (
            <QuestionRenderer
              questionType={questionType}
              options={question.options}
              metadata={question.metadata}
              answer={currentAnswer}
              onAnswerChange={handleAnswerChange}
            />
          )}

          {/* Speaking - Audio Recorder (special case) */}
          {isSpeaking && (
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              existingAudioUrl={textAnswer || null}
            />
          )}

          {/* Writing - Text Area (special case) */}
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

