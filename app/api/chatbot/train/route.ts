/**
 * Chatbot Training API Endpoint
 *
 * POST /api/chatbot/train - Start training
 * GET /api/chatbot/train?jobId=... - Get training status
 *
 * Endpoint để khởi tạo fine-tuning job
 * Nguồn: Mô hình training framework cho IELTS learning platform
 */

import { NextRequest, NextResponse } from "next/server";
import {
  prepareTrainingData,
  splitTrainingData,
  validateTrainingDataQuality,
  createFineTuningConfig,
  validateFineTuningConfig,
  executeFineTuning,
  generateTrainingReport,
  getTrainingJobStatus,
  getTrainingJobResult,
} from "@/lib/services/chatbot-finetuning.service";
import {
  generateMockTrainingDataset,
  generateExtendedMockDataset,
} from "@/lib/services/mock-training-data.service";
import { TrainingDataset } from "@/lib/types/chatbot.types";

// ============================================================================
// POST - Start Training
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dataset, useExtendedData } = body as {
      dataset?: TrainingDataset;
      useExtendedData?: boolean;
    };

    // Use mock data if no dataset provided
    let trainingDataset = dataset;
    if (!trainingDataset) {
      console.log("📦 Using mock training dataset...");
      trainingDataset = useExtendedData
        ? generateExtendedMockDataset(100)
        : generateMockTrainingDataset();
    }

    // Validate training data quality
    const qualityCheck = validateTrainingDataQuality(trainingDataset.examples);
    if (!qualityCheck.isValid) {
      return NextResponse.json(
        {
          error: "Training data quality check failed",
          issues: qualityCheck.issues,
        },
        { status: 400 }
      );
    }

    // Prepare training data
    const trainingData = prepareTrainingData(trainingDataset.examples);

    // Split into train/validation
    const { trainData, validationData } = splitTrainingData(
      trainingDataset.examples,
      0.2
    );

    // Create fine-tuning config
    const config = createFineTuningConfig(trainingDataset.id, {
      epochs: 3,
      batchSize: 32,
      learningRate: 0.0001,
    });

    // Validate config
    const configValidation = validateFineTuningConfig(config);
    if (!configValidation.isValid) {
      return NextResponse.json(
        {
          error: "Fine-tuning configuration is invalid",
          errors: configValidation.errors,
        },
        { status: 400 }
      );
    }

    // Execute fine-tuning
    const result = await executeFineTuning(config, trainingData);

    // Generate report
    const report = generateTrainingReport(config, result, trainingDataset);

    return NextResponse.json({
      success: true,
      jobId: result.jobId,
      modelId: result.modelId,
      config: {
        epochs: config.epochs,
        batchSize: config.batchSize,
        learningRate: config.learningRate,
        trainSamples: trainData.length,
        validationSamples: validationData.length,
      },
      metrics: result.metrics,
      report,
    });
  } catch (error) {
    console.error("Training error:", error);
    return NextResponse.json(
      { error: "Failed to start training job" },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Get Training Status or Results
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const action = searchParams.get("action") || "status";

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId parameter is required" },
        { status: 400 }
      );
    }

    if (action === "results") {
      // Get training results
      const result = getTrainingJobResult(jobId);
      return NextResponse.json({
        success: true,
        ...result,
      });
    } else {
      // Get training status
      const status = getTrainingJobStatus(jobId);
      return NextResponse.json({
        success: true,
        ...status,
      });
    }
  } catch (error) {
    console.error("Error getting training info:", error);
    return NextResponse.json(
      { error: "Failed to get training information" },
      { status: 500 }
    );
  }
}

