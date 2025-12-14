import db from "@/db/drizzle";
import { userSubscription, courseEnrollments, coursePayments } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";


export async function POST (req:Request){
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch (error: any) {
        return new NextResponse(`Webhook error: ${error.message}`,{
            status:400,
        });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed"){
        if (!session?.metadata?.userId){
            return new NextResponse("User ID is required", {status: 400});
        }

        // Check if this is a course payment or subscription
        if (session.metadata.courseId) {
            // Course payment
            const courseId = parseInt(session.metadata.courseId);
            const userId = session.metadata.userId;

            // Create enrollment
            await db.insert(courseEnrollments).values({
                userId,
                courseId,
                enrollmentType: "PAID",
                status: "ACTIVE",
                progress: 0,
            });

            // Record payment
            await db.insert(coursePayments).values({
                userId,
                courseId,
                amount: session.amount_total || 0, // Already in cents
                currency: session.currency || "usd",
                status: "COMPLETED",
                stripePaymentIntentId: session.payment_intent as string,
                paidAt: new Date(),
            });

            console.log(`✅ Course enrollment created for user ${userId}, course ${courseId}`);
        } else if (session.subscription) {
            // Subscription payment (existing logic)
            const subscription = (await stripe.subscriptions.retrieve(
                session.subscription as string
            ));

            await db.insert(userSubscription).values({
                userId: session.metadata.userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    //subscription.current_period_end * 1000,
                    'current_period_end' in subscription?
                    (subscription as any).current_period_end*1000:
                    Date.now() + 30*24*60*60*10000
                )
            });
        }
    }

    if (event.type === "invoice.payment_succeeded"){
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        await db.update(userSubscription).set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
                //subscription.current_period_end *1000,
                'current_period_end' in subscription?
                (subscription as any).current_period_end*1000:
                Date.now() + 30*24*60*60*10000
            ),
        }).where(eq(userSubscription.stripeSubscriptionId, subscription.id))
    }

    return new NextResponse(null, {status: 200});
}