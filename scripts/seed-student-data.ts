/**
 * Seed Student Data for Testing
 * Adds more students, enrollments, and lesson progress
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

const sql = neon(process.env.DATABASE_URL!);

async function seedStudentData() {
  console.log("🌱 Seeding student data...");

  try {
    // Check if courses exist
    console.log("🔍 Checking for existing courses...");
    const courses = await sql`SELECT id, title FROM courses ORDER BY id LIMIT 5`;

    if (courses.length === 0) {
      console.log("❌ No courses found in database!");
      console.log("Please run the main seed script first:");
      console.log("  npx tsx scripts/seed-new.ts");
      return;
    }

    console.log(`✅ Found ${courses.length} courses:`);
    courses.forEach((c: any) => console.log(`  - Course ${c.id}: ${c.title}`));

    const courseIds = courses.map((c: any) => c.id);
    const course1 = courseIds[0];
    const course2 = courseIds[1] || courseIds[0]; // Use first course if only one exists

    // Add more students
    console.log("\n👥 Adding students...");
    await sql`
      INSERT INTO users (user_id, email, user_name, first_name, last_name, role, status, user_image_src)
      VALUES
        ('student_002', 'bob@student.com', 'Bob Wilson', 'Bob', 'Wilson', 'STUDENT', 'active', '/mascot.svg'),
        ('student_003', 'carol@student.com', 'Carol Davis', 'Carol', 'Davis', 'STUDENT', 'active', '/mascot.svg'),
        ('student_004', 'david@student.com', 'David Brown', 'David', 'Brown', 'STUDENT', 'active', '/mascot.svg'),
        ('student_005', 'emma@student.com', 'Emma Taylor', 'Emma', 'Taylor', 'STUDENT', 'active', '/mascot.svg')
      ON CONFLICT (user_id) DO NOTHING
    `;

    // Add enrollments for these students
    console.log("📋 Adding enrollments...");
    await sql`
      INSERT INTO course_enrollments (user_id, course_id, enrollment_type, status, progress, enrolled_at)
      VALUES
        ('student_001', ${course1}, 'FREE', 'ACTIVE', 45, NOW() - INTERVAL '30 days'),
        ('student_002', ${course1}, 'FREE', 'ACTIVE', 60, NOW() - INTERVAL '25 days'),
        ('student_003', ${course1}, 'FREE', 'ACTIVE', 30, NOW() - INTERVAL '20 days'),
        ('student_004', ${course2}, 'PAID', 'ACTIVE', 75, NOW() - INTERVAL '15 days'),
        ('student_005', ${course2}, 'PAID', 'ACTIVE', 20, NOW() - INTERVAL '10 days')
      ON CONFLICT DO NOTHING
    `;

    // Get lesson IDs for course 1 and 2
    const lessonsC1 = await sql`
      SELECT l.id
      FROM lessons l
      INNER JOIN units u ON l.unit_id = u.id
      WHERE u.course_id = ${course1}
      ORDER BY u.order, l.order
      LIMIT 5
    `;

    const lessonsC2 = await sql`
      SELECT l.id
      FROM lessons l
      INNER JOIN units u ON l.unit_id = u.id
      WHERE u.course_id = ${course2}
      ORDER BY u.order, l.order
      LIMIT 5
    `;

    // Add lesson progress for student_001 (45% progress in course 1)
    if (lessonsC1.length >= 2) {
      console.log("📚 Adding lesson progress for student_001...");
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, started_at)
        VALUES
          ('student_001', ${lessonsC1[0].id}, true, NOW() - INTERVAL '28 days', NOW() - INTERVAL '29 days'),
          ('student_001', ${lessonsC1[1].id}, true, NOW() - INTERVAL '25 days', NOW() - INTERVAL '26 days')
        ON CONFLICT DO NOTHING
      `;
    } else if (lessonsC1.length === 1) {
      console.log("📚 Adding lesson progress for student_001 (limited)...");
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, started_at)
        VALUES
          ('student_001', ${lessonsC1[0].id}, true, NOW() - INTERVAL '28 days', NOW() - INTERVAL '29 days')
        ON CONFLICT DO NOTHING
      `;
    }

    // Add lesson progress for student_002 (60% progress in course 1)
    if (lessonsC1.length >= 3) {
      console.log("📚 Adding lesson progress for student_002...");
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, started_at)
        VALUES
          ('student_002', ${lessonsC1[0].id}, true, NOW() - INTERVAL '23 days', NOW() - INTERVAL '24 days'),
          ('student_002', ${lessonsC1[1].id}, true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '21 days'),
          ('student_002', ${lessonsC1[2].id}, true, NOW() - INTERVAL '18 days', NOW() - INTERVAL '19 days')
        ON CONFLICT DO NOTHING
      `;
    } else if (lessonsC1.length > 0) {
      console.log("📚 Adding lesson progress for student_002 (limited)...");
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, started_at)
        VALUES
          ('student_002', ${lessonsC1[0].id}, true, NOW() - INTERVAL '23 days', NOW() - INTERVAL '24 days')
        ON CONFLICT DO NOTHING
      `;
    }

    // Add lesson progress for student_003 (30% progress in course 1)
    if (lessonsC1.length > 0) {
      console.log("📚 Adding lesson progress for student_003...");
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, started_at)
        VALUES
          ('student_003', ${lessonsC1[0].id}, true, NOW() - INTERVAL '18 days', NOW() - INTERVAL '19 days')
        ON CONFLICT DO NOTHING
      `;
    }

    // Add lesson progress for student_004 (75% progress in course 2)
    if (lessonsC2.length >= 4) {
      console.log("📚 Adding lesson progress for student_004...");
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, started_at)
        VALUES
          ('student_004', ${lessonsC2[0].id}, true, NOW() - INTERVAL '13 days', NOW() - INTERVAL '14 days'),
          ('student_004', ${lessonsC2[1].id}, true, NOW() - INTERVAL '11 days', NOW() - INTERVAL '12 days'),
          ('student_004', ${lessonsC2[2].id}, true, NOW() - INTERVAL '9 days', NOW() - INTERVAL '10 days'),
          ('student_004', ${lessonsC2[3].id}, true, NOW() - INTERVAL '7 days', NOW() - INTERVAL '8 days')
        ON CONFLICT DO NOTHING
      `;
    } else if (lessonsC2.length > 0) {
      console.log("📚 Adding lesson progress for student_004 (limited)...");
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, started_at)
        VALUES
          ('student_004', ${lessonsC2[0].id}, true, NOW() - INTERVAL '13 days', NOW() - INTERVAL '14 days')
        ON CONFLICT DO NOTHING
      `;
    }

    // Add lesson progress for student_005 (20% progress in course 2)
    if (lessonsC2.length > 0) {
      console.log("📚 Adding lesson progress for student_005...");
      await sql`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, started_at)
        VALUES
          ('student_005', ${lessonsC2[0].id}, true, NOW() - INTERVAL '8 days', NOW() - INTERVAL '9 days')
        ON CONFLICT DO NOTHING
      `;
    }

    console.log("✅ Student data seeded successfully!");
    console.log("\n📊 Summary:");
    console.log("- Added 5 students (student_001 to student_005)");
    console.log("- Added 5 enrollments");
    console.log("- Added lesson progress for all students");
    console.log("\n🔑 Test accounts:");
    console.log(`- student_001: student@ielts.com (Course ${course1}, 45% progress)`);
    console.log(`- student_002: bob@student.com (Course ${course1}, 60% progress)`);
    console.log(`- student_003: carol@student.com (Course ${course1}, 30% progress)`);
    console.log(`- student_004: david@student.com (Course ${course2}, 75% progress)`);
    console.log(`- student_005: emma@student.com (Course ${course2}, 20% progress)`);
  } catch (error) {
    console.error("❌ Error seeding student data:", error);
    throw error;
  }
}

seedStudentData();

