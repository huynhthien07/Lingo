/**
 * Stripe Service
 * 
 * Handles all interactions with Stripe payment service
 * This service encapsulates Stripe API calls for payment processing
 */

import Stripe from "stripe";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2025-03-31.basil",
    typescript: true,
});

/**
 * Get Stripe client instance
 * @returns Stripe client
 */
export const getStripeClient = () => {
    return stripe;
};

/**
 * Create a checkout session for course payment
 * @param userId - User ID
 * @param courseId - Course ID
 * @param courseName - Course name
 * @param amount - Amount in cents
 * @param successUrl - URL to redirect on success
 * @param cancelUrl - URL to redirect on cancel
 * @returns Checkout session
 */
export const createCheckoutSession = async (
    userId: string,
    courseId: number,
    courseName: string,
    amount: number,
    successUrl: string,
    cancelUrl: string
) => {
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: courseName,
                        description: `Access to ${courseName}`,
                    },
                    unit_amount: amount, // Amount in cents
                },
                quantity: 1,
            },
        ],
        metadata: {
            userId,
            courseId: courseId.toString(),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
    });

    return session;
};

/**
 * Retrieve a checkout session
 * @param sessionId - Stripe session ID
 * @returns Checkout session
 */
export const getCheckoutSession = async (sessionId: string) => {
    return await stripe.checkout.sessions.retrieve(sessionId);
};

/**
 * Verify webhook signature
 * @param payload - Request body
 * @param signature - Stripe signature header
 * @returns Stripe event
 */
export const verifyWebhookSignature = (
    payload: string | Buffer,
    signature: string
): Stripe.Event => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    
    return stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
    );
};

/**
 * Handle successful payment
 * @param session - Checkout session
 * @returns Payment metadata
 */
export const handleSuccessfulPayment = async (session: Stripe.Checkout.Session) => {
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;
    
    if (!userId || !courseId) {
        throw new Error("Missing metadata in checkout session");
    }
    
    return {
        userId,
        courseId: parseInt(courseId),
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        paymentStatus: session.payment_status,
        sessionId: session.id,
    };
};

/**
 * Create a refund
 * @param paymentIntentId - Payment intent ID
 * @param amount - Amount to refund in cents (optional, full refund if not provided)
 * @returns Refund object
 */
export const createRefund = async (
    paymentIntentId: string,
    amount?: number
) => {
    const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
    };
    
    if (amount) {
        refundData.amount = amount;
    }
    
    return await stripe.refunds.create(refundData);
};

/**
 * Get payment intent
 * @param paymentIntentId - Payment intent ID
 * @returns Payment intent
 */
export const getPaymentIntent = async (paymentIntentId: string) => {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
};

/**
 * List all payments for a customer
 * @param customerId - Stripe customer ID
 * @param limit - Number of payments to retrieve
 * @returns List of payment intents
 */
export const listCustomerPayments = async (
    customerId: string,
    limit: number = 10
) => {
    return await stripe.paymentIntents.list({
        customer: customerId,
        limit,
    });
};

export { stripe };

