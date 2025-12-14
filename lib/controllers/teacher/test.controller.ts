import db from "@/db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions, challenges } from "@/db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";

// Get all tests with pagination and search
export async function getTests(params: {
  page?: number;
  limit?: number;
  search?: string;
  testType?: string;
  examType?: string;
}) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  let whereConditions = [];

  if (params.search) {
    whereConditions.push(
      or(
        like(tests.title, `%${params.search}%`),
        like(tests.description, `%${params.search}%`)
      )
    );
  }

  if (params.testType) {
    whereConditions.push(eq(tests.testType, params.testType as any));
  }

  if (params.examType) {
    whereConditions.push(eq(tests.examType, params.examType as any));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const allTests = await db.query.tests.findMany({
    where: whereClause,
    orderBy: [desc(tests.createdAt)],
    limit,
    offset,
    with: {
      sections: {
        with: {
          questions: true,
        },
      },
    },
  });

  // Get total count
  const totalTests = await db.query.tests.findMany({
    where: whereClause,
  });

  return {
    tests: allTests,
    total: totalTests.length,
    page,
    limit,
    totalPages: Math.ceil(totalTests.length / limit),
  };
}

// Get test by ID with full details
export async function getTestById(testId: number) {
  const test = await db.query.tests.findFirst({
    where: eq(tests.id, testId),
    with: {
      sections: {
        orderBy: (sections, { asc }) => [asc(sections.order)],
        with: {
          questions: {
            orderBy: (questions, { asc }) => [asc(questions.order)],
            with: {
              options: {
                orderBy: (options, { asc }) => [asc(options.order)],
              },
            },
          },
        },
      },
    },
  });

  return test;
}

// Create new test
export async function createTest(data: {
  title: string;
  description?: string;
  imageSrc?: string;
  testType: string;
  examType: string;
  duration: number;
  createdBy: string;
}) {
  const [newTest] = await db
    .insert(tests)
    .values({
      title: data.title,
      description: data.description,
      imageSrc: data.imageSrc,
      testType: data.testType as any,
      examType: data.examType as any,
      duration: data.duration,
      createdBy: data.createdBy,
    })
    .returning();

  return newTest;
}

// Update test
export async function updateTest(
  testId: number,
  data: {
    title?: string;
    description?: string;
    imageSrc?: string;
    testType?: string;
    examType?: string;
    duration?: number;
  }
) {
  const [updatedTest] = await db
    .update(tests)
    .set({
      ...data,
      testType: data.testType as any,
      examType: data.examType as any,
      updatedAt: new Date(),
    })
    .where(eq(tests.id, testId))
    .returning();

  return updatedTest;
}

// Delete test
export async function deleteTest(testId: number) {
  await db.delete(tests).where(eq(tests.id, testId));
  return { success: true };
}

// Get all challenges (exercise bank) for adding to test
export async function getChallengesForTest(params: {
  search?: string;
  type?: string;
  skillType?: string;
  limit?: number;
}) {
  const limit = params.limit || 50;

  let whereConditions = [];

  if (params.search) {
    whereConditions.push(like(challenges.question, `%${params.search}%`));
  }

  if (params.type) {
    whereConditions.push(eq(challenges.type, params.type as any));
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const allChallenges = await db.query.challenges.findMany({
    where: whereClause,
    limit,
    with: {
      lesson: {
        with: {
          unit: {
            with: {
              course: true,
            },
          },
        },
      },
    },
  });

  return allChallenges;
}

// Add section to test
export async function addTestSection(data: {
  testId: number;
  title: string;
  skillType: string;
  duration?: number;
  passage?: string;
  audioSrc?: string;
}) {
  // Get current max order
  const existingSections = await db
    .select()
    .from(testSections)
    .where(eq(testSections.testId, data.testId));

  const order = existingSections.length + 1;

  const [newSection] = await db
    .insert(testSections)
    .values({
      testId: data.testId,
      title: data.title,
      skillType: data.skillType as any,
      order,
      duration: data.duration,
      passage: data.passage || null,
      audioSrc: data.audioSrc || null,
    })
    .returning();

  return newSection;
}

// Update test section
export async function updateTestSection(
  sectionId: number,
  data: {
    title?: string;
    skillType?: string;
    order?: number;
    duration?: number;
    passage?: string;
    audioSrc?: string;
  }
) {
  const [updatedSection] = await db
    .update(testSections)
    .set({
      ...data,
      skillType: data.skillType as any,
      passage: data.passage !== undefined ? data.passage : undefined,
      audioSrc: data.audioSrc !== undefined ? data.audioSrc : undefined,
    })
    .where(eq(testSections.id, sectionId))
    .returning();

  return updatedSection;
}

// Delete test section
export async function deleteTestSection(sectionId: number) {
  await db.delete(testSections).where(eq(testSections.id, sectionId));
  return { success: true };
}

// Add question to test section
export async function addTestQuestion(data: {
  sectionId: number;
  questionText: string;
  points: number;
  options?: Array<{ text: string; isCorrect: boolean }>;
}) {
  // Get current max order
  const existingQuestions = await db
    .select()
    .from(testQuestions)
    .where(eq(testQuestions.sectionId, data.sectionId));

  const order = existingQuestions.length + 1;

  const [newQuestion] = await db
    .insert(testQuestions)
    .values({
      sectionId: data.sectionId,
      questionText: data.questionText,
      order,
      points: data.points,
    })
    .returning();

  // Add options if provided
  if (data.options && data.options.length > 0) {
    for (let i = 0; i < data.options.length; i++) {
      await db.insert(testQuestionOptions).values({
        questionId: newQuestion.id,
        optionText: data.options[i].text,
        isCorrect: data.options[i].isCorrect,
        order: i + 1,
      });
    }
  }

  return newQuestion;
}

// Update test question
export async function updateTestQuestion(
  questionId: number,
  data: {
    questionText?: string;
    points?: number;
    options?: Array<{ text: string; isCorrect: boolean }>;
  }
) {
  const [updatedQuestion] = await db
    .update(testQuestions)
    .set({
      questionText: data.questionText,
      points: data.points,
    })
    .where(eq(testQuestions.id, questionId))
    .returning();

  // Update options if provided
  if (data.options) {
    // Delete existing options
    await db.delete(testQuestionOptions).where(eq(testQuestionOptions.questionId, questionId));

    // Add new options
    for (let i = 0; i < data.options.length; i++) {
      await db.insert(testQuestionOptions).values({
        questionId,
        optionText: data.options[i].text,
        isCorrect: data.options[i].isCorrect,
        order: i + 1,
      });
    }
  }

  return updatedQuestion;
}

// Delete test question
export async function deleteTestQuestion(questionId: number) {
  await db.delete(testQuestions).where(eq(testQuestions.id, questionId));
  return { success: true };
}

// Add option to test question
export async function addTestQuestionOption(data: {
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}) {
  const [newOption] = await db
    .insert(testQuestionOptions)
    .values({
      questionId: data.questionId,
      optionText: data.optionText,
      isCorrect: data.isCorrect,
      order: data.order,
    })
    .returning();

  return newOption;
}

// Update test question option
export async function updateTestQuestionOption(
  optionId: number,
  data: {
    optionText?: string;
    isCorrect?: boolean;
    order?: number;
  }
) {
  const [updatedOption] = await db
    .update(testQuestionOptions)
    .set(data)
    .where(eq(testQuestionOptions.id, optionId))
    .returning();

  return updatedOption;
}

// Delete test question option
export async function deleteTestQuestionOption(optionId: number) {
  await db.delete(testQuestionOptions).where(eq(testQuestionOptions.id, optionId));
  return { success: true };
}

