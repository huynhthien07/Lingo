"use client";

import type { QuestionType } from "@/lib/utils/question-type-mapper";
import type { QuestionAnswer } from "@/shared/types/questionMetadata";
import { SingleChoiceInput } from "./single-choice-input";
import { MultipleChoiceInput } from "./multiple-choice-input";
import { TextInput } from "./text-input";
import { MatchingInput } from "./matching-input";
import { LabelingInput } from "./labeling-input";
import { OrderingInput } from "./ordering-input";

interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface QuestionRendererProps {
  questionType: QuestionType;
  options?: QuestionOption[];
  metadata?: any;
  answer?: QuestionAnswer;
  onAnswerChange: (answer: QuestionAnswer) => void;
  disabled?: boolean;
}

export function QuestionRenderer({
  questionType,
  options = [],
  metadata,
  answer,
  onAnswerChange,
  disabled = false,
}: QuestionRendererProps) {
  switch (questionType) {
    case "SINGLE_CHOICE":
      return (
        <SingleChoiceInput
          options={options}
          selectedOptionId={(answer as any)?.selectedOptionId}
          onAnswerChange={(optionId) => onAnswerChange({ selectedOptionId: optionId })}
          disabled={disabled}
        />
      );

    case "MULTIPLE_CHOICE":
      return (
        <MultipleChoiceInput
          options={options}
          selectedOptionIds={(answer as any)?.selectedOptionIds || []}
          onAnswerChange={(optionIds) => onAnswerChange({ selectedOptionIds: optionIds })}
          disabled={disabled}
        />
      );

    case "TEXT_INPUT":
      return (
        <TextInput
          value={(answer as any)?.text || ""}
          onAnswerChange={(text) => onAnswerChange({ text })}
          disabled={disabled}
          multiline={false}
        />
      );

    case "MATCHING":
      if (!metadata) {
        return <div className="text-red-500">Missing metadata for MATCHING question</div>;
      }
      return (
        <MatchingInput
          metadata={metadata}
          value={answer as any}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );

    case "LABELING":
      if (!metadata) {
        return <div className="text-red-500">Missing metadata for LABELING question</div>;
      }
      return (
        <LabelingInput
          metadata={metadata}
          value={answer as any}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );

    case "ORDERING":
      if (!metadata) {
        return <div className="text-red-500">Missing metadata for ORDERING question</div>;
      }
      return (
        <OrderingInput
          metadata={metadata}
          value={answer as any}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );

    default:
      return (
        <div className="text-red-500">
          Unknown question type: {questionType}
        </div>
      );
  }
}

