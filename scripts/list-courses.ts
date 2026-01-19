/**
 * List all courses
 */

import "dotenv/config";
import db from "@/db/drizzle";
import { courses } from "@/db/schema";

async function listCourses() {
  console.log("📚 Listing all courses...\n");

  try {
    const allCourses = await db.query.courses.findMany();

    if (allCourses.length === 0) {
      console.log("❌ No courses found");
      return;
    }

    console.log(`✅ Found ${allCourses.length} course(s):\n`);

    allCourses.forEach((course) => {
      console.log(`ID: ${course.id}`);
      console.log(`Title: ${course.title}`);
      console.log(`Price: ${course.price} ${course.currency}`);
      console.log(`Is Free: ${course.isFree}`);
      console.log(`---`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

listCourses();

