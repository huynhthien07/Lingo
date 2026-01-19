/**
 * Answer Validation & Grading Logic
 * 
 * Validates and grades student answers for all question types
 */

import type { QuestionType } from "./question-type-mapper";
import type {
  SingleChoiceAnswer,
  MultipleChoiceAnswer,
  TextInputAnswer,
  MatchingAnswer,
  LabelingAnswer,
  OrderingAnswer,
  MatchingMetadata,
  LabelingMetadata,
  OrderingMetadata,
} from "@/shared/types/questionMetadata";

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  feedback?: string;
}

/**
 * Validate SINGLE_CHOICE answer
 */
export function validateSingleChoice(
  answer: SingleChoiceAnswer,
  correctOptionId: number,
  maxPoints: number = 1
): ValidationResult {
  const isCorrect = answer.selectedOptionId === correctOptionId;
  
  return {
    isValid: true,
    isCorrect,
    pointsEarned: isCorrect ? maxPoints : 0,
    maxPoints,
  };
}

/**
 * Validate MULTIPLE_CHOICE answer
 */
export function validateMultipleChoice(
  answer: MultipleChoiceAnswer,
  correctOptionIds: number[],
  maxPoints: number = 1
): ValidationResult {
  const selectedSet = new Set(answer.selectedOptionIds);
  const correctSet = new Set(correctOptionIds);
  
  // Check if sets are equal
  const isCorrect = 
    selectedSet.size === correctSet.size &&
    [...selectedSet].every(id => correctSet.has(id));
  
  return {
    isValid: true,
    isCorrect,
    pointsEarned: isCorrect ? maxPoints : 0,
    maxPoints,
  };
}

/**
 * Validate TEXT_INPUT answer
 */
export function validateTextInput(
  answer: TextInputAnswer,
  correctAnswer: string,
  maxPoints: number = 1,
  options?: {
    caseSensitive?: boolean;
    acceptableAnswers?: string[];
  }
): ValidationResult {
  const caseSensitive = options?.caseSensitive ?? false;
  const acceptableAnswers = options?.acceptableAnswers ?? [];

  const userAnswer = caseSensitive ? answer.text.trim() : answer.text.trim().toLowerCase();
  const correct = caseSensitive ? correctAnswer.trim() : correctAnswer.trim().toLowerCase();

  // Check main answer
  let isCorrect = userAnswer === correct;

  // Check alternative answers if provided
  if (!isCorrect && acceptableAnswers.length > 0) {
    const normalizedAcceptable = acceptableAnswers.map(a =>
      caseSensitive ? a.trim() : a.trim().toLowerCase()
    );
    isCorrect = normalizedAcceptable.includes(userAnswer);
  }

  return {
    isValid: true,
    isCorrect,
    pointsEarned: isCorrect ? maxPoints : 0,
    maxPoints,
    feedback: isCorrect ? undefined : `Correct answer: ${correctAnswer}`,
  };
}

/**
 * Validate MATCHING answer
 *
 * ✅ Supports both legacy and v2 metadata:
 * - Legacy: correctPairs use leftId/rightId
 * - V2: correctPairs use labelId/itemId (same structure, different names)
 */
export function validateMatching(
  answer: MatchingAnswer,
  metadata: MatchingMetadata,
  maxPoints: number = 1
): ValidationResult {
  // Works for both legacy and v2 because both have correctPairs array
  const correctPairsSet = new Set(
    metadata.correctPairs.map(p => {
      // Handle both legacy (leftId/rightId) and v2 (labelId/itemId)
      const left = 'leftId' in p ? p.leftId : (p as any).labelId;
      const right = 'rightId' in p ? p.rightId : (p as any).itemId;
      return `${left}-${right}`;
    })
  );

  const userPairsSet = new Set(
    answer.pairs.map(p => `${p.leftId}-${p.rightId}`)
  );

  // Check if all pairs are correct
  const isCorrect =
    userPairsSet.size === correctPairsSet.size &&
    [...userPairsSet].every(pair => correctPairsSet.has(pair));

  // Partial credit: count correct pairs
  const correctCount = [...userPairsSet].filter(pair => correctPairsSet.has(pair)).length;
  const totalPairs = metadata.correctPairs.length;
  const pointsEarned = (correctCount / totalPairs) * maxPoints;

  return {
    isValid: true,
    isCorrect,
    pointsEarned: Math.round(pointsEarned * 100) / 100, // Round to 2 decimals
    maxPoints,
    feedback: `${correctCount}/${totalPairs} pairs correct`,
  };
}

/**
 * Validate LABELING answer
 *
 * ✅ Supports both legacy and v2 metadata:
 * - Legacy: correctLabels array with positionId/labelId
 * - V2: correctMappings array with labelId/targetId
 */
export function validateLabeling(
  answer: LabelingAnswer,
  metadata: LabelingMetadata,
  maxPoints: number = 1
): ValidationResult {
  // Get correct mappings (handle both legacy and v2)
  const correctMappings = 'correctLabels' in metadata
    ? metadata.correctLabels
    : (metadata as any).correctMappings;

  let correctCount = 0;

  for (const userLabel of answer.labels) {
    const correctLabel = correctMappings.find((cl: any) => {
      // Legacy: positionId/labelId, V2: targetId/labelId
      const targetId = 'positionId' in cl ? cl.positionId : cl.targetId;
      return targetId === userLabel.positionId && cl.labelId === userLabel.labelId;
    });

    if (correctLabel) {
      correctCount++;
    }
  }

  const totalLabels = correctMappings.length;
  const isCorrect = correctCount === totalLabels;
  const pointsEarned = (correctCount / totalLabels) * maxPoints;

  return {
    isValid: true,
    isCorrect,
    pointsEarned: Math.round(pointsEarned * 100) / 100,
    maxPoints,
    feedback: `${correctCount}/${totalLabels} labels correct`,
  };
}

/**
 * Validate ORDERING answer
 */
export function validateOrdering(
  answer: OrderingAnswer,
  metadata: OrderingMetadata,
  maxPoints: number = 1
): ValidationResult {
  const isCorrect =
    answer.order.length === metadata.correctOrder.length &&
    answer.order.every((id, index) => id === metadata.correctOrder[index]);

  // Partial credit: count items in correct position
  let correctCount = 0;
  for (let i = 0; i < Math.min(answer.order.length, metadata.correctOrder.length); i++) {
    if (answer.order[i] === metadata.correctOrder[i]) {
      correctCount++;
    }
  }

  const totalItems = metadata.correctOrder.length;
  const pointsEarned = (correctCount / totalItems) * maxPoints;

  return {
    isValid: true,
    isCorrect,
    pointsEarned: Math.round(pointsEarned * 100) / 100,
    maxPoints,
    feedback: `${correctCount}/${totalItems} items in correct position`,
  };
}

/**
 * Main validation function - routes to appropriate validator
 */
export function validateAnswer(
  questionType: QuestionType,
  answer: any,
  correctAnswer: any,
  metadata: any,
  maxPoints: number = 1
): ValidationResult {
  try {
    switch (questionType) {
      case "SINGLE_CHOICE":
        return validateSingleChoice(answer, correctAnswer, maxPoints);

      case "MULTIPLE_CHOICE":
        return validateMultipleChoice(answer, correctAnswer, maxPoints);

      case "TEXT_INPUT":
        return validateTextInput(answer, correctAnswer, maxPoints, {
          caseSensitive: metadata?.caseSensitive,
          acceptableAnswers: metadata?.acceptableAnswers,
        });

      case "MATCHING":
        return validateMatching(answer, metadata, maxPoints);

      case "LABELING":
        return validateLabeling(answer, metadata, maxPoints);

      case "ORDERING":
        return validateOrdering(answer, metadata, maxPoints);

      default:
        return {
          isValid: false,
          isCorrect: false,
          pointsEarned: 0,
          maxPoints,
          feedback: `Unknown question type: ${questionType}`,
        };
    }
  } catch (error) {
    return {
      isValid: false,
      isCorrect: false,
      pointsEarned: 0,
      maxPoints,
      feedback: `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

