import { auth } from "@clerk/nextjs/server";

const adminIds = [
    "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",
]

// Admin emails for additional verification
const adminEmails = [
    "22521285@gm.uit.edu.vn", // Current user for testing
]

export const getIsAdmin = async () => {
    try {
        const { userId } = await auth();
        console.log(`🔍 Admin check - User ID: ${userId}`);

        if (!userId) {
            console.log("❌ No user ID found");
            return false;
        }

        // Check by user ID first
        if (adminIds.indexOf(userId) !== -1) {
            console.log(`✅ Admin access granted to ${userId} (by ID)`);
            return true;
        }

        // For testing purposes, also check by email
        try {
            const { currentUser } = await import("@clerk/nextjs/server");
            const user = await currentUser();

            if (user && user.emailAddresses) {
                const userEmail = user.emailAddresses[0]?.emailAddress;
                console.log(`🔍 Checking email: ${userEmail}`);

                if (userEmail && adminEmails.includes(userEmail)) {
                    console.log(`✅ Admin access granted to ${userEmail} (by email)`);
                    return true;
                }
            }
        } catch (error) {
            console.error("Error checking admin by email:", error);
        }

        // TEMPORARY: For testing purposes, allow any authenticated user to be admin
        // This should be removed in production
        if (process.env.NODE_ENV === 'development') {
            console.log(`⚠️  DEVELOPMENT MODE: Granting admin access to ${userId}`);
            return true;
        }

        console.log(`❌ Admin access denied for ${userId}`);
        return false;
    } catch (error) {
        console.error("Error in getIsAdmin:", error);
        return false;
    }
}