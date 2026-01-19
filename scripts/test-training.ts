/**
 * Test Training Script
 * 
 * Run: npx ts-node scripts/test-training.ts
 * 
 * This script demonstrates the complete training workflow:
 * 1. Generate mock training data
 * 2. Start training job
 * 3. Check training status
 * 4. Get training results
 * 5. Display metrics
 */

import {
  generateMockTrainingDataset,
  generateExtendedMockDataset,
} from "@/lib/services/mock-training-data.service";
import {
  prepareTrainingData,
  splitTrainingData,
  validateTrainingDataQuality,
  createFineTuningConfig,
  executeFineTuning,
  generateTrainingReport,
  getTrainingJobStatus,
  getTrainingJobResult,
} from "@/lib/services/chatbot-finetuning.service";

async function main() {
  console.log("🚀 IELTS Chatbot Training Demo\n");

  try {
    // Step 1: Generate mock dataset
    console.log("📦 Step 1: Generating mock training dataset...");
    const dataset = generateMockTrainingDataset();
    console.log(`✅ Generated ${dataset.examples.length} training examples\n`);

    // Step 2: Validate data quality
    console.log("🔍 Step 2: Validating training data quality...");
    const qualityCheck = validateTrainingDataQuality(dataset.examples);
    if (qualityCheck.isValid) {
      console.log("✅ Data quality check passed\n");
    } else {
      console.log("❌ Data quality issues:", qualityCheck.issues);
      return;
    }

    // Step 3: Prepare training data
    console.log("📝 Step 3: Preparing training data...");
    const trainingData = prepareTrainingData(dataset.examples);
    console.log(`✅ Prepared ${trainingData.length} training samples\n`);

    // Step 4: Split data
    console.log("✂️  Step 4: Splitting data into train/validation...");
    const { trainData, validationData } = splitTrainingData(dataset.examples, 0.2);
    console.log(`✅ Train: ${trainData.length}, Validation: ${validationData.length}\n`);

    // Step 5: Create config
    console.log("⚙️  Step 5: Creating fine-tuning configuration...");
    const config = createFineTuningConfig(dataset.id, {
      epochs: 3,
      batchSize: 32,
      learningRate: 0.0001,
    });
    console.log(`✅ Config created: ${config.id}\n`);

    // Step 6: Execute training
    console.log("🎓 Step 6: Starting fine-tuning job...");
    const result = await executeFineTuning(config, trainingData);
    console.log(`✅ Training completed!\n`);

    // Step 7: Display results
    console.log("📊 Step 7: Training Results\n");
    console.log("=".repeat(50));
    console.log(`Job ID: ${result.jobId}`);
    console.log(`Model ID: ${result.modelId}`);
    console.log(`Training Loss: ${result.trainingLoss.toFixed(4)}`);
    console.log(`Validation Loss: ${result.validationLoss.toFixed(4)}`);
    console.log("\nMetrics:");
    console.log(`  Accuracy:  ${(result.metrics.accuracy * 100).toFixed(2)}%`);
    console.log(`  Precision: ${(result.metrics.precision * 100).toFixed(2)}%`);
    console.log(`  Recall:    ${(result.metrics.recall * 100).toFixed(2)}%`);
    console.log(`  F1 Score:  ${(result.metrics.f1Score * 100).toFixed(2)}%`);
    console.log("=".repeat(50));

    // Step 8: Generate report
    console.log("\n📄 Step 8: Generating training report...");
    const report = generateTrainingReport(config, result, dataset);
    console.log(report);

    // Step 9: Check status
    console.log("\n✅ Step 9: Checking training status...");
    const status = getTrainingJobStatus(result.jobId);
    console.log(`Status: ${status.status}`);
    console.log(`Progress: ${status.progress}%`);
    console.log(`Model ID: ${status.modelId}\n`);

    // Step 10: Get results
    console.log("✅ Step 10: Retrieving training results...");
    const finalResult = getTrainingJobResult(result.jobId);
    console.log(`Final Model ID: ${finalResult.modelId}`);
    console.log(`Final Accuracy: ${(finalResult.metrics.accuracy * 100).toFixed(2)}%\n`);

    console.log("🎉 Training demo completed successfully!");
    console.log(`\n💡 Next steps:`);
    console.log(`1. Set environment variable: FINE_TUNED_MODEL_ID=${result.modelId}`);
    console.log(`2. Update .env file with the model ID`);
    console.log(`3. Restart your application`);
    console.log(`4. The chatbot will now use the fine-tuned model`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();

