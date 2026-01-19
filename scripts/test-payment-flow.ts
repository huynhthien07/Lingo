/**
 * Test Payment Flow
 * Tests the complete payment flow: checkout -> webhook -> enrollment
 */

import "dotenv/config";
import db from "@/db/drizzle";
import { courses, coursePayments, courseEnrollments } from "@/db/schema";
import { eq } from "drizzle-orm";

const TEST_USER_ID = "test-user-123";
const TEST_COURSE_ID = 15; // IELTS Advanced - Band 6.0 - 7.0 (Paid)

async function testPaymentFlow() {
  console.log("🧪 Testing Payment Flow...\n");

  try {
    // 1. Check if course exists
    console.log("1️⃣ Checking course...");
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, TEST_COURSE_ID),
    });

    if (!course) {
      console.error("❌ Course not found");
      return;
    }

    console.log(`✅ Course found: ${course.title}`);
    console.log(`   Price: ${course.price} ${course.currency}`);
    console.log(`   Is Free: ${course.isFree}\n`);

    // 2. Check if already enrolled
    console.log("2️⃣ Checking enrollment...");
    const existingEnrollment = await db.query.courseEnrollments.findFirst({
      where: (enrollments, { and, eq }) =>
        and(
          eq(enrollments.userId, TEST_USER_ID),
          eq(enrollments.courseId, TEST_COURSE_ID)
        ),
    });

    if (existingEnrollment) {
      console.log(`✅ Already enrolled: ${existingEnrollment.status}`);
    } else {
      console.log("❌ Not enrolled yet\n");
    }

    // 3. Check payment records
    console.log("3️⃣ Checking payment records...");
    const payments = await db.query.coursePayments.findMany({
      where: (payments, { and, eq }) =>
        and(
          eq(payments.userId, TEST_USER_ID),
          eq(payments.courseId, TEST_COURSE_ID)
        ),
    });

    if (payments.length > 0) {
      console.log(`✅ Found ${payments.length} payment(s):`);
      payments.forEach((p) => {
        console.log(`   - Amount: ${p.amount} ${p.currency}`);
        console.log(`   - Status: ${p.status}`);
        console.log(`   - Paid At: ${p.paidAt}`);
      });
    } else {
      console.log("❌ No payment records found\n");
    }

    // 4. Summary
    console.log("\n📊 Summary:");
    console.log(`   Course: ${course.title}`);
    console.log(`   Price: ${course.price} ${course.currency}`);
    console.log(`   Enrolled: ${existingEnrollment ? "Yes" : "No"}`);
    console.log(`   Payments: ${payments.length}`);

    if (existingEnrollment && payments.length > 0) {
      console.log("\n✅ Payment flow is working!");
    } else {
      console.log("\n⚠️ Payment flow incomplete - check webhook");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testPaymentFlow();

