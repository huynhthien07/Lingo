import "dotenv/config";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkUserRole() {
  const userId = "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY";
  
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  console.log("User:", user);
  console.log("Is Admin:", user?.role === "ADMIN");
}

checkUserRole()
  .then(() => {
    console.log("✅ Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

