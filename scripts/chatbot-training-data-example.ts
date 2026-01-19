/**
 * Chatbot Training Data Example
 * 
 * Ví dụ dữ liệu training cho Domain-Specific AI Chatbot
 * Nguồn: Mô hình training framework cho IELTS learning platform
 * 
 * Cách sử dụng:
 * 1. Mở file này
 * 2. Thêm training examples
 * 3. Chạy script để lưu vào database
 * 4. Gọi API /api/chatbot/train để bắt đầu fine-tuning
 */

import { TrainingDataset, TrainingExample } from "@/lib/types/chatbot.types";

// ============================================================================
// VOCABULARY TRAINING EXAMPLES
// ============================================================================

const vocabularyExamples: TrainingExample[] = [
  {
    id: "vocab_001",
    input: "What does 'collocation' mean?",
    expectedOutput: `Collocation is a combination of words that are frequently used together in English. 

Definition: A collocation is a sequence of words or terms that co-occur more often than would be expected by chance.

Pronunciation: /ˌkɒl.ə'keɪ.ʃən/

Part of Speech: Noun

Examples:
- "strong coffee" (not "powerful coffee")
- "heavy rain" (not "strong rain")
- "make a decision" (not "do a decision")

Synonyms: word combination, word pairing

Collocations with "collocation":
- common collocation
- natural collocation
- learn collocations

IELTS Note: Using appropriate collocations is crucial for achieving higher bands in IELTS Writing and Speaking. Examiners look for natural, accurate word combinations.`,
    category: "vocabulary",
    difficulty: "intermediate",
    language: "en",
    tags: ["vocabulary", "ielts", "common", "writing"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vocab_002",
    input: "Explain 'pragmatic' in the context of IELTS",
    expectedOutput: `Pragmatic means practical and concerned with actual facts and results rather than theory.

Definition: Dealing with things in a practical, realistic way based on actual circumstances rather than theory or principle.

Pronunciation: /præɡ'mæt.ɪk/

Part of Speech: Adjective

Examples:
- "We need a pragmatic approach to solve this problem"
- "The government took a pragmatic decision"
- "A pragmatic solution is often better than an ideal one"

Synonyms: practical, realistic, sensible, down-to-earth

Collocations:
- pragmatic approach
- pragmatic solution
- pragmatic decision

IELTS Note: This word frequently appears in IELTS Reading passages and is useful for Writing Task 1 (describing practical approaches) and Task 2 (discussing realistic solutions).`,
    category: "vocabulary",
    difficulty: "advanced",
    language: "en",
    tags: ["vocabulary", "ielts", "advanced", "reading"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// MULTIPLE CHOICE TRAINING EXAMPLES
// ============================================================================

const multipleChoiceExamples: TrainingExample[] = [
  {
    id: "mc_001",
    input: "Question: The author suggests that modern technology has...\nA) Improved human relationships\nB) Created new social problems\nC) Replaced traditional communication\nD) Had no significant impact",
    expectedOutput: `Correct Answer: B) Created new social problems

Why B is correct:
The passage discusses how technology has led to issues like social isolation, cyberbullying, and reduced face-to-face interaction. The author presents evidence of negative social consequences.

Why not A:
While the passage mentions some benefits, the overall tone and evidence focus on problems rather than improvements.

Why not C:
The passage doesn't suggest technology has completely replaced traditional communication, only that it has changed how people interact.

Why not D:
The passage clearly demonstrates that technology has had significant impacts on society, both positive and negative.

Key Learning Point:
When answering multiple-choice questions, look for the answer that best matches the author's main argument and the supporting evidence in the passage. Pay attention to qualifiers like "suggests," "implies," and "indicates."`,
    category: "multiple-choice",
    difficulty: "intermediate",
    language: "en",
    tags: ["reading", "ielts", "multiple-choice"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// GRAMMAR TRAINING EXAMPLES
// ============================================================================

const grammarExamples: TrainingExample[] = [
  {
    id: "grammar_001",
    input: "Explain the difference between 'will' and 'going to'",
    expectedOutput: `Grammar Point: Future Tense - "will" vs "going to"

Rule:
- "will" is used for decisions made at the moment of speaking, predictions, and promises
- "going to" is used for plans made before speaking and predictions based on present evidence

Correct Examples:
- "I will help you" (decision made now)
- "I'm going to study tomorrow" (plan made before)
- "It's going to rain" (based on dark clouds)
- "I will call you later" (promise)

Incorrect Examples:
- "I'm going to help you" (when deciding at the moment)
- "I will study tomorrow" (when you already planned it)

Common Mistakes Vietnamese Learners Make:
1. Using "will" for all future situations
2. Confusing "going to" with present continuous
3. Not recognizing the difference in meaning

Tips:
- "will" = spontaneous decision or prediction
- "going to" = pre-planned or based on evidence

IELTS Usage:
In IELTS Writing Task 2, use "will" for general statements about the future. In Speaking, use both naturally depending on context.`,
    category: "grammar",
    difficulty: "intermediate",
    language: "en",
    tags: ["grammar", "ielts", "future-tense"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// ERROR ANALYSIS TRAINING EXAMPLES
// ============================================================================

const errorAnalysisExamples: TrainingExample[] = [
  {
    id: "error_001",
    input: "The student are studying hard for the exam.",
    expectedOutput: `Error Analysis:

Error 1: Subject-Verb Agreement
- Incorrect: "The student are studying"
- Correct: "The student is studying" OR "The students are studying"
- Explanation: "student" is singular, so it requires "is" not "are"
- Tip: Always check if the subject is singular or plural before choosing the verb form

Error 2: Potential Improvement
- Original: "The student are studying hard for the exam"
- Better: "The student is studying hard for the exam" or "The students are studying hard for the exam"
- Explanation: Be clear about whether you're talking about one or multiple students

Common Mistakes Vietnamese Learners Make:
- Forgetting to add 's' to singular verbs
- Using plural verbs with singular subjects
- Not paying attention to collective nouns

Tips:
- Identify the subject first
- Check if it's singular or plural
- Match the verb form accordingly`,
    category: "error-analysis",
    difficulty: "beginner",
    language: "en",
    tags: ["grammar", "error-analysis", "beginner"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// COMPLETE TRAINING DATASET
// ============================================================================

export const chatbotTrainingDataset: TrainingDataset = {
  id: "ielts_training_v1",
  name: "IELTS Chatbot Training Dataset v1",
  description:
    "Comprehensive training dataset for Domain-Specific AI Chatbot focused on IELTS learning",
  examples: [
    ...vocabularyExamples,
    ...multipleChoiceExamples,
    ...grammarExamples,
    ...errorAnalysisExamples,
  ],
  version: "1.0",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ============================================================================
// EXPORT FOR USAGE
// ============================================================================

export const getTrainingDataset = (): TrainingDataset => {
  return chatbotTrainingDataset;
};

export const getExamplesByMode = (mode: string): TrainingExample[] => {
  return chatbotTrainingDataset.examples.filter((ex) => ex.category === mode);
};

export const getExamplesByDifficulty = (
  difficulty: string
): TrainingExample[] => {
  return chatbotTrainingDataset.examples.filter(
    (ex) => ex.difficulty === difficulty
  );
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// To use this training data:

import { chatbotTrainingDataset } from '@/scripts/chatbot-training-data-example';

// 1. Start training
const response = await fetch('/api/chatbot/train', {
  method: 'POST',
  body: JSON.stringify({ dataset: chatbotTrainingDataset })
});

const result = await response.json();
console.log('Training started:', result.jobId);

// 2. Get examples by mode
const vocabExamples = getExamplesByMode('vocabulary');
console.log('Vocabulary examples:', vocabExamples.length);

// 3. Get examples by difficulty
const advancedExamples = getExamplesByDifficulty('advanced');
console.log('Advanced examples:', advancedExamples.length);
*/

