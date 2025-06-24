import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const diagnoseUserListIssue = async () => {
    try {
        console.log("🔍 DIAGNOSING USER LIST ISSUE\n");

        // Check 1: What's in user_progress table
        console.log("1️⃣ USER_PROGRESS TABLE ANALYSIS:");
        const userProgressData = await sql`
            SELECT user_id, user_name, blocked, hearts, points, active_course_id, created_at
            FROM user_progress 
            ORDER BY created_at DESC
        `;

        console.log(`   📊 Total records in user_progress: ${userProgressData.length}`);
        console.log("   📋 Records in user_progress:");
        userProgressData.forEach((user: any, index: number) => {
            const status = user.blocked ? "🚫 BLOCKED" : "✅ ACTIVE";
            console.log(`      ${index + 1}. ${user.user_name} (${user.user_id}) - ${status} - ${user.points} pts`);
        });

        // Check 2: Are there other user-related tables?
        console.log("\n2️⃣ DATABASE SCHEMA ANALYSIS:");
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%user%'
            ORDER BY table_name
        `;

        console.log("   📋 User-related tables found:");
        tables.forEach((table: any, index: number) => {
            console.log(`      ${index + 1}. ${table.table_name}`);
        });

        // Check 3: Check if there are any other tables with user data
        for (const table of tables) {
            if (table.table_name !== 'user_progress') {
                try {
                    const count = await sql`SELECT COUNT(*) as count FROM ${sql(table.table_name)}`;
                    console.log(`   📊 ${table.table_name}: ${count[0].count} records`);
                    
                    if (count[0].count > 0 && count[0].count < 20) {
                        const sample = await sql`SELECT * FROM ${sql(table.table_name)} LIMIT 3`;
                        console.log(`      Sample data:`, sample);
                    }
                } catch (error) {
                    console.log(`   ⚠️  Could not query ${table.table_name}: ${error}`);
                }
            }
        }

        // Check 4: Test the API endpoint directly
        console.log("\n3️⃣ API ENDPOINT TEST:");
        try {
            const response = await fetch('http://localhost:3001/api/users?_limit=100');
            
            if (response.ok) {
                const apiUsers = await response.json();
                console.log(`   📊 API returned ${apiUsers.length} users`);
                console.log("   📋 Users from API:");
                
                apiUsers.forEach((user: any, index: number) => {
                    const status = user.blocked ? "🚫 BLOCKED" : "✅ ACTIVE";
                    console.log(`      ${index + 1}. ${user.userName || user.user_name} (${user.id || user.userId}) - ${status}`);
                });

                // Compare API results with database
                const apiUserIds = apiUsers.map((u: any) => u.id || u.userId);
                const dbUserIds = userProgressData.map((u: any) => u.user_id);
                
                const extraInApi = apiUserIds.filter((id: string) => !dbUserIds.includes(id));
                const missingFromApi = dbUserIds.filter((id: string) => !apiUserIds.includes(id));
                
                if (extraInApi.length > 0) {
                    console.log(`   ⚠️  Users in API but not in user_progress: ${extraInApi.join(', ')}`);
                } else {
                    console.log("   ✅ No extra users in API");
                }
                
                if (missingFromApi.length > 0) {
                    console.log(`   ⚠️  Users in user_progress but not in API: ${missingFromApi.join(', ')}`);
                } else {
                    console.log("   ✅ No missing users from API");
                }
                
            } else {
                console.log(`   ❌ API request failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log("   ⚠️  API test failed (server may not be running):", error);
        }

        // Check 5: Check for any authentication/user management tables
        console.log("\n4️⃣ AUTHENTICATION SYSTEM CHECK:");
        
        // Check if there might be Clerk users or other auth system
        const allTables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;

        console.log("   📋 All tables in database:");
        allTables.forEach((table: any, index: number) => {
            console.log(`      ${index + 1}. ${table.table_name}`);
        });

        // Check 6: Look for any foreign key relationships
        console.log("\n5️⃣ FOREIGN KEY ANALYSIS:");
        const foreignKeys = await sql`
            SELECT 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND (tc.table_name LIKE '%user%' OR ccu.table_name LIKE '%user%')
        `;

        if (foreignKeys.length > 0) {
            console.log("   📋 User-related foreign keys:");
            foreignKeys.forEach((fk: any, index: number) => {
                console.log(`      ${index + 1}. ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            });
        } else {
            console.log("   📋 No user-related foreign keys found");
        }

        // Check 7: Examine the admin interface configuration
        console.log("\n6️⃣ ADMIN INTERFACE CONFIGURATION:");
        
        try {
            const fs = require('fs');
            const userListPath = 'app/admin/user/list.tsx';
            
            if (fs.existsSync(userListPath)) {
                const content = fs.readFileSync(userListPath, 'utf8');
                
                // Check what resource is being used
                if (content.includes('resource="users"')) {
                    console.log("   ✅ Admin list uses 'users' resource (correct)");
                } else {
                    console.log("   ⚠️  Admin list may be using wrong resource");
                }
                
                // Check for any custom data provider
                if (content.includes('dataProvider')) {
                    console.log("   ⚠️  Custom data provider detected");
                } else {
                    console.log("   ✅ Using default data provider");
                }
            }
        } catch (error) {
            console.log("   ⚠️  Could not analyze admin interface files");
        }

        console.log("\n🎯 DIAGNOSIS SUMMARY:");
        console.log("   • Checked user_progress table contents");
        console.log("   • Analyzed database schema for user tables");
        console.log("   • Tested API endpoint response");
        console.log("   • Compared API vs database data");
        console.log("   • Examined foreign key relationships");
        console.log("   • Verified admin interface configuration");

        console.log("\n📋 NEXT STEPS:");
        console.log("   1. Review the diagnosis results above");
        console.log("   2. Identify any discrepancies between API and database");
        console.log("   3. Check if there are users from other sources");
        console.log("   4. Verify the admin interface is using correct resource");

    } catch (error) {
        console.error("❌ Error diagnosing user list issue:", error);
        throw error;
    }
};

if (require.main === module) {
    diagnoseUserListIssue()
        .then(() => {
            console.log("\n✅ User list diagnosis completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Failed to diagnose user list issue:", error);
            process.exit(1);
        });
}
