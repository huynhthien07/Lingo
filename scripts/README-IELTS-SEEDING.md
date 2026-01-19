# IELTS Course Seeding Scripts

This directory contains scripts to seed IELTS Intermediate course data with all 4 skills.

## 📁 Available Scripts

### 1. **clean-ielts-course.ts** - Clean existing data
Deletes all units, lessons, challenges, and questions for IELTS Intermediate course.

```bash
npx tsx scripts/clean-ielts-course.ts
```

**Output:**
- Deletes all units
- Deletes all lessons
- Deletes all challenges
- Deletes all questions
- Deletes all challenge options

---

### 2. **seed-ielts-reading.ts** - Seed Reading Skills
Creates Unit 1: Reading Skills with 6 lessons.

```bash
npx tsx scripts/seed-ielts-reading.ts
```

**Creates:**
- ✅ Lesson 1: Multiple Choice - Single Answer (3 questions)
- ✅ Lesson 2: Multiple Choice - Multiple Answers (2 questions)
- ✅ Lesson 3: True/False/Not Given (4 questions)
- ✅ Lesson 4: Matching Headings (1 matching question)
- ✅ Lesson 5: Sentence Completion (1 ordering question)
- ✅ Lesson 6: Summary Completion (4 text input questions)

**Total:** 6 lessons, 14 questions

---

### 3. **seed-ielts-listening.ts** - Seed Listening Skills
Creates Unit 2: Listening Skills with 4 lessons.

```bash
npx tsx scripts/seed-ielts-listening.ts
```

**Creates:**
- ✅ Lesson 1: Listening - Multiple Choice (3 questions)
- ✅ Lesson 2: Listening - Form Completion (5 questions)
- ✅ Lesson 3: Listening - Map Labeling (1 labeling question)
- ✅ Lesson 4: Listening - Short Answer (4 questions)

**Total:** 4 lessons, 13 questions

---

### 4. **seed-ielts-writing.ts** - Seed Writing Skills
Creates Unit 3: Writing Skills with 4 lessons.

```bash
npx tsx scripts/seed-ielts-writing.ts
```

**Creates:**
- ✅ Lesson 1: Writing Task 1 - Graphs & Charts
- ✅ Lesson 2: Writing Task 1 - Processes & Diagrams
- ✅ Lesson 3: Writing Task 2 - Opinion Essays
- ✅ Lesson 4: Writing Task 2 - Discussion Essays

**Total:** 4 lessons, 4 tasks

---

### 5. **seed-ielts-speaking.ts** - Seed Speaking Skills
Creates Unit 4: Speaking Skills with 3 lessons.

```bash
npx tsx scripts/seed-ielts-speaking.ts
```

**Creates:**
- ✅ Lesson 1: Speaking Part 1 - Introduction & Interview (2 challenges)
- ✅ Lesson 2: Speaking Part 2 - Individual Long Turn (2 challenges)
- ✅ Lesson 3: Speaking Part 3 - Two-way Discussion (2 challenges)

**Total:** 3 lessons, 6 challenges

---

### 6. **seed-all-ielts.ts** - Master Script
Runs all 4 skill scripts in sequence.

```bash
npx tsx scripts/seed-all-ielts.ts
```

**Creates:**
- ✅ Unit 1: Reading Skills (6 lessons)
- ✅ Unit 2: Listening Skills (4 lessons)
- ✅ Unit 3: Writing Skills (4 lessons)
- ✅ Unit 4: Speaking Skills (3 lessons)

**Total:** 4 units, 17 lessons, 40+ exercises

---

## 🚀 Recommended Workflow

### First Time Setup
```bash
# Run all scripts at once
npx tsx scripts/seed-all-ielts.ts
```

### Reset and Reseed
```bash
# Step 1: Clean old data
npx tsx scripts/clean-ielts-course.ts

# Step 2: Seed fresh data
npx tsx scripts/seed-all-ielts.ts
```

### Update Specific Skill
```bash
# Clean first
npx tsx scripts/clean-ielts-course.ts

# Then seed only the skill you want
npx tsx scripts/seed-ielts-reading.ts
```

---

## 📊 Data Structure

### Reading Skills (Unit 1)
- **Topics:** Internet History, Renewable Energy, Exercise Benefits, World Capitals, Water Cycle, Climate Change
- **Question Types:** Single Choice, Multiple Choice, True/False/Not Given, Matching, Ordering, Text Input
- **Passages:** Full reading passages with realistic IELTS content

### Listening Skills (Unit 2)
- **Topics:** University Orientation, Hotel Booking, Campus Tour, Museum Information
- **Question Types:** Multiple Choice, Form Completion, Map Labeling, Short Answer
- **Audio:** Placeholder audio paths (need to add real audio files)

### Writing Skills (Unit 3)
- **Task 1:** Graphs/Charts, Processes/Diagrams
- **Task 2:** Opinion Essays, Discussion Essays
- **Format:** Standard IELTS writing task format with instructions

### Speaking Skills (Unit 4)
- **Part 1:** Introduction & Interview (Work/Study, Hobbies)
- **Part 2:** Individual Long Turn (Describe a person, Describe a place)
- **Part 3:** Two-way Discussion (Education, Technology)
- **Format:** Standard IELTS speaking test format with sample questions

---

## 🎯 Customization

To customize content, edit the respective script files:

1. **Passages:** Edit the passage text in each `createLessonX()` function
2. **Questions:** Modify question text and options
3. **Add More Lessons:** Copy existing lesson creation pattern
4. **Change Topics:** Update passage content and questions

---

## ⚠️ Important Notes

1. **Course Must Exist:** The course "IELTS Intermediate - Band 5.0-6.0" must exist in the database
2. **Clean Before Reseed:** Always run `clean-ielts-course.ts` before reseeding to avoid duplicates
3. **Audio/Image Paths:** Update placeholder paths with real file paths after uploading media
4. **Question Count:** The UI now shows question count instead of option count

---

## 🐛 Troubleshooting

### "Course not found" error
- Make sure the course exists in the database
- Check the course title matches exactly: "IELTS Intermediate - Band 5.0-6.0"

### Duplicate data
- Run `clean-ielts-course.ts` first to remove old data

### Missing questions
- Check that the challenge was created successfully
- Verify the question creation code ran without errors

---

## 📝 Next Steps

After seeding:
1. ✅ Test the UI - View lessons in student/teacher interface
2. ✅ Upload real audio files for listening exercises
3. ✅ Upload real images for diagrams and graphs
4. ✅ Test question submission and grading
5. ✅ Add more content as needed

