/**
 * OpenAI Integration Service
 * 
 * Sử dụng OpenAI API (gpt-3.5-turbo) để:
 * 1. Generate chatbot responses
 * 2. Fine-tune models
 * 3. Evaluate responses
 * 
 * Cách sử dụng:
 * import { generateResponse, createFineTuningJob } from "@/lib/services/openai-integration.service";
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use fine-tuned model if available, otherwise use base model
const FINE_TUNED_MODEL = process.env.FINE_TUNED_MODEL_ID || "gpt-3.5-turbo";
const BASE_MODEL = "gpt-3.5-turbo";

// ============================================================================
// CHAT COMPLETIONS - Generate Responses
// ============================================================================

/**
 * Generate chatbot response using gpt-3.5-turbo
 * 
 * @param systemPrompt - System instruction for the model
 * @param userMessage - User's question or request
 * @param options - Additional options (temperature, max_tokens, etc.)
 * @returns Generated response text
 */
export const generateResponse = async (
  systemPrompt: string,
  userMessage: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    useFinetuned?: boolean;
  }
): Promise<string> => {
  try {
    // Use fine-tuned model if available and requested
    const modelToUse = options?.useFinetuned !== false && FINE_TUNED_MODEL !== BASE_MODEL
      ? FINE_TUNED_MODEL
      : BASE_MODEL;

    const response = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
      top_p: options?.topP ?? 1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    return content;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};

/**
 * Generate batch responses
 * 
 * @param systemPrompt - System instruction
 * @param messages - Array of user messages
 * @returns Array of responses
 */
export const generateBatchResponses = async (
  systemPrompt: string,
  messages: string[]
): Promise<string[]> => {
  const responses: string[] = [];

  for (const message of messages) {
    const response = await generateResponse(systemPrompt, message);
    responses.push(response);
  }

  return responses;
};

// ============================================================================
// FINE-TUNING - Train Models
// ============================================================================

/**
 * Create fine-tuning job
 * 
 * @param trainingFileId - ID of training file uploaded to OpenAI
 * @param validationFileId - ID of validation file (optional)
 * @param options - Fine-tuning options
 * @returns Fine-tuning job details
 */
export const createFineTuningJob = async (
  trainingFileId: string,
  validationFileId?: string,
  options?: {
    epochs?: number;
    batchSize?: number;
    learningRateMultiplier?: number;
  }
): Promise<{
  jobId: string;
  modelId: string | null;
  status: string;
}> => {
  try {
    const job = await openai.fineTuning.jobs.create({
      training_file: trainingFileId,
      validation_file: validationFileId,
      model: "gpt-3.5-turbo",
      hyperparameters: {
        n_epochs: options?.epochs ?? 3,
        batch_size: options?.batchSize ?? 32,
        learning_rate_multiplier: options?.learningRateMultiplier ?? 0.1,
      },
    });

    return {
      jobId: job.id,
      modelId: job.fine_tuned_model ?? null,
      status: job.status,
    };
  } catch (error) {
    console.error("Error creating fine-tuning job:", error);
    throw error;
  }
};

/**
 * Get fine-tuning job status
 * 
 * @param jobId - Fine-tuning job ID
 * @returns Job status and details
 */
export const getFineTuningJobStatus = async (
  jobId: string
): Promise<{
  status: string;
  modelId: string | null;
  createdAt: number;
  finishedAt: number | null;
}> => {
  try {
    const job = await openai.fineTuning.jobs.retrieve(jobId);

    return {
      status: job.status,
      modelId: job.fine_tuned_model ?? null,
      createdAt: job.created_at,
      finishedAt: job.finished_at ?? null,
    };
  } catch (error) {
    console.error("Error getting job status:", error);
    throw error;
  }
};

/**
 * List fine-tuning jobs
 * 
 * @returns Array of fine-tuning jobs
 */
export const listFineTuningJobs = async (): Promise<
  Array<{
    jobId: string;
    status: string;
    modelId: string | null;
  }>
> => {
  try {
    const jobs = await openai.fineTuning.jobs.list();

    return jobs.data.map((job) => ({
      jobId: job.id,
      status: job.status,
      modelId: job.fine_tuned_model ?? null,
    }));
  } catch (error) {
    console.error("Error listing jobs:", error);
    throw error;
  }
};

// ============================================================================
// FILE MANAGEMENT - Upload Training Data
// ============================================================================

/**
 * Upload training file to OpenAI
 * 
 * @param fileContent - File content (JSONL format)
 * @param filename - File name
 * @returns File ID
 */
export const uploadTrainingFile = async (
  fileContent: string,
  filename: string
): Promise<string> => {
  try {
    // Convert string to File object
    const blob = new Blob([fileContent], { type: "application/json" });
    const file = new File([blob], filename, { type: "application/json" });

    const response = await openai.files.create({
      file: file,
      purpose: "fine-tune",
    });

    return response.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Delete file from OpenAI
 * 
 * @param fileId - File ID to delete
 */
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await openai.files.del(fileId);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// ============================================================================
// MODELS - List Available Models
// ============================================================================

/**
 * List available models
 * 
 * @returns Array of available models
 */
export const listModels = async (): Promise<
  Array<{
    id: string;
    owned_by: string;
  }>
> => {
  try {
    const models = await openai.models.list();

    return models.data.map((model) => ({
      id: model.id,
      owned_by: model.owned_by,
    }));
  } catch (error) {
    console.error("Error listing models:", error);
    throw error;
  }
};

/**
 * Get model details
 * 
 * @param modelId - Model ID
 * @returns Model details
 */
export const getModelDetails = async (
  modelId: string
): Promise<{
  id: string;
  owned_by: string;
  created: number;
}> => {
  try {
    const model = await openai.models.retrieve(modelId);

    return {
      id: model.id,
      owned_by: model.owned_by,
      created: model.created,
    };
  } catch (error) {
    console.error("Error getting model details:", error);
    throw error;
  }
};

// ============================================================================
// USAGE - Check API Usage
// ============================================================================

/**
 * Check API usage
 * Note: This requires additional API call to billing endpoint
 */
export const checkApiUsage = async (): Promise<{
  totalUsage: number;
  message: string;
}> => {
  try {
    // Note: This is a placeholder
    // Actual usage checking requires billing API
    return {
      totalUsage: 0,
      message: "Check usage at https://platform.openai.com/account/billing/overview",
    };
  } catch (error) {
    console.error("Error checking usage:", error);
    throw error;
  }
};

export default {
  generateResponse,
  generateBatchResponses,
  createFineTuningJob,
  getFineTuningJobStatus,
  listFineTuningJobs,
  uploadTrainingFile,
  deleteFile,
  listModels,
  getModelDetails,
  checkApiUsage,
};

