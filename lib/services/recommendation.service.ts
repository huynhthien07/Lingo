/**
 * Course Recommendation Service
 * 
 * Implements Rule-based + Band Matching Recommendation Algorithm
 * 
 * Algorithm:
 * 1. Calculate Overall Band Score: (Reading + Listening) / 2
 * 2. Filter courses by band matching rules
 * 3. Rank courses by multi-criteria scoring
 * 4. Return top 3 recommendations
 * 
 * References:
 * - Zone of Proximal Development (ZPD) - Vygotsky (1978)
 * - Content-based Filtering - Recommender Systems Handbook (2015)
 */

import db from "@/db/drizzle";
import { courses, courseRecommendations, testAttempts } from "@/db/schema";
import { eq, and, gte, lte, isNotNull, sql } from "drizzle-orm";

/**
 * Course with recommendation metadata
 */
export interface CourseWithScore {
  id: number;
  title: string;
  description: string | null;
  imageSrc: string;
  bandFrom: number | null;
  bandTo: number | null;
  enrollmentCount: number;
  courseGoal: string | null;
  price: number;
  isFree: boolean;
}

/**
 * Recommendation result
 */
export interface RecommendationResult {
  course: CourseWithScore;
  score: number;
  rank: number;
  reason: string;
}

/**
 * Recommendation Engine
 */
export class RecommendationEngine {
  // Weights for multi-criteria scoring
  private static readonly WEIGHTS = {
    bandMatch: 0.5,    // 50% - Band matching score
    popularity: 0.3,   // 30% - Enrollment count
    goalMatch: 0.2,    // 20% - Goal alignment
  };

  /**
   * Calculate overall band score from Reading and Listening
   * Formula: (R + L) / 2, rounded to nearest 0.5
   */
  static calculateOverallBand(readingBand: number, listeningBand: number): number {
    const overall = (readingBand + listeningBand) / 2;
    // Round to nearest 0.5
    return Math.round(overall * 2) / 2;
  }

  /**
   * Rule 1: Check if course matches band range
   * Condition: overallBand >= band_from AND overallBand < band_to
   */
  static isBandMatch(overallBand: number, course: CourseWithScore): boolean {
    if (!course.bandFrom || !course.bandTo) return false;
    return overallBand >= course.bandFrom && overallBand < course.bandTo;
  }

  /**
   * Rule 3: Check if course is too difficult (avoid overload)
   * Condition: overallBand < band_from - 0.5
   */
  static isTooHard(overallBand: number, course: CourseWithScore): boolean {
    if (!course.bandFrom) return false;
    return overallBand < course.bandFrom - 0.5;
  }

  /**
   * Calculate band match score (Rule 2: Prefer closest match)
   * Formula: 1 / (1 + distance)
   * Higher score = closer to band_from
   */
  static calculateBandMatchScore(overallBand: number, course: CourseWithScore): number {
    if (!course.bandFrom) return 0;
    const distance = Math.abs(overallBand - course.bandFrom);
    return 1 / (1 + distance);
  }

  /**
   * Calculate popularity score
   * Formula: enrollment_count / max_enrollment
   */
  static calculatePopularityScore(course: CourseWithScore, maxEnrollment: number): number {
    if (maxEnrollment === 0) return 0;
    return course.enrollmentCount / maxEnrollment;
  }

  /**
   * Calculate goal match score
   * Returns 1.0 if goals match, 0.5 otherwise
   */
  static calculateGoalMatchScore(userGoal: string | undefined, courseGoal: string | null): number {
    if (!userGoal || !courseGoal) return 0.5; // Neutral if no goal specified
    return userGoal === courseGoal ? 1.0 : 0.5;
  }

  /**
   * Get course recommendations based on admission test results
   * 
   * @param attemptId - Test attempt ID (admission test)
   * @param userGoal - User's learning goal (optional)
   * @returns Top 3 recommended courses
   */
  static async getRecommendations(
    attemptId: number,
    userGoal?: string
  ): Promise<RecommendationResult[]> {
    // 1. Get test attempt with band scores
    const attempt = await db.query.testAttempts.findFirst({
      where: eq(testAttempts.id, attemptId),
    });

    if (!attempt || !attempt.readingBandScore || !attempt.listeningBandScore) {
      throw new Error("Test attempt not found or missing band scores");
    }

    // 2. Calculate overall band score
    const overallBand = this.calculateOverallBand(
      attempt.readingBandScore,
      attempt.listeningBandScore
    );

    // 3. Get all courses with band information
    const allCourses = await db.query.courses.findMany({
      where: and(
        isNotNull(courses.bandFrom),
        isNotNull(courses.bandTo)
      ),
    });

    // 4. Filter courses by rules
    const eligibleCourses = allCourses.filter((course) => {
      // Rule 1: Band match
      const matches = this.isBandMatch(overallBand, course as CourseWithScore);
      // Rule 3: Not too hard
      const notTooHard = !this.isTooHard(overallBand, course as CourseWithScore);
      return matches && notTooHard;
    });

    if (eligibleCourses.length === 0) {
      return []; // No suitable courses found
    }

    // 5. Calculate max enrollment for normalization
    const maxEnrollment = Math.max(...allCourses.map((c) => c.enrollmentCount));

    // 6. Score and rank courses
    const scoredCourses = eligibleCourses.map((course) => {
      const bandMatchScore = this.calculateBandMatchScore(overallBand, course as CourseWithScore);
      const popularityScore = this.calculatePopularityScore(course as CourseWithScore, maxEnrollment);
      const goalMatchScore = this.calculateGoalMatchScore(userGoal, course.courseGoal);

      // Total score (weighted sum)
      const score =
        this.WEIGHTS.bandMatch * bandMatchScore +
        this.WEIGHTS.popularity * popularityScore +
        this.WEIGHTS.goalMatch * goalMatchScore;

      // Generate reason
      let reason = `Your current level (${overallBand}) matches this course range (${course.bandFrom} - ${course.bandTo}).`;
      if (userGoal === course.courseGoal) {
        reason += ` This course aligns with your ${userGoal} goal.`;
      }

      return {
        course: course as CourseWithScore,
        score,
        rank: 0, // Will be set after sorting
        reason,
      };
    });

    // 7. Sort by score (descending) and assign ranks
    scoredCourses.sort((a, b) => b.score - a.score);
    scoredCourses.forEach((item, index) => {
      item.rank = index + 1;
    });

    // 8. Return top 3
    return scoredCourses.slice(0, 3);
  }

  /**
   * Save recommendations to database
   */
  static async saveRecommendations(
    userId: string,
    recommendations: RecommendationResult[]
  ): Promise<void> {
    const values = recommendations.map((rec) => ({
      userId,
      courseId: rec.course.id,
      score: rec.score,
      reason: rec.reason,
    }));

    await db.insert(courseRecommendations).values(values);
  }
}

