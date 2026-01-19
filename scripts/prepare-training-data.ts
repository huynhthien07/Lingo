/**
 * Prepare Training Data for Chatbot Fine-tuning
 * 
 * Script này giúp:
 * 1. Chuẩn bị dữ liệu training
 * 2. Validate dữ liệu
 * 3. Split train/validation
 * 4. Lưu vào database
 * 
 * Cách sử dụng:
 * npx ts-node scripts/prepare-training-data.ts
 */

import { TrainingDataset, TrainingExample } from "@/lib/types/chatbot.types";
import { prepareTrainingData, splitTrainingData, validateTrainingDataQuality } from "@/lib/services/chatbot-finetuning.service";

// ============================================================================
// TRAINING DATA EXAMPLES
// ============================================================================

const trainingExamples: TrainingExample[] = [
  // VOCABULARY EXAMPLES
  {
    id: "vocab_001",
    input: "What does 'collocation' mean?",
    expectedOutput: `Collocation is a combination of words that are frequently used together in English.

Definition: A collocation is a sequence of words or terms that co-occur more often than would be expected by chance.

Pronunciation: /ˌkɒl.ə'keɪ.ʃən/

Examples:
- "strong coffee" (not "powerful coffee")
- "heavy rain" (not "strong rain")
- "make a decision" (not "do a decision")

IELTS Note: Using appropriate collocations is crucial for achieving higher bands in IELTS Writing and Speaking.`,
    category: "vocabulary",
    difficulty: "intermediate",
    language: "en",
    tags: ["vocabulary", "ielts", "common"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vocab_002",
    input: "Giải thích từ 'nuance' trong tiếng Anh",
    expectedOutput: `Nuance là một sự khác biệt tinh tế hoặc một sắc thái của ý nghĩa.

Định nghĩa: Một chi tiết hoặc sự khác biệt nhỏ nhưng quan trọng trong ý nghĩa, âm thanh hoặc màu sắc.

Phát âm: /ˈnjuːɑːns/

Ví dụ:
- "The nuance of the poem is lost in translation" (Sắc thái của bài thơ bị mất khi dịch)
- "She understood the nuances of the situation" (Cô ấy hiểu những chi tiết tinh tế của tình huống)

Ghi chú IELTS: Sử dụng từ này cho thấy vốn từ vựng cao cấp.`,
    category: "vocabulary",
    difficulty: "advanced",
    language: "vi",
    tags: ["vocabulary", "ielts", "advanced"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // GRAMMAR EXAMPLES
  {
    id: "grammar_001",
    input: "Explain the difference between 'will' and 'going to'",
    expectedOutput: `Both "will" and "going to" express future tense, but they have different uses:

WILL:
- Spontaneous decisions: "I'll help you"
- Predictions: "It will rain tomorrow"
- Promises: "I will call you"
- Formal statements: "The meeting will start at 9 AM"

GOING TO:
- Plans made before: "I'm going to study tonight"
- Predictions with evidence: "Look at those clouds, it's going to rain"
- Intentions: "I'm going to learn English"

Key Difference:
- "will" = spontaneous or certain
- "going to" = planned or likely based on evidence

IELTS Tip: Use both correctly to show grammatical range.`,
    category: "grammar",
    difficulty: "intermediate",
    language: "en",
    tags: ["grammar", "ielts", "future-tense"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // MULTIPLE CHOICE EXAMPLE
  {
    id: "mc_001",
    input: "Which word best completes: 'She has a _____ for languages'?",
    expectedOutput: `The correct answer is: TALENT

Explanation:
- "talent" = natural ability or skill
- "She has a talent for languages" = She is naturally good at learning languages

Why not the others:
- "gift" - While similar, "talent" is more commonly used for skills
- "ability" - Too general; "talent" is more specific for natural ability
- "skill" - Implies learned ability, not natural

IELTS Context: This tests vocabulary and collocation knowledge. "Have a talent for" is a common collocation in IELTS.`,
    category: "multiple-choice",
    difficulty: "intermediate",
    language: "en",
    tags: ["vocabulary", "collocation", "ielts"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ERROR ANALYSIS EXAMPLE
  {
    id: "error_001",
    input: "Analyze this sentence: 'I am boring with this movie'",
    expectedOutput: `Error Found: Incorrect preposition

Incorrect: "I am boring with this movie"
Correct: "I am bored with this movie"

Explanation:
- "boring" = causing boredom (describes the thing)
- "bored" = feeling boredom (describes the person)

Rule:
- Use "bored" when the person feels boredom
- Use "boring" when something causes boredom

Examples:
- "The movie is boring" (the movie causes boredom)
- "I am bored" (I feel boredom)
- "I am bored with the movie" (I feel boredom about the movie)

IELTS Note: This is a common mistake. Using correct adjectives shows good grammar control.`,
    category: "error-analysis",
    difficulty: "intermediate",
    language: "en",
    tags: ["grammar", "adjectives", "common-mistakes"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function prepareTrainingDataset() {
  console.log("🚀 Starting Training Data Preparation...\n");

  try {
    // Step 1: Validate examples
    console.log("📋 Step 1: Validating training examples...");
    if (trainingExamples.length < 50) {
      console.warn(`⚠️  Warning: Only ${trainingExamples.length} examples. Recommended: 50+`);
    } else {
      console.log(`✅ ${trainingExamples.length} examples loaded`);
    }

    // Step 2: Prepare data
    console.log("\n📝 Step 2: Preparing training data...");
    const preparedData = await prepareTrainingData(trainingExamples);
    console.log(`✅ Data prepared: ${preparedData.length} examples`);

    // Step 3: Split data
    console.log("\n✂️  Step 3: Splitting train/validation (80/20)...");
    const { trainData, validationData } = await splitTrainingData(preparedData);
    console.log(`✅ Train: ${trainData.length} examples`);
    console.log(`✅ Validation: ${validationData.length} examples`);

    // Step 4: Validate quality
    console.log("\n🔍 Step 4: Validating data quality...");
    const qualityResult = await validateTrainingDataQuality(preparedData);
    console.log(`✅ Quality Score: ${qualityResult.score}/100`);
    if (qualityResult.issues.length > 0) {
      console.warn("⚠️  Issues found:");
      qualityResult.issues.forEach(issue => console.warn(`  - ${issue}`));
    }

    // Step 5: Create dataset
    console.log("\n📦 Step 5: Creating training dataset...");
    const dataset: TrainingDataset = {
      id: `dataset_${Date.now()}`,
      name: "IELTS Chatbot Training Data",
      description: "Training data for Domain-Specific AI Chatbot",
      examples: preparedData,
      totalExamples: preparedData.length,
      trainExamples: trainData.length,
      validationExamples: validationData.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(`✅ Dataset created: ${dataset.id}`);

    // Step 6: Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 TRAINING DATA SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total Examples: ${dataset.totalExamples}`);
    console.log(`Train Examples: ${dataset.trainExamples}`);
    console.log(`Validation Examples: ${dataset.validationExamples}`);
    console.log(`Quality Score: ${qualityResult.score}/100`);
    console.log(`Dataset ID: ${dataset.id}`);
    console.log("=".repeat(60));

    // Step 7: Next steps
    console.log("\n🚀 NEXT STEPS:");
    console.log("1. Save this dataset to database");
    console.log("2. Call API: POST /api/chatbot/train");
    console.log("3. Monitor training progress");
    console.log("4. Evaluate results");

    return dataset;
  } catch (error) {
    console.error("❌ Error preparing training data:", error);
    throw error;
  }
}

// ============================================================================
// RUN
// ============================================================================

prepareTrainingDataset()
  .then(dataset => {
    console.log("\n✅ Training data preparation complete!");
    console.log(`Dataset ID: ${dataset.id}`);
    process.exit(0);
  })
  .catch(error => {
    console.error("\n❌ Failed to prepare training data:", error);
    process.exit(1);
  });

