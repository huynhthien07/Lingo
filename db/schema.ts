// ============================================================================
// IELTS LEARNING PLATFORM - DATABASE SCHEMA
// ============================================================================
// This schema is designed for a comprehensive IELTS learning platform
// supporting Students, Teachers, and Admins with full course management,
// assessment, and gamification features.
//
// References:
// - Drizzle ORM Documentation: https://orm.drizzle.team/docs/overview
// - PostgreSQL Best Practices: https://wiki.postgresql.org/wiki/Don%27t_Do_This
// - Database Design Patterns: Martin Fowler's "Patterns of Enterprise Application Architecture"
// ============================================================================

import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

// ============================================================================
// ENUMS - Define all enumerated types for type safety
// ============================================================================
// Reference: PostgreSQL Enum Types - https://www.postgresql.org/docs/current/datatype-enum.html

// User roles following Role-Based Access Control (RBAC) pattern
// Reference: NIST RBAC Model - https://csrc.nist.gov/projects/role-based-access-control
export const roleEnum = pgEnum("role", ["STUDENT", "TEACHER", "ADMIN"]);

// Exam types supported by the platform
export const examTypeEnum = pgEnum("exam_type", ["IELTS", "TOEFL", "TOEIC", "GENERAL"]);

// Course difficulty levels following CEFR framework
// Reference: Common European Framework of Reference for Languages (CEFR)
// https://www.coe.int/en/web/common-european-framework-reference-languages
export const levelEnum = pgEnum("level", [
    "BEGINNER",           // A1
    "ELEMENTARY",         // A2
    "INTERMEDIATE",       // B1
    "UPPER_INTERMEDIATE", // B2
    "ADVANCED"            // C1-C2
]);

// Skill types based on language learning taxonomy
export const skillTypeEnum = pgEnum("skill_type", [
    "LISTENING",
    "READING",
    "WRITING",
    "SPEAKING",
    "VOCABULARY",
    "GRAMMAR"
]);

// Challenge types mapped to IELTS question formats
// Reference: IELTS Official Test Format - https://www.ielts.org/for-test-takers/test-format
export const challengeTypeEnum = pgEnum("challenge_type", [
    // Listening question types (UC1-UC4)
    "LISTENING_MULTIPLE_CHOICE",
    "LISTENING_FORM_COMPLETION",
    "LISTENING_MAP_LABELLING",
    "LISTENING_SHORT_ANSWER",

    // Reading question types (UC5-UC9)
    "READING_MULTIPLE_CHOICE",
    "READING_TRUE_FALSE_NOT_GIVEN",
    "READING_MATCHING_HEADINGS",
    "READING_SENTENCE_COMPLETION",
    "READING_SUMMARY_COMPLETION",

    // Writing task types (UC10-UC12)
    "WRITING_TASK_1",  // Describe visual information
    "WRITING_TASK_2",  // Essay writing
    "WRITING_PRACTICE",

    // Speaking task types (UC13-UC15)
    "SPEAKING_PART_1", // Introduction and interview
    "SPEAKING_PART_2", // Individual long turn
    "SPEAKING_PART_3", // Two-way discussion
]);

// Difficulty levels for adaptive learning
export const difficultyEnum = pgEnum("difficulty", ["EASY", "MEDIUM", "HARD"]);

// Submission workflow states
export const submissionStatusEnum = pgEnum("submission_status", [
    "PENDING",   // Submitted, waiting for teacher
    "GRADING",   // Teacher is reviewing
    "GRADED",    // Graded, not yet returned
    "RETURNED"   // Feedback sent to student
]);

// Test types for assessment categorization
export const testTypeEnum = pgEnum("test_type", [
    "PRACTICE",      // Practice exercises
    "MOCK_TEST",     // Simulated exam
    "FULL_TEST",     // Complete IELTS test (excluding Speaking & Writing)
    "ADMISSION_TEST", // Placement test
    "SPEAKING_TEST", // Speaking only test (needs teacher grading)
    "WRITING_TEST"   // Writing only test (needs teacher grading)
]);

// Test attempt tracking
export const testAttemptStatusEnum = pgEnum("test_attempt_status", [
    "IN_PROGRESS",
    "COMPLETED",
    "ABANDONED"
]);

// Payment processing states
// Reference: Stripe Payment Intents - https://stripe.com/docs/payments/payment-intents
export const paymentStatusEnum = pgEnum("payment_status", [
    "PENDING",
    "COMPLETED",
    "FAILED",
    "REFUNDED"
]);

// Course enrollment states
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
    "ACTIVE",
    "COMPLETED",
    "DROPPED",
    "SUSPENDED"
]);

// Enrollment type for business logic
export const enrollmentTypeEnum = pgEnum("enrollment_type", [
    "FREE",
    "PAID",
    "ADMIN_GRANTED"
]);

// Achievement categories for gamification
// Reference: Gamification Design Patterns - Yu-kai Chou's Octalysis Framework
// https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/
export const achievementTypeEnum = pgEnum("achievement_type", [
    "POINTS",        // Point milestones
    "COMPLETION",    // Course/lesson completion
    "STREAK",        // Daily streak achievements
    "SKILL_MASTERY", // Skill-specific achievements
    "SPECIAL"        // Special events
]);

// Leaderboard time periods
export const periodEnum = pgEnum("period", [
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "ALL_TIME"
]);

// Chat message sender types
export const senderEnum = pgEnum("sender", [
    "USER",
    "AI",
    "SYSTEM"
]);

// ============================================================================
// CORE TABLES - User Management & Progress Tracking
// ============================================================================

// 3.1 Users table - Central user management
// Reference: Clerk Authentication - https://clerk.com/docs
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().unique(), // Clerk user ID
    email: text("email").notNull().unique(),
    userName: text("user_name").notNull().default("User"),
    userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
    status: text("status").notNull().default("active"), // active, blocked, suspended
    role: roleEnum("role").notNull().default("STUDENT"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at"),
    // Additional user information
    firstName: text("first_name"),
    lastName: text("last_name"),
    phoneNumber: text("phone_number"),
    dateOfBirth: timestamp("date_of_birth"),
    country: text("country"),
    language: text("language").default("en"), // UI language preference
    timezone: text("timezone"),
});

// 3.2 User progress table - Track learning progress and gamification
// Note: Removed 'hearts' field as per requirements (BR65-BR66)
export const userProgress = pgTable("user_progress", {
    userId: text("user_id").primaryKey().references(() => users.userId, { onDelete: "cascade" }),
    activeCourseId: integer("active_course_id").references(() => courses.id, { onDelete: "set null" }),
    points: integer("points").notNull().default(0), // Gamification points (BR65)
    level: integer("level").notNull().default(1), // User level based on points
    overallBandScore: real("overall_band_score").default(0.0),
    listeningScore: real("listening_score").default(0.0),
    readingScore: real("reading_score").default(0.0),
    writingScore: real("writing_score").default(0.0),
    speakingScore: real("speaking_score").default(0.0),
});

// ============================================================================
// COURSE STRUCTURE TABLES
// ============================================================================

// 3.4 Courses table - Main course catalog
export const courses = pgTable("courses", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    imageSrc: text("image_src").notNull(),
    description: text("description"),
    examType: examTypeEnum("exam_type").notNull().default("IELTS"),
    level: levelEnum("level").notNull().default("INTERMEDIATE"),
    price: integer("price").notNull().default(0), // Price in cents (e.g., 2000 = $20.00)
    currency: text("currency").notNull().default("USD"),
    isFree: boolean("is_free").notNull().default(false),
    createdBy: text("created_by").notNull(), // Clerk userId of the teacher who created this course
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// 3.5 Units table - Course units/modules
export const units = pgTable("units", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    order: integer("order").notNull(),
});

// 3.6 Lessons table - Individual lessons within units
export const lessons = pgTable("lessons", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    unitId: integer("unit_id").references(() => units.id, { onDelete: "cascade" }).notNull(),
    order: integer("order").notNull(),
    skillType: skillTypeEnum("skill_type").notNull(),
    estimatedDuration: integer("estimated_duration"), // in minutes
    videoUrl: text("video_url"), // URL to lesson video
});

// ============================================================================
// CHALLENGE/EXERCISE TABLES - UC1-UC15
// ============================================================================

// 3.7 Challenges table - Exercises/questions
export const challenges = pgTable("challenges", {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    type: challengeTypeEnum("type").notNull(),
    question: text("question").notNull(),
    passage: text("passage"), // For reading exercises (UC5-UC9)
    audioSrc: text("audio_src"), // For listening exercises (UC1-UC4)
    imageSrc: text("image_src"), // For diagram/map exercises (UC3)
    order: integer("order").notNull(),
    difficulty: difficultyEnum("difficulty").default("MEDIUM"),
    points: integer("points").notNull().default(10), // Points awarded (BR65)
    explanation: text("explanation"), // Explanation for correct answer
});

// 3.8 Questions table - Questions for each exercise
export const questions = pgTable("questions", {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    text: text("text").notNull(),
    imageSrc: text("image_src"), // Image for question (e.g., diagram, chart)
    correctAnswer: text("correct_answer"), // Correct answer for this specific question (e.g., for fill-in-blank, verb conjugation)
    explanation: text("explanation"), // Explanation for this specific question's answer
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// 3.9 Challenge options table - Multiple choice options / Fill-in-blank answers
export const challengeOptions = pgTable("challenge_options", {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }),
    questionId: integer("question_id").references(() => questions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    correct: boolean("correct").notNull(),
    imageSrc: text("image_src"),
    audioSrc: text("audio_src"),
    order: integer("order").notNull(),
});

// 3.10 Challenge metadata table - Additional data for special challenge types
export const challengeMetadata = pgTable("challenge_metadata", {
    id: serial("id").primaryKey(),
    challengeId: integer("challenge_id").unique().references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    formStructure: text("form_structure"), // JSON for form/table completion (UC2)
    mapCoordinates: text("map_coordinates"), // JSON for map labelling (UC3)
    headingsList: text("headings_list"), // JSON for matching headings (UC7)
    keywords: text("keywords"), // Keywords for short answer (UC4)
    minWords: integer("min_words"), // Min words for writing tasks (BR38)
    maxWords: integer("max_words"), // Max words for writing tasks
    taskType: text("task_type"), // e.g., "describe_chart", "essay"
});

// 3.10 Challenge progress table - Track student progress on challenges
export const challengeProgress = pgTable("challenge_progress", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    completed: boolean("completed").notNull().default(false),
    userAnswer: text("user_answer"), // Student's answer
    score: integer("score").notNull().default(0), // Points earned (can be partial - BR8)
    completedAt: timestamp("completed_at"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
});

// ============================================================================
// SUBMISSION TABLES - Writing & Speaking (UC10-UC15, UC32)
// ============================================================================

// 3.11 Writing submissions table - Student writing submissions
export const writingSubmissions = pgTable("writing_submissions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    content: text("content").notNull(),
    wordCount: integer("word_count").notNull(),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    // IELTS Band scores (0-9 scale) - BR129
    taskAchievementScore: real("task_achievement_score"),
    coherenceCohesionScore: real("coherence_cohesion_score"),
    lexicalResourceScore: real("lexical_resource_score"),
    grammaticalRangeScore: real("grammatical_range_score"),
    overallBandScore: real("overall_band_score"),
    // Feedback
    teacherFeedback: text("teacher_feedback"), // BR130: min 20 characters
    teacherId: text("teacher_id").references(() => users.userId, { onDelete: "set null" }),
    status: submissionStatusEnum("status").notNull().default("PENDING"),
    gradedAt: timestamp("graded_at"),
});

// 3.12 Writing feedback table - Detailed feedback for writing
export const writingFeedback = pgTable("writing_feedback", {
    id: serial("id").primaryKey(),
    submissionId: integer("submission_id").references(() => writingSubmissions.id, { onDelete: "cascade" }).notNull(),
    feedbackType: text("feedback_type").notNull(), // grammar, vocabulary, coherence, etc.
    content: text("content").notNull(),
    createdBy: text("created_by").references(() => users.userId, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3.13 Speaking submissions table - Student speaking submissions
export const speakingSubmissions = pgTable("speaking_submissions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
    audioUrl: text("audio_url").notNull(),
    duration: integer("duration"), // in seconds (BR50, BR54, BR58: min 10-15s)
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    // IELTS Band scores (0-9 scale) - BR129
    fluencyCoherenceScore: real("fluency_coherence_score"),
    lexicalResourceScore: real("lexical_resource_score"),
    grammaticalRangeScore: real("grammatical_range_score"),
    pronunciationScore: real("pronunciation_score"),
    overallBandScore: real("overall_band_score"),
    // Feedback
    teacherFeedback: text("teacher_feedback"), // BR130: min 20 characters
    teacherId: text("teacher_id").references(() => users.userId, { onDelete: "set null" }),
    status: submissionStatusEnum("status").notNull().default("PENDING"),
    gradedAt: timestamp("graded_at"),
});

// 3.14 Speaking feedback table - Detailed feedback for speaking
export const speakingFeedback = pgTable("speaking_feedback", {
    id: serial("id").primaryKey(),
    submissionId: integer("submission_id").references(() => speakingSubmissions.id, { onDelete: "cascade" }).notNull(),
    feedbackType: text("feedback_type").notNull(), // pronunciation, fluency, etc.
    content: text("content").notNull(),
    createdBy: text("created_by").references(() => users.userId, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// TEST TABLES - Mock tests and assessments
// ============================================================================

// 3.15 Tests table - Full tests/mock exams
export const tests = pgTable("tests", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    imageSrc: text("image_src"),
    testType: testTypeEnum("test_type").notNull().default("PRACTICE"),
    examType: examTypeEnum("exam_type").notNull().default("IELTS"),
    duration: integer("duration").notNull().default(30), // Duration in minutes
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdBy: text("created_by").references(() => users.userId, { onDelete: "set null" }),
});

// 3.16 Test sections table - Sections within a test (Listening, Reading, etc.)
export const testSections = pgTable("test_sections", {
    id: serial("id").primaryKey(),
    testId: integer("test_id").references(() => tests.id, { onDelete: "cascade" }).notNull(),
    title: text("title").notNull(),
    skillType: skillTypeEnum("skill_type").notNull(),
    order: integer("order").notNull(),
    duration: integer("duration"), // Section duration in minutes
    passage: text("passage"), // Shared passage for reading sections (all questions use this)
    imageSrc: text("image_src"), // Shared image for section (e.g., context image, diagram)
    audioSrc: text("audio_src"), // Shared audio for listening sections (all questions use this)
});

// 3.17 Test questions table - Questions within test sections
export const testQuestions = pgTable("test_questions", {
    id: serial("id").primaryKey(),
    sectionId: integer("section_id").references(() => testSections.id, { onDelete: "cascade" }).notNull(),
    questionText: text("question_text").notNull(),
    imageSrc: text("image_src"), // Image for question (e.g., diagram, chart)
    audioSrc: text("audio_src"), // Audio for individual question (if different from section audio)
    order: integer("order").notNull(),
    points: integer("points").notNull().default(1),
});

// 3.18 Test question options table - Answer options for test questions
export const testQuestionOptions = pgTable("test_question_options", {
    id: serial("id").primaryKey(),
    questionId: integer("question_id").references(() => testQuestions.id, { onDelete: "cascade" }).notNull(),
    optionText: text("option_text").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    order: integer("order").notNull(),
});

// 3.19 Test attempts table - Track student test attempts
export const testAttempts = pgTable("test_attempts", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    testId: integer("test_id").references(() => tests.id, { onDelete: "cascade" }).notNull(),
    status: testAttemptStatusEnum("status").notNull().default("IN_PROGRESS"),
    score: integer("score").default(0),
    totalPoints: integer("total_points"),
    bandScore: real("band_score"), // Overall IELTS band score
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
});

// 3.20 Test answers table - Student answers for test questions
export const testAnswers = pgTable("test_answers", {
    id: serial("id").primaryKey(),
    attemptId: integer("attempt_id").references(() => testAttempts.id, { onDelete: "cascade" }).notNull(),
    questionId: integer("question_id").references(() => testQuestions.id, { onDelete: "cascade" }).notNull(),
    selectedOptionId: integer("selected_option_id").references(() => testQuestionOptions.id, { onDelete: "set null" }),
    textAnswer: text("text_answer"), // For open-ended questions
    isCorrect: boolean("is_correct"),
    pointsEarned: integer("points_earned").default(0),
    answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

// 3.21 Test submissions table - Speaking/Writing test submissions for teacher grading
export const testSubmissions = pgTable("test_submissions", {
    id: serial("id").primaryKey(),
    attemptId: integer("attempt_id").references(() => testAttempts.id, { onDelete: "cascade" }).notNull(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    testId: integer("test_id").references(() => tests.id, { onDelete: "cascade" }).notNull(),
    questionId: integer("question_id").references(() => testQuestions.id, { onDelete: "cascade" }),
    skillType: skillTypeEnum("skill_type").notNull(), // SPEAKING or WRITING
    audioUrl: text("audio_url"), // For speaking submissions
    textAnswer: text("text_answer"), // For writing submissions

    // Overall score (deprecated - use criteria scores instead)
    score: integer("score"), // Overall score (for backward compatibility)
    maxScore: integer("max_score").default(9), // Maximum score (IELTS band 9)

    // Speaking criteria scores (0-9 scale)
    fluencyCoherenceScore: real("fluency_coherence_score"), // Speaking: Fluency & Coherence
    pronunciationScore: real("pronunciation_score"), // Speaking: Pronunciation

    // Writing criteria scores (0-9 scale)
    taskAchievementScore: real("task_achievement_score"), // Writing: Task Achievement
    coherenceCohesionScore: real("coherence_cohesion_score"), // Writing/Speaking: Coherence & Cohesion

    // Common criteria scores (0-9 scale)
    lexicalResourceScore: real("lexical_resource_score"), // Both: Lexical Resource (Vocabulary)
    grammaticalRangeScore: real("grammatical_range_score"), // Both: Grammatical Range & Accuracy

    // Overall band score (calculated from criteria scores)
    overallBandScore: real("overall_band_score"), // Average of all criteria scores

    feedback: text("feedback"), // Teacher's feedback
    status: submissionStatusEnum("status").notNull().default("PENDING"),
    gradedBy: text("graded_by").references(() => users.userId, { onDelete: "set null" }),
    gradedAt: timestamp("graded_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// VOCABULARY TABLES - Flashcard system (UC23, UC29)
// ============================================================================

// 3.21 Vocabulary topics table - Flashcard categories
export const vocabularyTopics = pgTable("vocabulary_topics", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    imageSrc: text("image_src"),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdBy: text("created_by").references(() => users.userId, { onDelete: "set null" }),
});

// 3.22 Vocabulary words table - Individual flashcards (BR97, BR120)
export const vocabularyWords = pgTable("vocabulary_words", {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id").references(() => vocabularyTopics.id, { onDelete: "cascade" }).notNull(),
    word: text("word").notNull(),
    pronunciation: text("pronunciation"), // IPA or phonetic
    audioSrc: text("audio_src"), // Audio pronunciation
    meaning: text("meaning").notNull(),
    example: text("example"), // Example sentence
    imageSrc: text("image_src"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3.23 User vocabulary table - Track user's vocabulary progress (BR99, BR100)
export const userVocabulary = pgTable("user_vocabulary", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    wordId: integer("word_id").references(() => vocabularyWords.id, { onDelete: "cascade" }).notNull(),
    mastered: boolean("mastered").notNull().default(false),
    reviewCount: integer("review_count").notNull().default(0),
    lastReviewedAt: timestamp("last_reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// ENROLLMENT & PAYMENT TABLES - UC25
// ============================================================================

// 3.24 Course enrollments table - Student course registrations (BR106, BR107)
export const courseEnrollments = pgTable("course_enrollments", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    enrollmentType: enrollmentTypeEnum("enrollment_type").notNull().default("PAID"),
    status: enrollmentStatusEnum("status").notNull().default("ACTIVE"),
    progress: integer("progress").notNull().default(0), // Percentage 0-100
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
});

// 3.25 Lesson progress table - Track lesson completion
export const lessonProgress = pgTable("lesson_progress", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
});

// 3.26 Course payments table - One-time course payments (replaces subscription)
// Reference: Stripe Payment Intents API
export const coursePayments = pgTable("course_payments", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    amount: integer("amount").notNull(), // Amount in cents
    currency: text("currency").notNull().default("USD"),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    stripeCustomerId: text("stripe_customer_id"),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// TEACHER TABLES - UC27-UC33
// ============================================================================

// 3.27 Teacher assignments table - Assign teachers to courses (BR113, BR117, BR119, BR122, BR125)
export const teacherAssignments = pgTable("teacher_assignments", {
    id: serial("id").primaryKey(),
    teacherId: text("teacher_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// 3.28 Student-teacher relations table - Track teacher-student relationships
export const studentTeacherRelations = pgTable("student_teacher_relations", {
    id: serial("id").primaryKey(),
    studentId: text("student_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    teacherId: text("teacher_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// GAMIFICATION TABLES - UC19, UC26, BR65-BR66
// ============================================================================

// 3.29 Achievements table - Define available achievements
export const achievements = pgTable("achievements", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    imageSrc: text("image_src"),
    type: achievementTypeEnum("type").notNull(),
    requirement: integer("requirement").notNull(), // e.g., 1000 points, 10 lessons
    points: integer("points").notNull().default(0), // Points awarded for earning this
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3.30 User achievements table - Track earned achievements
export const userAchievements = pgTable("user_achievements", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    achievementId: integer("achievement_id").references(() => achievements.id, { onDelete: "cascade" }).notNull(),
    earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// 3.31 Leaderboards table - Define leaderboard types (BR109-BR112)
export const leaderboards = pgTable("leaderboards", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
    period: periodEnum("period").notNull().default("ALL_TIME"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3.32 Leaderboard entries table - Leaderboard rankings
export const leaderboardEntries = pgTable("leaderboard_entries", {
    id: serial("id").primaryKey(),
    leaderboardId: integer("leaderboard_id").references(() => leaderboards.id, { onDelete: "cascade" }).notNull(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    rank: integer("rank").notNull(),
    score: integer("score").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// CHAT TABLES - Chatbot (UC24, BR101-BR105)
// ============================================================================

// 3.33 Chat sessions table - Chat conversation sessions
export const chatSessions = pgTable("chat_sessions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.userId, { onDelete: "cascade" }).notNull(),
    title: text("title"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3.34 Chat messages table - Individual chat messages
export const chatMessages = pgTable("chat_messages", {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id").references(() => chatSessions.id, { onDelete: "cascade" }).notNull(),
    sender: senderEnum("sender").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// INTERNATIONALIZATION TABLE - Multi-language UI (UC36, BR141-BR144)
// ============================================================================

// 3.35 Language packs table - UI translations
export const languagePacks = pgTable("language_packs", {
    id: serial("id").primaryKey(),
    locale: text("locale").notNull(), // en, vi, etc.
    namespace: text("namespace").notNull(), // common, auth, course, etc.
    key: text("key").notNull(), // button.submit, label.email, etc.
    value: text("value").notNull(), // Translated text
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// RELATIONS - Define relationships between tables
// ============================================================================
// Reference: Drizzle ORM Relations - https://orm.drizzle.team/docs/rqb

// Users relations
export const usersRelations = relations(users, ({ one, many }) => ({
    userProgress: one(userProgress, {
        fields: [users.userId],
        references: [userProgress.userId],
    }),
    enrollments: many(courseEnrollments),
    payments: many(coursePayments),
    writingSubmissionsAsStudent: many(writingSubmissions, { relationName: "writingSubmissionStudent" }),
    writingSubmissionsAsTeacher: many(writingSubmissions, { relationName: "writingSubmissionTeacher" }),
    speakingSubmissionsAsStudent: many(speakingSubmissions, { relationName: "speakingSubmissionStudent" }),
    speakingSubmissionsAsTeacher: many(speakingSubmissions, { relationName: "speakingSubmissionTeacher" }),
    testAttempts: many(testAttempts),
    userVocabulary: many(userVocabulary),
    userAchievements: many(userAchievements),
    chatSessions: many(chatSessions),
    challengeProgress: many(challengeProgress),
    lessonProgress: many(lessonProgress),
}));

// User progress relations
export const userProgressRelations = relations(userProgress, ({ one }) => ({
    user: one(users, {
        fields: [userProgress.userId],
        references: [users.userId],
    }),
    activeCourse: one(courses, {
        fields: [userProgress.activeCourseId],
        references: [courses.id],
    }),
}));

// Courses relations
export const coursesRelations = relations(courses, ({ many }) => ({
    units: many(units),
    enrollments: many(courseEnrollments),
    payments: many(coursePayments),
    teacherAssignments: many(teacherAssignments),
    vocabularyTopics: many(vocabularyTopics),
    leaderboards: many(leaderboards),
}));

// Units relations
export const unitsRelations = relations(units, ({ one, many }) => ({
    course: one(courses, {
        fields: [units.courseId],
        references: [courses.id],
    }),
    lessons: many(lessons),
}));

// Lessons relations
export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    unit: one(units, {
        fields: [lessons.unitId],
        references: [units.id],
    }),
    challenges: many(challenges),
    lessonProgress: many(lessonProgress),
}));

// Challenges relations
export const challengesRelations = relations(challenges, ({ one, many }) => ({
    lesson: one(lessons, {
        fields: [challenges.lessonId],
        references: [lessons.id],
    }),
    questions: many(questions),
    challengeOptions: many(challengeOptions),
    challengeMetadata: one(challengeMetadata),
    challengeProgress: many(challengeProgress),
    writingSubmissions: many(writingSubmissions),
    speakingSubmissions: many(speakingSubmissions),
}));

// Questions relations
export const questionsRelations = relations(questions, ({ one, many }) => ({
    challenge: one(challenges, {
        fields: [questions.challengeId],
        references: [challenges.id],
    }),
    options: many(challengeOptions),
}));

// Challenge options relations
export const challengeOptionsRelations = relations(challengeOptions, ({ one }) => ({
    challenge: one(challenges, {
        fields: [challengeOptions.challengeId],
        references: [challenges.id],
    }),
    question: one(questions, {
        fields: [challengeOptions.questionId],
        references: [questions.id],
    }),
}));

// Challenge metadata relations
export const challengeMetadataRelations = relations(challengeMetadata, ({ one }) => ({
    challenge: one(challenges, {
        fields: [challengeMetadata.challengeId],
        references: [challenges.id],
    }),
}));

// Challenge progress relations
export const challengeProgressRelations = relations(challengeProgress, ({ one }) => ({
    user: one(users, {
        fields: [challengeProgress.userId],
        references: [users.userId],
    }),
    challenge: one(challenges, {
        fields: [challengeProgress.challengeId],
        references: [challenges.id],
    }),
}));

// Writing submissions relations
export const writingSubmissionsRelations = relations(writingSubmissions, ({ one, many }) => ({
    user: one(users, {
        fields: [writingSubmissions.userId],
        references: [users.userId],
        relationName: "writingSubmissionStudent",
    }),
    challenge: one(challenges, {
        fields: [writingSubmissions.challengeId],
        references: [challenges.id],
    }),
    teacher: one(users, {
        fields: [writingSubmissions.teacherId],
        references: [users.userId],
        relationName: "writingSubmissionTeacher",
    }),
    feedback: many(writingFeedback),
}));

// Writing feedback relations
export const writingFeedbackRelations = relations(writingFeedback, ({ one }) => ({
    submission: one(writingSubmissions, {
        fields: [writingFeedback.submissionId],
        references: [writingSubmissions.id],
    }),
    createdByUser: one(users, {
        fields: [writingFeedback.createdBy],
        references: [users.userId],
    }),
}));

// Speaking submissions relations
export const speakingSubmissionsRelations = relations(speakingSubmissions, ({ one, many }) => ({
    user: one(users, {
        fields: [speakingSubmissions.userId],
        references: [users.userId],
        relationName: "speakingSubmissionStudent",
    }),
    challenge: one(challenges, {
        fields: [speakingSubmissions.challengeId],
        references: [challenges.id],
    }),
    teacher: one(users, {
        fields: [speakingSubmissions.teacherId],
        references: [users.userId],
        relationName: "speakingSubmissionTeacher",
    }),
    feedback: many(speakingFeedback),
}));

// Speaking feedback relations
export const speakingFeedbackRelations = relations(speakingFeedback, ({ one }) => ({
    submission: one(speakingSubmissions, {
        fields: [speakingFeedback.submissionId],
        references: [speakingSubmissions.id],
    }),
    createdByUser: one(users, {
        fields: [speakingFeedback.createdBy],
        references: [users.userId],
    }),
}));

// Tests relations
export const testsRelations = relations(tests, ({ one, many }) => ({
    createdByUser: one(users, {
        fields: [tests.createdBy],
        references: [users.userId],
    }),
    sections: many(testSections),
    attempts: many(testAttempts),
}));

// Test sections relations
export const testSectionsRelations = relations(testSections, ({ one, many }) => ({
    test: one(tests, {
        fields: [testSections.testId],
        references: [tests.id],
    }),
    questions: many(testQuestions),
}));

// Test questions relations
export const testQuestionsRelations = relations(testQuestions, ({ one, many }) => ({
    section: one(testSections, {
        fields: [testQuestions.sectionId],
        references: [testSections.id],
    }),
    options: many(testQuestionOptions),
    answers: many(testAnswers),
}));

// Test question options relations
export const testQuestionOptionsRelations = relations(testQuestionOptions, ({ one }) => ({
    question: one(testQuestions, {
        fields: [testQuestionOptions.questionId],
        references: [testQuestions.id],
    }),
}));

// Test attempts relations
export const testAttemptsRelations = relations(testAttempts, ({ one, many }) => ({
    user: one(users, {
        fields: [testAttempts.userId],
        references: [users.userId],
    }),
    test: one(tests, {
        fields: [testAttempts.testId],
        references: [tests.id],
    }),
    answers: many(testAnswers),
    submissions: many(testSubmissions),
}));

// Test answers relations
export const testAnswersRelations = relations(testAnswers, ({ one }) => ({
    attempt: one(testAttempts, {
        fields: [testAnswers.attemptId],
        references: [testAttempts.id],
    }),
    question: one(testQuestions, {
        fields: [testAnswers.questionId],
        references: [testQuestions.id],
    }),
    selectedOption: one(testQuestionOptions, {
        fields: [testAnswers.selectedOptionId],
        references: [testQuestionOptions.id],
    }),
}));

// Test submissions relations
export const testSubmissionsRelations = relations(testSubmissions, ({ one }) => ({
    attempt: one(testAttempts, {
        fields: [testSubmissions.attemptId],
        references: [testAttempts.id],
    }),
    user: one(users, {
        fields: [testSubmissions.userId],
        references: [users.userId],
    }),
    test: one(tests, {
        fields: [testSubmissions.testId],
        references: [tests.id],
    }),
    question: one(testQuestions, {
        fields: [testSubmissions.questionId],
        references: [testQuestions.id],
    }),
    grader: one(users, {
        fields: [testSubmissions.gradedBy],
        references: [users.userId],
    }),
}));

// Vocabulary topics relations
export const vocabularyTopicsRelations = relations(vocabularyTopics, ({ one, many }) => ({
    course: one(courses, {
        fields: [vocabularyTopics.courseId],
        references: [courses.id],
    }),
    createdByUser: one(users, {
        fields: [vocabularyTopics.createdBy],
        references: [users.userId],
    }),
    words: many(vocabularyWords),
}));

// Vocabulary words relations
export const vocabularyWordsRelations = relations(vocabularyWords, ({ one, many }) => ({
    topic: one(vocabularyTopics, {
        fields: [vocabularyWords.topicId],
        references: [vocabularyTopics.id],
    }),
    userVocabulary: many(userVocabulary),
}));

// User vocabulary relations
export const userVocabularyRelations = relations(userVocabulary, ({ one }) => ({
    user: one(users, {
        fields: [userVocabulary.userId],
        references: [users.userId],
    }),
    word: one(vocabularyWords, {
        fields: [userVocabulary.wordId],
        references: [vocabularyWords.id],
    }),
}));

// Course enrollments relations
export const courseEnrollmentsRelations = relations(courseEnrollments, ({ one }) => ({
    user: one(users, {
        fields: [courseEnrollments.userId],
        references: [users.userId],
    }),
    course: one(courses, {
        fields: [courseEnrollments.courseId],
        references: [courses.id],
    }),
}));

// Lesson progress relations
export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
    user: one(users, {
        fields: [lessonProgress.userId],
        references: [users.userId],
    }),
    lesson: one(lessons, {
        fields: [lessonProgress.lessonId],
        references: [lessons.id],
    }),
}));

// Course payments relations
export const coursePaymentsRelations = relations(coursePayments, ({ one }) => ({
    user: one(users, {
        fields: [coursePayments.userId],
        references: [users.userId],
    }),
    course: one(courses, {
        fields: [coursePayments.courseId],
        references: [courses.id],
    }),
}));

// Teacher assignments relations
export const teacherAssignmentsRelations = relations(teacherAssignments, ({ one }) => ({
    teacher: one(users, {
        fields: [teacherAssignments.teacherId],
        references: [users.userId],
    }),
    course: one(courses, {
        fields: [teacherAssignments.courseId],
        references: [courses.id],
    }),
}));

// Student-teacher relations
export const studentTeacherRelationsRelations = relations(studentTeacherRelations, ({ one }) => ({
    student: one(users, {
        fields: [studentTeacherRelations.studentId],
        references: [users.userId],
    }),
    teacher: one(users, {
        fields: [studentTeacherRelations.teacherId],
        references: [users.userId],
    }),
    course: one(courses, {
        fields: [studentTeacherRelations.courseId],
        references: [courses.id],
    }),
}));

// Achievements relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
    userAchievements: many(userAchievements),
}));

// User achievements relations
export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
    user: one(users, {
        fields: [userAchievements.userId],
        references: [users.userId],
    }),
    achievement: one(achievements, {
        fields: [userAchievements.achievementId],
        references: [achievements.id],
    }),
}));

// Leaderboards relations
export const leaderboardsRelations = relations(leaderboards, ({ one, many }) => ({
    course: one(courses, {
        fields: [leaderboards.courseId],
        references: [courses.id],
    }),
    entries: many(leaderboardEntries),
}));

// Leaderboard entries relations
export const leaderboardEntriesRelations = relations(leaderboardEntries, ({ one }) => ({
    leaderboard: one(leaderboards, {
        fields: [leaderboardEntries.leaderboardId],
        references: [leaderboards.id],
    }),
    user: one(users, {
        fields: [leaderboardEntries.userId],
        references: [users.userId],
    }),
}));

// Chat sessions relations
export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
    user: one(users, {
        fields: [chatSessions.userId],
        references: [users.userId],
    }),
    messages: many(chatMessages),
}));

// Chat messages relations
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
    session: one(chatSessions, {
        fields: [chatMessages.sessionId],
        references: [chatSessions.id],
    }),
}));

// ============================================================================
// 11. FLASHCARD SYSTEM
// ============================================================================

// 11.1 Flashcard Categories - Organize flashcards by topic/theme
export const flashcardCategories = pgTable("flashcard_categories", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    createdBy: text("created_by").notNull(), // Teacher/Admin who created this category
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// 11.2 Flashcards - Vocabulary flashcards
export const flashcards = pgTable("flashcards", {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id").references(() => flashcardCategories.id, { onDelete: "cascade" }).notNull(),
    word: text("word").notNull(), // The vocabulary word
    definition: text("definition").notNull(), // Definition of the word
    pronunciation: text("pronunciation"), // Phonetic pronunciation (e.g., /həˈloʊ/)
    example: text("example"), // Example sentence
    synonyms: text("synonyms"), // Comma-separated synonyms
    antonyms: text("antonyms"), // Comma-separated antonyms
    partOfSpeech: text("part_of_speech"), // noun, verb, adjective, etc.
    audioUrl: text("audio_url"), // URL to pronunciation audio (from API or uploaded)
    imageUrl: text("image_url"), // Optional image to help remember the word
    difficulty: text("difficulty"), // EASY, MEDIUM, HARD
    source: text("source").notNull().default("MANUAL"), // MANUAL or API (from Free Dictionary API)
    createdBy: text("created_by").notNull(), // Teacher/Admin who created this flashcard
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// 11.3 Flashcard Progress - Track student learning progress
export const flashcardProgress = pgTable("flashcard_progress", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(), // Student's Clerk userId
    flashcardId: integer("flashcard_id").references(() => flashcards.id, { onDelete: "cascade" }).notNull(),
    status: text("status").notNull().default("NEW"), // NEW, LEARNING, MASTERED
    correctCount: integer("correct_count").notNull().default(0), // Number of times answered correctly
    incorrectCount: integer("incorrect_count").notNull().default(0), // Number of times answered incorrectly
    lastReviewedAt: timestamp("last_reviewed_at"), // Last time this flashcard was reviewed
    nextReviewAt: timestamp("next_review_at"), // When to review next (spaced repetition)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Flashcard Categories Relations
export const flashcardCategoriesRelations = relations(flashcardCategories, ({ many }) => ({
    flashcards: many(flashcards),
}));

// Flashcards Relations
export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
    category: one(flashcardCategories, {
        fields: [flashcards.categoryId],
        references: [flashcardCategories.id],
    }),
    progress: many(flashcardProgress),
}));

// Flashcard Progress Relations
export const flashcardProgressRelations = relations(flashcardProgress, ({ one }) => ({
    flashcard: one(flashcards, {
        fields: [flashcardProgress.flashcardId],
        references: [flashcards.id],
    }),
    user: one(users, {
        fields: [flashcardProgress.userId],
        references: [users.userId],
    }),
}));
