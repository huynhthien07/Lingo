import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const updateAdminRole = async () => {
    try {
        const email = "22521285@gm.uit.edu.vn";
        
        console.log(`🔄 Updating admin role for: ${email}\n`);

        // Check if user exists
        const existingUser = await sql`
            SELECT user_id, email, user_name, role, status
            FROM users
            WHERE email = ${email}
        `;

        if (existingUser.length === 0) {
            console.log(`❌ User not found with email: ${email}`);
            console.log(`\nPlease make sure the user has logged in at least once.`);
            return;
        }

        console.log(`✅ User found:`);
        console.log(`   - User ID: ${existingUser[0].user_id}`);
        console.log(`   - Name: ${existingUser[0].user_name}`);
        console.log(`   - Email: ${existingUser[0].email}`);
        console.log(`   - Current Role: ${existingUser[0].role}`);
        console.log(`   - Status: ${existingUser[0].status}`);

        // Update role to ADMIN
        const result = await sql`
            UPDATE users
            SET role = 'ADMIN',
                updated_at = NOW()
            WHERE email = ${email}
            RETURNING user_id, email, user_name, role, status
        `;

        if (result.length > 0) {
            console.log(`\n✅ Successfully updated role to ADMIN!`);
            console.log(`   - User ID: ${result[0].user_id}`);
            console.log(`   - Name: ${result[0].user_name}`);
            console.log(`   - Email: ${result[0].email}`);
            console.log(`   - New Role: ${result[0].role}`);
            console.log(`   - Status: ${result[0].status}`);
        } else {
            console.log(`\n❌ Failed to update role`);
        }

    } catch (error) {
        console.error("❌ Error updating admin role:", error);
    }
};

updateAdminRole();

