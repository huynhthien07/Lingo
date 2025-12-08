import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const checkDatabaseTables = async () => {
    try {
        console.log("🔍 CHECKING DATABASE TABLES ON NEONDB\n");
        console.log("📍 Database:", process.env.DATABASE_URL?.split('@')[1]?.split('?')[0]);
        console.log("");

        // Get all tables in public schema
        const tables = await sql`
            SELECT table_name, table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;

        console.log(`📊 Total tables found: ${tables.length}\n`);
        
        if (tables.length === 0) {
            console.log("❌ NO TABLES FOUND!");
            console.log("   This means the database is empty.");
            console.log("   You need to run: npx drizzle-kit push");
            return;
        }

        console.log("📋 Tables in database:");
        tables.forEach((table: any, index: number) => {
            console.log(`   ${index + 1}. ${table.table_name} (${table.table_type})`);
        });

        // Get all enums
        console.log("\n🔤 Enums in database:");
        const enums = await sql`
            SELECT t.typname as enum_name,
                   string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            GROUP BY t.typname
            ORDER BY t.typname
        `;

        if (enums.length > 0) {
            enums.forEach((enumType: any, index: number) => {
                console.log(`   ${index + 1}. ${enumType.enum_name}: [${enumType.enum_values}]`);
            });
        } else {
            console.log("   No enums found");
        }

        // Check for specific new tables
        console.log("\n✅ Checking for new schema tables:");
        const expectedTables = [
            'users',
            'user_progress',
            'courses',
            'units',
            'lessons',
            'challenges',
            'challenge_options',
            'challenge_metadata',
            'challenge_progress',
            'writing_submissions',
            'writing_feedback',
            'speaking_submissions',
            'speaking_feedback',
            'tests',
            'test_sections',
            'test_questions',
            'test_question_options',
            'test_attempts',
            'test_answers',
            'vocabulary_topics',
            'vocabulary_words',
            'user_vocabulary',
            'course_enrollments',
            'course_payments',
            'lesson_progress',
            'teacher_assignments',
            'teacher_availability',
            'achievements',
            'user_achievements',
            'leaderboards',
            'leaderboard_entries',
            'chat_sessions',
            'chat_messages',
            'language_packs',
        ];

        const tableNames = tables.map((t: any) => t.table_name);
        const missingTables = expectedTables.filter(t => !tableNames.includes(t));
        const extraTables = tableNames.filter((t: string) => !expectedTables.includes(t));

        if (missingTables.length > 0) {
            console.log(`   ❌ Missing tables (${missingTables.length}):`);
            missingTables.forEach(t => console.log(`      - ${t}`));
        } else {
            console.log("   ✅ All expected tables exist!");
        }

        if (extraTables.length > 0) {
            console.log(`\n   ⚠️  Extra tables (${extraTables.length}) - may be old schema:`);
            extraTables.forEach(t => console.log(`      - ${t}`));
        }

        // Check users table structure
        console.log("\n👤 Users table structure:");
        const usersColumns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY ordinal_position
        `;

        if (usersColumns.length > 0) {
            usersColumns.forEach((col: any) => {
                const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
                const defaultVal = col.column_default ? ` default: ${col.column_default}` : '';
                console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
            });
        } else {
            console.log("   ❌ Users table not found!");
        }

        console.log("\n✅ Database check complete!");

    } catch (error) {
        console.error("❌ Error checking database:", error);
    }
};

checkDatabaseTables();

