import "dotenv/config";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });
  return user?.role === "ADMIN";
}

async function testAdminCheck() {
  const adminUserId = "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY";
  
  console.log("Testing isUserAdmin function...");
  const result = await isUserAdmin(adminUserId);
  console.log(`User ${adminUserId} is admin: ${result}`);
  
  if (result) {
    console.log("✅ Admin check works correctly!");
  } else {
    console.log("❌ Admin check failed!");
  }
}

testAdminCheck()
  .then(() => {
    console.log("\n✅ Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

