/**
 * Simulate Webhook Script
 * 
 * This script simulates a Stripe webhook event to test the webhook handler
 * Useful for testing without setting up ngrok
 */

import "dotenv/config";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY not found");
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil",
});

async function simulateWebhook() {
    console.log("🧪 Simulating Webhook Event...\n");

    try {
        // Create a test checkout session
        console.log("📝 Creating test checkout session...");
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "vnd",
                        product_data: {
                            name: "Test Course",
                            description: "Test course for webhook simulation",
                        },
                        unit_amount: 2000000,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: "test_user_123",
                courseId: "15",
            },
            success_url: "http://localhost:3001/success",
            cancel_url: "http://localhost:3001/cancel",
        });

        console.log("✅ Session created:", session.id);
        console.log("   Metadata:", session.metadata);
        console.log("   Amount:", session.amount_total, session.currency);
        console.log("   Payment Intent:", session.payment_intent);

        // Simulate webhook event
        console.log("\n🔔 Simulating webhook event...");
        console.log("Event type: checkout.session.completed");
        console.log("Session ID:", session.id);

        // In production, Stripe would send this webhook
        // For testing, you need to:
        // 1. Set up ngrok
        // 2. Configure webhook in Stripe Dashboard
        // 3. Complete a real payment

        console.log("\n📋 To test webhook:");
        console.log("1. Set up ngrok: ngrok http 3001");
        console.log("2. Go to Stripe Dashboard > Webhooks");
        console.log("3. Add endpoint with ngrok URL");
        console.log("4. Go to http://localhost:3001/courses-public");
        console.log("5. Click enroll on paid course");
        console.log("6. Complete payment with test card");
        console.log("7. Check server logs for webhook events");

        console.log("\n💳 Test Card Details:");
        console.log("Number: 4242 4242 4242 4242");
        console.log("Expiry: 12/25");
        console.log("CVC: 123");

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

simulateWebhook();

