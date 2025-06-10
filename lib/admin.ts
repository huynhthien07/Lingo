import { auth } from "@clerk/nextjs/server";

const adminIds = [
    "user_2tDzSkqYJwxxqc2amlTOhxZ9fN8",
]

export const getIsAdmin = async () => {
    const {userId} = await auth();
    if (!userId){
        return false;
    }
    
    return adminIds.indexOf(userId) !== -1;
}