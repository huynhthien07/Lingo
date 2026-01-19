/**
 * Mock Training Data Service
 * 
 * Provides realistic IELTS training examples for fine-tuning
 * Includes vocabulary, grammar, multiple choice, and error analysis
 */

import { TrainingExample, TrainingDataset } from "@/lib/types/chatbot.types";

// ============================================================================
// VOCABULARY EXAMPLES
// ============================================================================

const vocabularyExamples: TrainingExample[] = [
  {
    id: "vocab_001",
    input: "What does 'collocation' mean?",
    expectedOutput: "Collocation refers to a group of words that are commonly used together in English. For example, 'strong coffee' and 'heavy rain' are collocations. Learning collocations helps you sound more natural and fluent in English.",
    category: "vocabulary",
    difficulty: "intermediate",
    language: "en",
    tags: ["vocabulary", "ielts", "common-words"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vocab_002",
    input: "Explain the word 'pragmatic'",
    expectedOutput: "Pragmatic means dealing with things in a practical, realistic way based on actual circumstances rather than theory. Example: 'We need a pragmatic approach to solve this problem.' Synonyms: practical, realistic, sensible.",
    category: "vocabulary",
    difficulty: "advanced",
    language: "en",
    tags: ["vocabulary", "ielts", "advanced-words"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "vocab_003",
    input: "What is the meaning of 'ambiguous'?",
    expectedOutput: "Ambiguous means unclear or having more than one possible meaning. Example: 'The instructions were ambiguous, so we didn't know what to do.' Related words: unclear, vague, confusing.",
    category: "vocabulary",
    difficulty: "intermediate",
    language: "en",
    tags: ["vocabulary", "ielts"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// GRAMMAR EXAMPLES
// ============================================================================

const grammarExamples: TrainingExample[] = [
  {
    id: "grammar_001",
    input: "Explain the difference between 'will' and 'going to'",
    expectedOutput: "'Will' is used for spontaneous decisions or predictions, while 'going to' is used for planned future actions. Example: 'I will help you' (spontaneous) vs 'I'm going to study tomorrow' (planned). Both express future, but 'going to' shows more intention.",
    category: "grammar",
    difficulty: "intermediate",
    language: "en",
    tags: ["grammar", "tenses", "future"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "grammar_002",
    input: "When should I use 'have been' vs 'have'?",
    expectedOutput: "'Have' is present perfect simple (completed action), while 'have been' is present perfect continuous (ongoing action). Example: 'I have finished my work' vs 'I have been working for 3 hours'. Use 'have been' to emphasize duration.",
    category: "grammar",
    difficulty: "intermediate",
    language: "en",
    tags: ["grammar", "tenses", "perfect"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "grammar_003",
    input: "Explain conditional sentences (if clauses)",
    expectedOutput: "There are 4 types: 1) Zero conditional (if + present, present) for facts, 2) First conditional (if + present, will) for likely future, 3) Second conditional (if + past, would) for unlikely situations, 4) Third conditional (if + past perfect, would have) for impossible past situations.",
    category: "grammar",
    difficulty: "advanced",
    language: "en",
    tags: ["grammar", "conditionals"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// MULTIPLE CHOICE EXAMPLES
// ============================================================================

const multipleChoiceExamples: TrainingExample[] = [
  {
    id: "mc_001",
    input: "Which answer is correct? The company has _____ its profits by 50%. A) increased B) increased C) increase D) increasing",
    expectedOutput: "The correct answer is A) increased. This is present perfect tense (has + past participle). The sentence describes a completed action with present relevance. 'Increased' is the past participle of 'increase'. B is a duplicate, C is base form (incorrect), D is gerund (incorrect).",
    category: "multiple-choice",
    difficulty: "intermediate",
    language: "en",
    tags: ["grammar", "tenses", "multiple-choice"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mc_002",
    input: "Choose the best word: Despite _____ difficulties, they succeeded. A) the B) a C) some D) many",
    expectedOutput: "The correct answer is A) the. 'Despite' is a preposition that requires a noun phrase. 'The difficulties' is the most natural choice. 'A' is correct because we're referring to specific difficulties mentioned in context. 'Some' and 'many' would work but 'the' is more formal and appropriate for IELTS.",
    category: "multiple-choice",
    difficulty: "intermediate",
    language: "en",
    tags: ["grammar", "articles", "multiple-choice"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// ERROR ANALYSIS EXAMPLES
// ============================================================================

const errorAnalysisExamples: TrainingExample[] = [
  {
    id: "error_001",
    input: "Correct this: 'I am studying English since 5 years'",
    expectedOutput: "Correction: 'I have been studying English for 5 years.' Error: Wrong tense. 'Am studying' (present continuous) is incorrect for duration. Use present perfect continuous (have been + -ing) for actions that started in the past and continue to present. 'Since' is used with specific time, 'for' with duration.",
    category: "error-analysis",
    difficulty: "intermediate",
    language: "en",
    tags: ["grammar", "tenses", "error-analysis"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "error_002",
    input: "Fix: 'She don't like coffee'",
    expectedOutput: "Correction: 'She doesn't like coffee.' Error: Subject-verb agreement. 'She' is third person singular, so use 'doesn't' (does not) instead of 'don't'. Rule: Use 'don't' with I/you/we/they, use 'doesn't' with he/she/it.",
    category: "error-analysis",
    difficulty: "beginner",
    language: "en",
    tags: ["grammar", "agreement", "error-analysis"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================================================
// GENERATE MOCK DATASET
// ============================================================================

export const generateMockTrainingDataset = (): TrainingDataset => {
  const allExamples = [
    ...vocabularyExamples,
    ...grammarExamples,
    ...multipleChoiceExamples,
    ...errorAnalysisExamples,
  ];

  return {
    id: `dataset_${Date.now()}`,
    name: "IELTS Chatbot Training Dataset",
    description: "Comprehensive training data for IELTS English learning chatbot",
    examples: allExamples,
    version: "1.0.0",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Generate extended dataset with more examples
 */
export const generateExtendedMockDataset = (count: number = 100): TrainingDataset => {
  const baseDataset = generateMockTrainingDataset();
  const baseExamples = baseDataset.examples;
  const extendedExamples: TrainingExample[] = [...baseExamples];

  // Generate additional examples by varying existing ones
  for (let i = 0; i < count - baseExamples.length; i++) {
    const baseExample = baseExamples[i % baseExamples.length];
    extendedExamples.push({
      ...baseExample,
      id: `${baseExample.id}_${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return {
    ...baseDataset,
    id: `dataset_extended_${Date.now()}`,
    examples: extendedExamples.slice(0, count),
  };
};

