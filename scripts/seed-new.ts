import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore
const db = drizzle(sql, { schema });

const main = async () => {
    try {
        console.log("🌱 Seeding IELTS Learning Platform database...");

        // ============================================================================
        // 1. SEED USERS (Admin, Teacher, Student)
        // ============================================================================
        console.log("👥 Creating users...");
        
        await db.insert(schema.users).values([
            {
                userId: "admin_001",
                email: "admin@ielts.com",
                userName: "Admin User",
                userImageSrc: "/avatars/admin.svg",
                role: "ADMIN",
                status: "active",
                firstName: "Admin",
                lastName: "System",
                language: "en",
            },
            {
                userId: "teacher_001",
                email: "teacher@ielts.com",
                userName: "Teacher John",
                userImageSrc: "/avatars/teacher.svg",
                role: "TEACHER",
                status: "active",
                firstName: "John",
                lastName: "Smith",
                language: "en",
            },
            {
                userId: "student_001",
                email: "student@ielts.com",
                userName: "Student Alice",
                userImageSrc: "/avatars/student.svg",
                role: "STUDENT",
                status: "active",
                firstName: "Alice",
                lastName: "Johnson",
                language: "en",
            },
        ]);

        // User progress for student
        await db.insert(schema.userProgress).values([
            {
                userId: "student_001",
                points: 150,
                level: 1,
                overallBandScore: 5.5,
                listeningScore: 6.0,
                readingScore: 5.5,
                writingScore: 5.0,
                speakingScore: 5.5,
            },
        ]);

        console.log("✅ Users created");

        // ============================================================================
        // 2. SEED COURSES
        // ============================================================================
        console.log("📚 Creating courses...");
        
        await db.insert(schema.courses).values([
            {
                id: 1,
                title: "IELTS Foundation",
                imageSrc: "/courses/ielts-foundation.svg",
                description: "Build your foundation for IELTS success",
                examType: "IELTS",
                level: "BEGINNER",
                price: 0,
                isFree: true,
            },
            {
                id: 2,
                title: "IELTS Intermediate",
                imageSrc: "/courses/ielts-intermediate.svg",
                description: "Achieve band 6.0-7.0 with comprehensive practice",
                examType: "IELTS",
                level: "INTERMEDIATE",
                price: 4900, // $49.00
                isFree: false,
            },
            {
                id: 3,
                title: "IELTS Advanced",
                imageSrc: "/courses/ielts-advanced.svg",
                description: "Master IELTS and achieve band 7.5+",
                examType: "IELTS",
                level: "ADVANCED",
                price: 7900, // $79.00
                isFree: false,
            },
        ]);

        console.log("✅ Courses created");

        // ============================================================================
        // 3. SEED UNITS & LESSONS
        // ============================================================================
        console.log("📖 Creating units and lessons...");
        
        // Unit 1 for Course 1
        await db.insert(schema.units).values([
            {
                id: 1,
                courseId: 1,
                title: "Unit 1: Getting Started",
                description: "Introduction to IELTS test format and basic skills",
                order: 1,
            },
        ]);

        // Lessons for Unit 1
        await db.insert(schema.lessons).values([
            {
                id: 1,
                unitId: 1,
                title: "Lesson 1: IELTS Listening Basics",
                description: "Learn the fundamentals of IELTS Listening",
                skillType: "LISTENING",
                order: 1,
                estimatedDuration: 30,
            },
            {
                id: 2,
                unitId: 1,
                title: "Lesson 2: IELTS Reading Basics",
                description: "Master reading comprehension strategies",
                skillType: "READING",
                order: 2,
                estimatedDuration: 45,
            },
        ]);

        console.log("✅ Units and lessons created");

        // ============================================================================
        // 4. SEED CHALLENGES (Sample exercises)
        // ============================================================================
        console.log("🎯 Creating sample challenges...");

        // Listening Multiple Choice (UC1)
        await db.insert(schema.challenges).values([
            {
                id: 1,
                lessonId: 1,
                type: "LISTENING_MULTIPLE_CHOICE",
                question: "What is the main topic of the conversation?",
                audioSrc: "/audio/sample-listening-1.mp3",
                order: 1,
                difficulty: "EASY",
                points: 10,
                explanation: "The speakers discuss their weekend plans throughout the conversation.",
            },
        ]);

        // Challenge options for listening
        await db.insert(schema.challengeOptions).values([
            { challengeId: 1, text: "Weekend plans", correct: true, order: 1 },
            { challengeId: 1, text: "Work schedule", correct: false, order: 2 },
            { challengeId: 1, text: "Holiday destinations", correct: false, order: 3 },
            { challengeId: 1, text: "Shopping list", correct: false, order: 4 },
        ]);

        // Reading True/False/Not Given (UC6)
        await db.insert(schema.challenges).values([
            {
                id: 2,
                lessonId: 2,
                type: "READING_TRUE_FALSE_NOT_GIVEN",
                question: "The author believes technology has improved education.",
                passage: "Technology has transformed many aspects of modern life. In education, digital tools have made learning more accessible...",
                order: 1,
                difficulty: "MEDIUM",
                points: 10,
                explanation: "The passage states that technology has made learning more accessible, supporting the statement.",
            },
        ]);

        await db.insert(schema.challengeOptions).values([
            { challengeId: 2, text: "True", correct: true, order: 1 },
            { challengeId: 2, text: "False", correct: false, order: 2 },
            { challengeId: 2, text: "Not Given", correct: false, order: 3 },
        ]);

        console.log("✅ Challenges created");

        // ============================================================================
        // 5. SEED VOCABULARY
        // ============================================================================
        console.log("📝 Creating vocabulary topics and words...");

        await db.insert(schema.vocabularyTopics).values([
            {
                id: 1,
                title: "Academic Vocabulary",
                description: "Essential words for IELTS Academic",
                imageSrc: "/vocab/academic.svg",
                courseId: 1,
                createdBy: "teacher_001",
            },
        ]);

        await db.insert(schema.vocabularyWords).values([
            {
                id: 1,
                topicId: 1,
                word: "analyze",
                pronunciation: "/ˈænəlaɪz/",
                meaning: "examine in detail",
                example: "Students must analyze the data carefully.",
            },
            {
                id: 2,
                topicId: 1,
                word: "evaluate",
                pronunciation: "/ɪˈvæljueɪt/",
                meaning: "assess the value or quality of something",
                example: "Teachers evaluate student performance regularly.",
            },
        ]);

        console.log("✅ Vocabulary created");

        // ============================================================================
        // 6. SEED ACHIEVEMENTS (BR66)
        // ============================================================================
        console.log("🏆 Creating achievements...");

        await db.insert(schema.achievements).values([
            {
                id: 1,
                title: "Học viên",
                description: "Đạt 1,000 điểm",
                imageSrc: "/badges/student.svg",
                type: "POINTS",
                requirement: 1000,
                points: 100,
            },
            {
                id: 2,
                title: "Học viên chăm chỉ",
                description: "Đạt 10,000 điểm",
                imageSrc: "/badges/diligent.svg",
                type: "POINTS",
                requirement: 10000,
                points: 500,
            },
            {
                id: 3,
                title: "Học bá",
                description: "Đạt 100,000 điểm",
                imageSrc: "/badges/master.svg",
                type: "POINTS",
                requirement: 100000,
                points: 2000,
            },
            {
                id: 4,
                title: "Học thần",
                description: "Đạt 1,000,000 điểm",
                imageSrc: "/badges/god.svg",
                type: "POINTS",
                requirement: 1000000,
                points: 10000,
            },
        ]);

        console.log("✅ Achievements created");

        // ============================================================================
        // 7. SEED ENROLLMENTS
        // ============================================================================
        console.log("📋 Creating course enrollments...");

        await db.insert(schema.courseEnrollments).values([
            {
                userId: "student_001",
                courseId: 1,
                enrollmentType: "FREE",
                status: "ACTIVE",
                progress: 25,
            },
        ]);

        console.log("✅ Enrollments created");

        // ============================================================================
        // 8. SEED TEACHER ASSIGNMENTS
        // ============================================================================
        console.log("👨‍🏫 Assigning teachers to courses...");

        await db.insert(schema.teacherAssignments).values([
            {
                teacherId: "teacher_001",
                courseId: 1,
            },
            {
                teacherId: "teacher_001",
                courseId: 2,
            },
        ]);

        console.log("✅ Teacher assignments created");

        console.log("🎉 Database seeding completed successfully!");

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }
};

main()
    .then(() => {
        console.log("✅ Seeding finished!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    });

