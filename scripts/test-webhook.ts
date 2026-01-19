/**
 * Test Webhook Script
 *
 * This script tests if the webhook endpoint is accessible and working
 */

import "dotenv/config";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    console.error("❌ STRIPE_SECRET_KEY not found in environment variables");
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil",
});

async function testWebhook() {
    console.log("🧪 Testing Webhook Configuration...\n");

    try {
        // Get webhook endpoints
        console.log("📋 Fetching webhook endpoints...");
        const endpoints = await stripe.webhookEndpoints.list();
        
        if (endpoints.data.length === 0) {
            console.log("❌ No webhook endpoints configured!");
            console.log("\n📝 To set up webhook:");
            console.log("1. Go to https://dashboard.stripe.com/webhooks");
            console.log("2. Click 'Add endpoint'");
            console.log("3. Enter URL: https://yourdomain.com/api/webhooks/stripe");
            console.log("4. Select events: checkout.session.completed");
            console.log("5. Copy the signing secret to STRIPE_WEBHOOK_SECRET");
            return;
        }

        console.log(`✅ Found ${endpoints.data.length} webhook endpoint(s):\n`);
        
        endpoints.data.forEach((endpoint, index) => {
            console.log(`${index + 1}. ${endpoint.url}`);
            console.log(`   Status: ${endpoint.status}`);
            console.log(`   Events: ${endpoint.enabled_events.join(", ")}`);
            console.log(`   ID: ${endpoint.id}\n`);
        });

        // Check if we have the right endpoint
        const hasCheckoutEvent = endpoints.data.some(ep => 
            ep.enabled_events.includes("checkout.session.completed")
        );

        if (hasCheckoutEvent) {
            console.log("✅ Webhook is configured for checkout.session.completed");
        } else {
            console.log("⚠️ No webhook configured for checkout.session.completed");
        }

    } catch (error: any) {
        console.error("❌ Error:", error.message);
    }
}

testWebhook();

