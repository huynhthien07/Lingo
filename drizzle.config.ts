// // import dotenv from "dotenv";
// import { loadEnvConfig } from '@next/env';
// import "dotenv/config";
// import type { Config } from 'drizzle-kit';
// import { cwd } from 'node:process';

// loadEnvConfig(cwd());
// // dotenv.config({ path: ".env" });



// export default {
//     // schema: "./db/schema.ts",
//     out: "./drizzle",
//     dialect: "postgresql",
//   schema: "./db/schema.ts",
//     // driver: "pg",
//     dbCredentials:{
//         connectionString: "postgresql://lingo_owner:npg_9unaVJqfgA2T@ep-square-wind-a50kyjrq-pooler.us-east-2.aws.neon.tech/lingo?sslmode=require",
//         // connectionString: process.env.DATABASE_URL as string,

//         // port: 5432, 
//     },
// } satisfies Config;
import dotenv from "dotenv";
import "dotenv/config";
import type { Config } from "drizzle-kit";

dotenv.config();

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, 
  },
} satisfies Config;
