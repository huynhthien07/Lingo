/**
 * Metadata Transformer
 * 
 * Transforms V2 metadata (with pool references) to full metadata for student display
 */

import db from "@/db/drizzle";
import { questionLabels, questionItems } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { MatchingMetadata, LabelingMetadata } from "@/shared/types/questionMetadata";

interface MatchingMetadataV2 {
  version: 2;
  correctPairs: Array<{ labelId: number; itemId: number }>;
}

interface LabelingMetadataV2 {
  version: 2;
  correctMappings: Array<{ positionId: number; targetId: number }>;
}

/**
 * Transform MATCHING metadata V2 to full format
 * For Simple Matching (1 pair per question):
 * - leftItems: ONLY the label(s) in correctPairs (the question's label)
 * - rightItems: ALL items from pool (for student to choose from)
 */
export async function transformMatchingMetadata(
  metadataV2: MatchingMetadataV2,
  challengeId?: number,
  testId?: number
): Promise<MatchingMetadata> {
  const { correctPairs } = metadataV2;

  // Extract label IDs from correctPairs
  const labelIds = correctPairs.map(pair => pair.labelId);

  // Fetch ONLY labels used in this question + ALL items from pool
  const [selectedLabels, allItems] = await Promise.all([
    challengeId
      ? db.query.questionLabels.findMany({
          where: eq(questionLabels.challengeId, challengeId),
        })
      : testId
      ? db.query.questionLabels.findMany({
          where: and(
            eq(questionLabels.testId, testId),
            isNull(questionLabels.challengeId)
          ),
        })
      : [],
    challengeId
      ? db.query.questionItems.findMany({
          where: eq(questionItems.challengeId, challengeId),
        })
      : testId
      ? db.query.questionItems.findMany({
          where: and(
            eq(questionItems.testId, testId),
            isNull(questionItems.challengeId)
          ),
        })
      : [],
  ]);

  // Filter to only labels in correctPairs
  const filteredLabels = selectedLabels.filter(label => labelIds.includes(label.id));

  // Transform to full format
  return {
    leftItems: filteredLabels.map((label, index) => ({
      id: label.id,
      text: label.text,
      order: index + 1,
    })),
    rightItems: allItems.map((item, index) => ({
      id: item.id,
      text: item.text,
      order: index + 1,
    })),
    correctPairs: correctPairs.map((pair) => ({
      leftId: pair.labelId,
      rightId: pair.itemId,
    })),
  };
}

/**
 * Transform LABELING metadata V2 to full format
 * For Simple Labeling (1 mapping per question):
 * - positions: ONLY the position(s) in correctMappings (the question's position)
 * - availableLabels: ALL targets from pool (for student to choose from)
 */
export async function transformLabelingMetadata(
  metadataV2: LabelingMetadataV2,
  challengeId?: number,
  testId?: number
): Promise<LabelingMetadata> {
  const { correctMappings } = metadataV2;

  console.log("[transformLabelingMetadata] Input:", { challengeId, testId, correctMappings });

  // Extract position IDs from correctMappings
  const positionIds = correctMappings.map(mapping => mapping.positionId);

  // Fetch ONLY positions used in this question + ALL targets from pool
  const [allPositions, allTargets] = await Promise.all([
    challengeId
      ? db.query.questionLabels.findMany({
          where: eq(questionLabels.challengeId, challengeId),
        })
      : testId
      ? db.query.questionLabels.findMany({
          where: and(
            eq(questionLabels.testId, testId),
            isNull(questionLabels.challengeId)
          ),
        })
      : [],
    challengeId
      ? db.query.questionItems.findMany({
          where: eq(questionItems.challengeId, challengeId),
        })
      : testId
      ? db.query.questionItems.findMany({
          where: and(
            eq(questionItems.testId, testId),
            isNull(questionItems.challengeId)
          ),
        })
      : [],
  ]);

  // Filter to only positions in correctMappings
  const filteredPositions = allPositions.filter(pos => positionIds.includes(pos.id));

  console.log("[transformLabelingMetadata] Fetched:", {
    positionsCount: filteredPositions.length,
    targetsCount: allTargets.length,
    positions: filteredPositions,
    targets: allTargets,
  });

  // Transform to full format
  return {
    imageUrl: "", // No image for simple labeling
    positions: filteredPositions.map((pos, index) => ({
      id: pos.id,
      name: pos.text,
      order: index + 1,
    })),
    availableLabels: allTargets.map((target, index) => ({
      id: target.id,
      text: target.text,
      order: index + 1,
    })),
    correctLabels: correctMappings.map((mapping) => ({
      positionId: mapping.positionId,
      labelId: mapping.targetId,
    })),
  };
}

/**
 * Transform any metadata V2 to full format
 */
export async function transformMetadata(
  questionType: string,
  metadata: any,
  challengeId?: number,
  testId?: number
): Promise<any> {
  if (!metadata || metadata.version !== 2) {
    // Already in full format or no metadata
    return metadata;
  }

  switch (questionType) {
    case "MATCHING":
      return transformMatchingMetadata(metadata as MatchingMetadataV2, challengeId, testId);

    case "LABELING":
      return transformLabelingMetadata(metadata as LabelingMetadataV2, challengeId, testId);

    default:
      return metadata;
  }
}

