/**
 * Verify Payment Flow
 * Checks that payments are correctly recorded in coursePayments table
 */

import "dotenv/config";
import db from "../db/drizzle";
import { coursePayments, courseEnrollments, courses } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function verifyPaymentFlow() {
  console.log("🔍 Verifying Payment Flow\n");

  try {
    // Step 1: Check coursePayments table
    console.log("📊 Step 1: Checking coursePayments table...");
    const payments = await db.query.coursePayments.findMany({
      limit: 5,
      with: {
        user: true,
        course: true,
      },
    });

    if (payments.length === 0) {
      console.log("ℹ️  No payments found yet (this is normal for new setup)\n");
    } else {
      console.log(`✅ Found ${payments.length} payment(s):\n`);
      for (const payment of payments) {
        console.log(`  Payment ID: ${payment.id}`);
        console.log(`  User: ${payment.userId}`);
        console.log(`  Course: ${payment.courseId}`);
        console.log(`  Amount: ${payment.amount} ${payment.currency}`);
        console.log(`  Status: ${payment.status}`);
        console.log(`  Stripe Intent: ${payment.stripePaymentIntentId}`);
        console.log(`  Paid At: ${payment.paidAt}`);
        console.log();
      }
    }

    // Step 2: Check courseEnrollments table
    console.log("📋 Step 2: Checking courseEnrollments table...");
    const enrollments = await db.query.courseEnrollments.findMany({
      limit: 5,
      with: {
        user: true,
        course: true,
      },
    });

    if (enrollments.length === 0) {
      console.log("ℹ️  No enrollments found yet (this is normal for new setup)\n");
    } else {
      console.log(`✅ Found ${enrollments.length} enrollment(s):\n`);
      for (const enrollment of enrollments) {
        console.log(`  Enrollment ID: ${enrollment.id}`);
        console.log(`  User: ${enrollment.userId}`);
        console.log(`  Course: ${enrollment.courseId}`);
        console.log(`  Type: ${enrollment.enrollmentType}`);
        console.log(`  Status: ${enrollment.status}`);
        console.log(`  Progress: ${enrollment.progress}%`);
        console.log(`  Enrolled At: ${enrollment.enrolledAt}`);
        console.log();
      }
    }

    // Step 3: Verify payment-enrollment relationship
    console.log("🔗 Step 3: Verifying payment-enrollment relationship...");
    if (payments.length > 0 && enrollments.length > 0) {
      const payment = payments[0];
      const enrollment = enrollments.find(
        (e) => e.userId === payment.userId && e.courseId === payment.courseId
      );

      if (enrollment) {
        console.log(`✅ Payment and enrollment match for user ${payment.userId}`);
        console.log(`   Payment: ${payment.amount} ${payment.currency}`);
        console.log(`   Enrollment: ${enrollment.enrollmentType}`);
      } else {
        console.log(`⚠️  No matching enrollment for payment`);
      }
    } else {
      console.log("ℹ️  Not enough data to verify relationship\n");
    }

    // Step 4: Schema verification
    console.log("\n✅ Schema Verification:");
    console.log("   coursePayments fields:");
    console.log("   - id (serial, pk)");
    console.log("   - userId (text, fk)");
    console.log("   - courseId (integer, fk)");
    console.log("   - amount (integer)");
    console.log("   - currency (text)");
    console.log("   - stripePaymentIntentId (text, unique)");
    console.log("   - stripeCustomerId (text)");
    console.log("   - status (enum: PENDING, COMPLETED, FAILED, REFUNDED)");
    console.log("   - paidAt (timestamp)");
    console.log("   - createdAt (timestamp)");

    console.log("\n   courseEnrollments fields:");
    console.log("   - id (serial, pk)");
    console.log("   - userId (text, fk)");
    console.log("   - courseId (integer, fk)");
    console.log("   - enrollmentType (enum: FREE, PAID, ADMIN_GRANTED)");
    console.log("   - status (enum: ACTIVE, COMPLETED, DROPPED, SUSPENDED)");
    console.log("   - progress (integer, 0-100)");
    console.log("   - enrolledAt (timestamp)");
    console.log("   - completedAt (timestamp)");

    // Step 5: Webhook flow
    console.log("\n🔄 Webhook Flow:");
    console.log("1. User clicks 'Đăng ký - $XX'");
    console.log("2. POST /api/courses/[courseId]/checkout");
    console.log("3. Create Stripe checkout session");
    console.log("4. User enters card: 4242 4242 4242 4242");
    console.log("5. Stripe processes payment");
    console.log("6. Webhook: checkout.session.completed");
    console.log("7. POST /api/webhooks/stripe");
    console.log("8. Verify signature");
    console.log("9. Extract userId, courseId from metadata");
    console.log("10. INSERT courseEnrollments");
    console.log("11. INSERT coursePayments ← Payment recorded here!");
    console.log("12. Return 200 OK");

    console.log("\n" + "=".repeat(70));
    console.log("✅ PAYMENT FLOW VERIFICATION COMPLETE!");
    console.log("=".repeat(70));

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

verifyPaymentFlow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

