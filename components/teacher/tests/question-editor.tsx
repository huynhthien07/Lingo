"use client";

import { QuestionType } from "@/lib/utils/question-type-mapper";
import type { QuestionMetadata } from "@/shared/types/questionMetadata";
import { SingleChoiceEditor } from "./single-choice-editor";
import { MultipleChoiceEditor } from "./multiple-choice-editor";
import { TextInputEditor } from "./text-input-editor";
import { MatchingEditor } from "./matching-editor";
import { LabelingEditor } from "./labeling-editor";
import { OrderingEditor } from "./ordering-editor";
import { SimpleMatchingEditor } from "../exercises/simple-matching-editor";
import { SimpleLabelingEditor } from "../exercises/simple-labeling-editor";

interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface QuestionEditorProps {
  questionType: QuestionType;
  options: QuestionOption[];
  onOptionsChange: (options: QuestionOption[]) => void;
  metadata?: QuestionMetadata;
  onMetadataChange?: (metadata: QuestionMetadata) => void;
  correctAnswer?: string;
  onCorrectAnswerChange?: (answer: string) => void;
  disabled?: boolean;
  challengeId?: number; // For exercises - scope labels/items to challenge
  lessonId?: number; // DEPRECATED - For exercises (backward compatibility)
  testId?: number; // For tests
}

export function QuestionEditor({
  questionType,
  options,
  onOptionsChange,
  metadata,
  onMetadataChange,
  correctAnswer,
  onCorrectAnswerChange,
  disabled = false,
  challengeId,
  lessonId,
  testId,
}: QuestionEditorProps) {
  // Single Choice
  if (questionType === "SINGLE_CHOICE") {
    return (
      <SingleChoiceEditor
        options={options}
        onChange={onOptionsChange}
        disabled={disabled}
      />
    );
  }

  // Multiple Choice
  if (questionType === "MULTIPLE_CHOICE") {
    const multipleMetadata = metadata as { maxSelections?: number } | undefined;

    return (
      <MultipleChoiceEditor
        options={options}
        onChange={onOptionsChange}
        disabled={disabled}
        maxSelections={multipleMetadata?.maxSelections}
        onMaxSelectionsChange={(max) => {
          if (onMetadataChange) {
            onMetadataChange({ maxSelections: max });
          }
        }}
      />
    );
  }

  // Text Input
  if (questionType === "TEXT_INPUT") {
    const textMetadata = metadata as {
      multiline?: boolean;
      maxLength?: number;
      caseSensitive?: boolean;
      acceptableAnswers?: string[];
    } | undefined;

    return (
      <TextInputEditor
        correctAnswer={correctAnswer || ""}
        onChange={(answer) => onCorrectAnswerChange?.(answer)}
        disabled={disabled}
        multiline={textMetadata?.multiline}
        onMultilineChange={(multiline) => {
          if (onMetadataChange) {
            onMetadataChange({
              ...textMetadata,
              multiline,
            });
          }
        }}
        maxLength={textMetadata?.maxLength}
        onMaxLengthChange={(maxLength) => {
          if (onMetadataChange) {
            onMetadataChange({
              ...textMetadata,
              maxLength,
            });
          }
        }}
        caseSensitive={textMetadata?.caseSensitive}
        onCaseSensitiveChange={(caseSensitive) => {
          if (onMetadataChange) {
            onMetadataChange({
              ...textMetadata,
              caseSensitive,
            });
          }
        }}
        acceptableAnswers={textMetadata?.acceptableAnswers}
        onAcceptableAnswersChange={(acceptableAnswers) => {
          if (onMetadataChange) {
            onMetadataChange({
              ...textMetadata,
              acceptableAnswers,
            });
          }
        }}
      />
    );
  }

  // Matching
  if (questionType === "MATCHING") {
    if (!metadata || !onMetadataChange) {
      return <div className="text-red-600">Metadata is required for matching questions</div>;
    }

    // Use Simple Editor for exercises (1 pair per question, scoped to challenge)
    if (challengeId) {
      return (
        <SimpleMatchingEditor
          challengeId={challengeId}
          value={metadata as any}
          onChange={onMetadataChange}
          disabled={disabled}
        />
      );
    }

    // Fallback to legacy editor for tests or when no challengeId
    return (
      <MatchingEditor
        value={metadata as any}
        onChange={onMetadataChange}
        disabled={disabled}
      />
    );
  }

  // Labeling
  if (questionType === "LABELING") {
    if (!metadata || !onMetadataChange) {
      return <div className="text-red-600">Metadata is required for labeling questions</div>;
    }

    // Use Simple Editor for exercises (1 mapping per question, scoped to challenge)
    if (challengeId) {
      return (
        <SimpleLabelingEditor
          challengeId={challengeId}
          value={metadata as any}
          onChange={onMetadataChange}
          disabled={disabled}
        />
      );
    }

    // Fallback to legacy editor for tests or when no challengeId
    return (
      <LabelingEditor
        value={metadata as any}
        onChange={onMetadataChange}
        disabled={disabled}
      />
    );
  }

  // Ordering
  if (questionType === "ORDERING") {
    if (!metadata || !onMetadataChange) {
      return <div className="text-red-600">Metadata is required for ordering questions</div>;
    }

    return (
      <OrderingEditor
        value={metadata as any}
        onChange={onMetadataChange}
        disabled={disabled}
      />
    );
  }

  return (
    <div className="text-gray-500 text-center py-8">
      Question type not supported yet
    </div>
  );
}

