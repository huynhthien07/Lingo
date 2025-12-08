# Changelog - IELTS Learning Platform

## [2.0.0] - 2025-12-07

### 🎯 Major Changes - Complete System Transformation

#### Database Schema Redesign
**From**: 15 tables (Lingo language learning app)  
**To**: 35 tables (IELTS Learning Platform)

### ✅ Added

#### Core Tables
- `users` - Enhanced with role-based access control (STUDENT, TEACHER, ADMIN)
- `user_progress` - **Removed `hearts` field**, added `level` field for gamification
- `courses` - Added `examType`, `level`, `price`, `currency`, `isFree` fields
- `units` - Course structure
- `lessons` - Added `skillType`, `estimatedDuration` fields

#### Challenge/Exercise Tables (UC1-UC15)
- `challenges` - Support for 16 IELTS question types
- `challenge_options` - Multiple choice options with `order` field
- `challenge_metadata` - Extended data for special challenge types
- `challenge_progress` - Track student progress with partial scoring (BR8)

#### Submission Tables (UC10-UC15, UC32)
- `writing_submissions` - IELTS band scores (4 criteria + overall)
- `writing_feedback` - Detailed teacher feedback
- `speaking_submissions` - IELTS band scores (4 criteria + overall)
- `speaking_feedback` - Detailed teacher feedback

#### Test Tables
- `tests` - Mock tests and full IELTS tests
- `test_sections` - Test sections by skill type
- `test_questions` - Questions within sections
- `test_question_options` - Answer options
- `test_attempts` - Track test attempts with band scores
- `test_answers` - Student answers with scoring

#### Vocabulary Tables (UC23, UC29)
- `vocabulary_topics` - Flashcard categories
- `vocabulary_words` - Individual flashcards with pronunciation, audio
- `user_vocabulary` - Track mastery and review count (BR99, BR100)

#### Enrollment & Payment Tables (UC25)
- `course_enrollments` - Student course registrations (BR106, BR107)
- `lesson_progress` - Track lesson completion
- `course_payments` - **Replaced `user_subscription`** with one-time payments

#### Teacher Tables (UC27-UC33)
- `teacher_assignments` - Assign teachers to courses
- `student_teacher_relations` - Track teacher-student relationships

#### Gamification Tables (UC19, UC26, BR65-BR66)
- `achievements` - Define achievements (4 tiers: 1K, 10K, 100K, 1M points)
- `user_achievements` - Track earned achievements
- `leaderboards` - Course-based and global leaderboards
- `leaderboard_entries` - Rankings (BR109-BR112)

#### Chat Tables (UC24, BR101-BR105)
- `chat_sessions` - Chat conversation sessions
- `chat_messages` - Individual messages with AI/USER/SYSTEM senders

#### Internationalization (UC36, BR141-BR144)
- `language_packs` - UI translations (Vietnamese, English)

### 🗑️ Removed

- `user_subscription` table - Replaced with `course_payments`
- `hearts` field from `user_progress` - Replaced with points-based system

### 🔄 Modified

#### Enums
- **New**: `roleEnum` (STUDENT, TEACHER, ADMIN) - RBAC model
- **New**: `examTypeEnum` (IELTS, TOEFL, TOEIC, GENERAL)
- **New**: `levelEnum` (BEGINNER to ADVANCED) - Based on CEFR framework
- **New**: `skillTypeEnum` (LISTENING, READING, WRITING, SPEAKING, VOCABULARY, GRAMMAR)
- **Expanded**: `challengeTypeEnum` - 16 IELTS-specific question types
- **New**: `difficultyEnum` (EASY, MEDIUM, HARD)
- **New**: `submissionStatusEnum` (PENDING, GRADING, GRADED, RETURNED)
- **New**: `testTypeEnum`, `testAttemptStatusEnum`
- **New**: `paymentStatusEnum` (PENDING, COMPLETED, FAILED, REFUNDED)
- **New**: `enrollmentStatusEnum`, `enrollmentTypeEnum`
- **New**: `achievementTypeEnum`, `periodEnum`, `senderEnum`

### 📚 Technical Improvements

#### Database Design Patterns Applied
1. **RBAC (Role-Based Access Control)** - NIST INCITS 359-2004
   - 3-tier role system: STUDENT, TEACHER, ADMIN
   - Permission-based access control

2. **CEFR Framework Integration**
   - Level classification (A1-C2)
   - Reference: Council of Europe CEFR

3. **IELTS Band Score System**
   - 0-9 scale with 0.5 increments
   - 4 criteria for Writing/Speaking
   - Reference: IELTS Official Test Format

4. **Gamification Design**
   - Octalysis Framework by Yu-kai Chou
   - Points, badges, leaderboards, achievements
   - 4-tier achievement system (BR66)

5. **Payment Processing**
   - Stripe Payment Intents API
   - PCI DSS compliant (no card data storage)
   - One-time course payments

#### Code Quality
- **Type Safety**: Full TypeScript with Drizzle ORM
- **Documentation**: Comprehensive inline comments with BR references
- **Relations**: 45 defined relations between tables
- **Migrations**: Idempotent database migrations

### 🔧 Scripts Added

- `scripts/drop-all-tables.ts` - Clean database reset
- `scripts/seed-new.ts` - Comprehensive seed data for testing

### 📖 Documentation Added

- `docs/REFERENCES.md` - Scientific references and theoretical foundations
- `docs/CHANGELOG.md` - This file

### 🎓 Academic References

All design decisions are backed by:
- Official documentation (Drizzle ORM, PostgreSQL, Stripe)
- Industry standards (NIST RBAC, PCI DSS, CEFR)
- Research papers (Gamification in Education)
- Best practices (Clean Code, Evolutionary Database Design)

See `docs/REFERENCES.md` for complete list.

---

## Migration Notes

### Breaking Changes
⚠️ **This is a complete database redesign. All existing data will be lost.**

### Migration Steps
1. ✅ Backup old schema (`db/schema-backup-[timestamp].ts`)
2. ✅ Drop all tables and enums
3. ✅ Create new schema with 35 tables
4. ✅ Define 45 relations
5. ✅ Push schema to database
6. ✅ Seed sample data

### Next Steps (PHASE 2)
- Implement authentication with Clerk (3 roles)
- Build Student features (screen by screen)
- Build Teacher features (screen by screen)
- Build Admin features (screen by screen)
- Implement additional features (Flashcard, Chatbot, Gamification)

---

**Version**: 2.0.0  
**Date**: 2025-12-07  
**Status**: ✅ PHASE 1 COMPLETE

