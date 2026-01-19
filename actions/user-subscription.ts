"use server";

import { stripe } from '@/lib/stripe';

import { absoluteUrl } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";

const returnUrl = absoluteUrl ("/shop");

/**
 * Create Stripe checkout URL for subscription
 * Note: This is kept for legacy subscription support
 * New course payments should use course-specific checkout
 */
export const createStripeUrl = async () => {
    const {userId} = await auth();
    const user = await currentUser();

    if (!userId || !user){
        throw new Error ("Unauthorized");
    }

    // Create subscription checkout session
    const stripeSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: user.emailAddresses[0].emailAddress,
        line_items:[
        {
            quantity: 1,
            price_data: {
                currency: "USD",
                product_data: {
                    name: "Lingo Pro",
                    description: "Unlimited Hearts",
                },
                unit_amount:2000,// $20.000 USD
                recurring: {
                    interval: "month",
                },
            },
        },
        ],
        metadata:{
            userId,
        },
        success_url: returnUrl,
        cancel_url: returnUrl,
    });

    return { data: stripeSession.url};

};