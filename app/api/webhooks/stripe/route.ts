import db from "@/db/drizzle";
import { courseEnrollments, coursePayments } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";


export async function POST (req:Request){
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    console.log("🔔 Webhook received");
    console.log("Signature:", signature ? "✅ Present" : "❌ Missing");

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
        console.log("✅ Webhook signature verified");
        console.log("Event type:", event.type);
    } catch (error: any) {
        console.error("❌ Webhook error:", error.message);
        return new NextResponse(`Webhook error: ${error.message}`,{
            status:400,
        });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    console.log("Session data:", {
        id: session.id,
        metadata: session.metadata,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_intent: session.payment_intent,
    });

    if (event.type === "checkout.session.completed"){
        console.log("🎯 Processing checkout.session.completed event");

        if (!session?.metadata?.userId){
            console.error("❌ User ID is missing in metadata");
            return new NextResponse("User ID is required", {status: 400});
        }

        // Handle course payment
        if (session.metadata.courseId) {
            const courseId = parseInt(session.metadata.courseId);
            const userId = session.metadata.userId;

            console.log(`📝 Creating enrollment for user ${userId}, course ${courseId}`);

            try {
                // Create enrollment
                const enrollmentResult = await db.insert(courseEnrollments).values({
                    userId,
                    courseId,
                    enrollmentType: "PAID",
                    status: "ACTIVE",
                    progress: 0,
                });
                console.log("✅ Enrollment created:", enrollmentResult);

                // Record payment
                const paymentResult = await db.insert(coursePayments).values({
                    userId,
                    courseId,
                    amount: session.amount_total || 0, // Already in cents
                    currency: (session.currency || "usd").toUpperCase(),
                    status: "COMPLETED",
                    stripePaymentIntentId: session.payment_intent as string,
                    paidAt: new Date(),
                });
                console.log("✅ Payment recorded:", paymentResult);

                console.log(`✅ Course enrollment created for user ${userId}, course ${courseId}`);
            } catch (dbError: any) {
                console.error("❌ Database error:", dbError.message);
                console.error("Error details:", dbError);
                return new NextResponse(`Database error: ${dbError.message}`, {status: 500});
            }
        } else {
            console.log(`⚠️ Checkout session completed without courseId metadata`);
        }
    } else {
        console.log(`⏭️ Ignoring event type: ${event.type}`);
    }

    // Note: Subscription renewal logic removed as we now use one-time course payments
    // If you need to handle recurring subscriptions in the future, implement here

    return new NextResponse(null, {status: 200});
}