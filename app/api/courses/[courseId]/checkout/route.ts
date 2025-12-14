/**
 * Course Checkout API
 * POST /api/courses/[courseId]/checkout - Create Stripe checkout session for course purchase
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { courses, courseEnrollments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/services/stripe.service";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const courseIdNum = parseInt(courseId);

    // Get course
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseIdNum),
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await db.query.courseEnrollments.findFirst({
      where: and(
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.courseId, courseIdNum)
      ),
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Check if course is free
    if (course.isFree || course.price === 0) {
      // Enroll directly for free courses
      await db.insert(courseEnrollments).values({
        userId,
        courseId: courseIdNum,
        enrollmentType: "FREE",
        status: "ACTIVE",
        progress: 0,
      });

      return NextResponse.json({
        success: true,
        message: "Enrolled successfully",
        isFree: true,
      });
    }

    // Create Stripe checkout session for paid courses
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/courses-public`;

    const session = await createCheckoutSession(
      userId,
      courseIdNum,
      course.title,
      course.price * 100, // Convert to cents
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
};

