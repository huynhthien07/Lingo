# Flashcard Management Guide

## Overview

The Flashcard Management system allows teachers to create vocabulary flashcards for students to learn. It integrates with the Free Dictionary API to automatically fetch word definitions, pronunciations, examples, and more.

## Features

### For Teachers

#### 1. **Category Management** (`/teacher/flashcards`)
- Create flashcard categories to organize words by topic/theme
- Edit category name and description
- Delete categories (will also delete all flashcards in that category)
- View flashcard count for each category

#### 2. **Flashcard Management** (`/teacher/flashcards/[categoryId]`)
- **Create Flashcards**:
  - **Manual Entry**: Enter all fields manually
  - **Dictionary Search**: Search for a word in Free Dictionary API to auto-fill:
    - Word
    - Definition (first definition from API)
    - Pronunciation (phonetic notation)
    - Part of Speech (noun, verb, adjective, etc.)
    - Example sentence
    - Synonyms (up to 10)
    - Antonyms (up to 10)
    - Audio URL (pronunciation audio)
    
- **Edit Flashcards**: Update any field of existing flashcards
- **Delete Flashcards**: Remove flashcards from category
- **Search Flashcards**: Search by word name
- **View Details**:
  - Word and definition
  - Pronunciation with audio player
  - Example sentence
  - Synonyms and antonyms
  - Difficulty level (Easy/Medium/Hard)
  - Source badge (From Dictionary vs Manual)

### For Students

#### 1. **Browse Categories** (`/student/flashcards`)
- View all available flashcard categories
- See flashcard count for each category
- Click to start learning

#### 2. **Interactive Learning** (`/student/flashcards/[categoryId]`)
- **Flip Card Animation**:
  - Front: Word, pronunciation, part of speech, audio button
  - Back: Definition, example, synonyms, antonyms
  - Click anywhere on card to flip
  
- **Navigation**:
  - Previous/Next buttons to move between cards
  - Progress bar showing completion percentage
  
- **Progress Tracking**:
  - Mark as "Easy" (correct) or "Hard" (incorrect)
  - Status badges: NEW → LEARNING → MASTERED
  - Correct/Incorrect count display
  - Auto-advance after marking
  
- **Spaced Repetition**:
  - NEW: First time seeing the card
  - LEARNING: Review tomorrow (after 1 day)
  - MASTERED: Review in 7 days (after 5 correct answers)

## Free Dictionary API Integration

### API Endpoint
```
https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

### Example Response
The API returns comprehensive word data including:
- Word and phonetic notation
- Multiple phonetics with audio files
- Origin/etymology
- Multiple meanings with different parts of speech
- Definitions with examples
- Synonyms and antonyms

### Data Transformation
Our system automatically:
1. Fixes audio URLs (adds `https:` prefix if needed)
2. Collects all definitions, examples, synonyms, antonyms
3. Removes duplicate synonyms/antonyms
4. Limits to first 5 definitions and examples
5. Combines multiple parts of speech

### Usage in Teacher Interface
1. Click "Add Flashcard" button
2. Enter a word in "Search Dictionary" field
3. Click "Search" button
4. Form auto-fills with data from API
5. Review and edit as needed
6. Click "Create" to save

## Database Schema

### flashcard_categories
- `id`: Primary key
- `name`: Category name
- `description`: Category description
- `createdBy`: Teacher's Clerk user ID
- `createdAt`, `updatedAt`: Timestamps

### flashcards
- `id`: Primary key
- `categoryId`: Foreign key to category
- `word`: The vocabulary word
- `definition`: Word definition
- `pronunciation`: Phonetic notation
- `example`: Example sentence
- `synonyms`: Comma-separated synonyms
- `antonyms`: Comma-separated antonyms
- `partOfSpeech`: noun, verb, adjective, etc.
- `audioUrl`: URL to pronunciation audio
- `imageUrl`: Optional image URL
- `difficulty`: Easy/Medium/Hard
- `source`: MANUAL or API
- `createdBy`: Teacher's Clerk user ID
- `createdAt`, `updatedAt`: Timestamps

### flashcard_progress
- `id`: Primary key
- `userId`: Student's Clerk user ID
- `flashcardId`: Foreign key to flashcard
- `status`: NEW, LEARNING, MASTERED
- `correctCount`: Number of correct answers
- `incorrectCount`: Number of incorrect answers
- `lastReviewedAt`: Last review timestamp
- `nextReviewAt`: Next scheduled review
- `createdAt`, `updatedAt`: Timestamps

## API Routes

### Teacher Routes
- `GET /api/teacher/flashcard-categories` - Get all categories
- `POST /api/teacher/flashcard-categories` - Create category
- `GET /api/teacher/flashcard-categories/[id]` - Get category
- `PATCH /api/teacher/flashcard-categories/[id]` - Update category
- `DELETE /api/teacher/flashcard-categories/[id]` - Delete category
- `GET /api/teacher/flashcard-categories/[id]/flashcards` - Get flashcards
- `POST /api/teacher/flashcard-categories/[id]/flashcards` - Create flashcard
- `GET /api/teacher/flashcards/[id]` - Get flashcard
- `PATCH /api/teacher/flashcards/[id]` - Update flashcard
- `DELETE /api/teacher/flashcards/[id]` - Delete flashcard

### Student Routes
- `GET /api/student/flashcard-categories` - Get all categories
- `GET /api/student/flashcard-categories/[id]/flashcards` - Get flashcards with progress
- `POST /api/student/flashcards/[id]/progress` - Update progress

### Dictionary Route
- `GET /api/dictionary/[word]` - Fetch word from Free Dictionary API

## Tips for Teachers

1. **Organize by Topic**: Create categories like "IELTS Academic Vocabulary", "Business English", "Common Idioms"
2. **Use Dictionary Search**: Save time by using the API for common words
3. **Add Context**: Always include example sentences to show word usage
4. **Set Difficulty**: Help students prioritize with Easy/Medium/Hard levels
5. **Review Regularly**: Check student progress and add more cards as needed

## Tips for Students

1. **Daily Practice**: Review flashcards daily for best retention
2. **Be Honest**: Mark cards accurately (Easy/Hard) for effective spaced repetition
3. **Listen to Audio**: Use pronunciation audio to improve speaking
4. **Read Examples**: Understand context by reading example sentences
5. **Track Progress**: Watch your status badges progress from NEW → MASTERED

