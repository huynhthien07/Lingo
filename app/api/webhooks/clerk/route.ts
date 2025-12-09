import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import db from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new NextResponse('Error: Missing svix headers', {
            status: 400
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new NextResponse('Error: Verification failed', {
            status: 400
        });
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`🔔 Clerk Webhook received: ${eventType}`);

    if (eventType === 'user.created') {
        const { id, email_addresses, username, first_name, last_name, image_url, public_metadata } = evt.data;

        const email = email_addresses[0]?.email_address || '';
        const userName = username || email.split('@')[0];
        const role = (public_metadata?.role as string) || 'STUDENT';

        console.log(`👤 Creating user: ${userName} (${email})`);

        try {
            await db.insert(users).values({
                userId: id,
                email: email,
                userName: userName,
                firstName: first_name || null,
                lastName: last_name || null,
                userImageSrc: image_url || '/mascot.svg',
                status: 'active',
                role: role as any,
                language: 'en',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log(`✅ User created in database: ${userName}`);
        } catch (error) {
            console.error('❌ Error creating user in database:', error);
        }
    }

    if (eventType === 'user.updated') {
        const { id, email_addresses, username, first_name, last_name, image_url, public_metadata } = evt.data;

        const email = email_addresses[0]?.email_address || '';
        const userName = username || email.split('@')[0];
        const role = (public_metadata?.role as string) || 'STUDENT';

        console.log(`🔄 Updating user: ${userName} (${email})`);

        try {
            await db.update(users)
                .set({
                    email: email,
                    userName: userName,
                    firstName: first_name || null,
                    lastName: last_name || null,
                    userImageSrc: image_url || '/mascot.svg',
                    role: role as any,
                    updatedAt: new Date(),
                })
                .where(eq(users.userId, id));

            console.log(`✅ User updated in database: ${userName}`);
        } catch (error) {
            console.error('❌ Error updating user in database:', error);
        }
    }

    if (eventType === 'user.deleted') {
        const { id } = evt.data;

        console.log(`🗑️ Deleting user: ${id}`);

        try {
            await db.delete(users).where(eq(users.userId, id));
            console.log(`✅ User deleted from database: ${id}`);
        } catch (error) {
            console.error('❌ Error deleting user from database:', error);
        }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
}

