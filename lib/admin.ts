import { auth } from "@clerk/nextjs/server";

const adminIds = [
    "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",
]

export const getIsAdmin = async () => {
    const { userId } = await auth();
    if (!userId) {
        return false;
    }

    return adminIds.indexOf(userId) !== -1;
}