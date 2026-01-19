# IELTS Admission Test Setup Guide

## Overview
This guide explains how to set up the complete IELTS Admission Test with 95 questions across 16 sections.

## Test Structure
- **Listening**: 40 questions (7 sections)
- **Reading**: 40 questions (6 sections)
- **Grammar/Use of English**: 15 questions (3 sections)
- **Total**: 95 questions
- **Duration**: 180 minutes

## Running the Scripts

### Option 1: Run All Scripts in Sequence (Recommended)
```bash
npx tsx scripts/run-all-admission-test-scripts.ts
```

This will automatically run all scripts in the correct order:
1. `recreate-admission-test.ts` - Create base test with Listening & Reading
2. `recreate-admission-test-part2.ts` - Add Listening Ordering & Reading TFNG
3. `recreate-admission-test-part3.ts` - Add Reading MCQ & Matching
4. `recreate-admission-test-part4.ts` - Add Grammar/Use of English
5. `extend-admission-test-listening.ts` - Add 30 more listening questions
6. `extend-admission-test-reading.ts` - Add 30 more reading questions
7. `extend-admission-test-listening-final.ts` - Add final 5 listening questions

### Option 2: Run Scripts Individually
```bash
# Part 1: Base test
npx tsx scripts/recreate-admission-test.ts

# Part 2: Listening & Reading extensions
npx tsx scripts/recreate-admission-test-part2.ts

# Part 3: More reading sections
npx tsx scripts/recreate-admission-test-part3.ts

# Part 4: Grammar/Use of English
npx tsx scripts/recreate-admission-test-part4.ts

# Extensions
npx tsx scripts/extend-admission-test-listening.ts
npx tsx scripts/extend-admission-test-reading.ts
npx tsx scripts/extend-admission-test-listening-final.ts

# Fix section order
npx tsx scripts/fix-admission-test-order.ts
```

## Verification Scripts

### Check Test Structure
```bash
npx tsx scripts/check-admission-test.ts
```
Shows detailed information about all sections and questions.

### Display Test Structure
```bash
npx tsx scripts/display-admission-test.ts
```
Shows a formatted view of the complete test structure.

## Sections Breakdown

### Listening (40 questions)
1. Part 1 - Multiple Choice (4 questions)
2. Part 2 - Short Answer (3 questions)
3. Part 3 - Ordering (3 questions)
4. Part 4 - Short Answer (10 questions)
5. Part 5 - Conversation (10 questions)
6. Part 6 - Lecture (5 questions)
7. Part 7 - Completion (5 questions)

### Reading (40 questions)
1. Part 1 - True/False/Not Given (4 questions)
2. Part 2 - Multiple Choice (3 questions)
3. Part 3 - Matching Headings (3 questions)
4. Part 3 - Paragraph Matching (10 questions)
5. Part 4 - Summary Completion (10 questions)
6. Part 5 - Sentence Completion (10 questions)

### Grammar/Use of English (15 questions)
1. Part 1 - Grammar (8 questions)
2. Part 2 - Vocabulary (5 questions)
3. Part 3 - Error Recognition (2 questions)

## Notes
- All questions currently have placeholder content
- Audio files for listening sections need to be added separately
- Reading passages are placeholder text and should be replaced with actual content
- The test is marked as `isAdmission = true` for marketing page display

