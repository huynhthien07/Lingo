/**
 * IELTS Band Score Calculation Utilities
 * 
 * References:
 * - IELTS Official Scoring Guide (British Council, IDP, Cambridge Assessment)
 * - IELTS Band Score Conversion Tables
 * 
 * Band Score Scale: 0-9 (step 0.5)
 * - 9.0: Expert user
 * - 8.0-8.5: Very good user
 * - 7.0-7.5: Good user
 * - 6.0-6.5: Competent user
 * - 5.0-5.5: Modest user
 * - 4.0-4.5: Limited user
 * - 3.0-3.5: Extremely limited user
 * - 0-2.5: Non-user
 */

/**
 * Calculate band score from percentage
 * Based on IELTS official conversion table
 * 
 * @param percentage - Score percentage (0-100)
 * @returns Band score (0-9, step 0.5)
 */
export function calculateBandScoreFromPercentage(percentage: number): number {
  if (percentage >= 90) return 9.0;
  if (percentage >= 85) return 8.5;
  if (percentage >= 80) return 8.0;
  if (percentage >= 75) return 7.5;
  if (percentage >= 70) return 7.0;
  if (percentage >= 65) return 6.5;
  if (percentage >= 60) return 6.0;
  if (percentage >= 55) return 5.5;
  if (percentage >= 50) return 5.0;
  if (percentage >= 45) return 4.5;
  if (percentage >= 40) return 4.0;
  if (percentage >= 35) return 3.5;
  if (percentage >= 30) return 3.0;
  if (percentage >= 25) return 2.5;
  if (percentage >= 20) return 2.0;
  if (percentage >= 15) return 1.5;
  if (percentage >= 10) return 1.0;
  if (percentage >= 5) return 0.5;
  return 0.0;
}

/**
 * Calculate band score from raw score
 * 
 * @param score - Raw score (number of correct answers)
 * @param totalQuestions - Total number of questions
 * @returns Band score (0-9, step 0.5)
 */
export function calculateBandScore(score: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  const percentage = (score / totalQuestions) * 100;
  return calculateBandScoreFromPercentage(percentage);
}

/**
 * Calculate overall band score from multiple criteria
 * Used for Writing and Speaking (4 criteria each)
 * 
 * Formula: Average of all criteria, rounded to nearest 0.5
 * 
 * @param scores - Array of criteria scores (0-9, step 0.5)
 * @returns Overall band score (0-9, step 0.5)
 */
export function calculateOverallBandScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Round to nearest 0.5
  return Math.round(average * 2) / 2;
}

/**
 * Calculate overall band score from Reading and Listening
 * Used for admission tests
 * 
 * Formula: (Reading + Listening) / 2, rounded to nearest 0.5
 * 
 * @param readingBand - Reading band score
 * @param listeningBand - Listening band score
 * @returns Overall band score (0-9, step 0.5)
 */
export function calculateAdmissionBandScore(
  readingBand: number,
  listeningBand: number
): number {
  const average = (readingBand + listeningBand) / 2;
  return Math.round(average * 2) / 2;
}

/**
 * Get band score description
 * 
 * @param bandScore - Band score (0-9)
 * @returns Description of the band level
 */
export function getBandScoreDescription(bandScore: number): string {
  if (bandScore >= 9.0) return "Expert user";
  if (bandScore >= 8.0) return "Very good user";
  if (bandScore >= 7.0) return "Good user";
  if (bandScore >= 6.0) return "Competent user";
  if (bandScore >= 5.0) return "Modest user";
  if (bandScore >= 4.0) return "Limited user";
  if (bandScore >= 3.0) return "Extremely limited user";
  return "Non-user";
}

/**
 * Get band score color for UI
 * 
 * @param bandScore - Band score (0-9)
 * @returns Tailwind CSS color class
 */
export function getBandScoreColor(bandScore: number | null | undefined): string {
  if (!bandScore) return "text-gray-500";
  if (bandScore >= 8.0) return "text-green-600";
  if (bandScore >= 7.0) return "text-blue-600";
  if (bandScore >= 6.0) return "text-yellow-600";
  if (bandScore >= 5.0) return "text-orange-600";
  return "text-red-600";
}

/**
 * Validate band score
 * 
 * @param bandScore - Band score to validate
 * @returns True if valid (0-9, step 0.5)
 */
export function isValidBandScore(bandScore: number): boolean {
  if (bandScore < 0 || bandScore > 9) return false;
  // Check if it's a multiple of 0.5
  return (bandScore * 2) % 1 === 0;
}

