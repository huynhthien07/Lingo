# Database Seeding Scripts

This directory contains scripts for seeding and managing database data.

## Flashcard Scripts

### 1. Seed Basic Flashcards
Creates 2 categories with 8 manually-defined flashcards.

```bash
npx tsx scripts/seed-flashcards.ts
```

**Creates:**
- IELTS Academic Vocabulary (5 flashcards)
- Common English Idioms (3 flashcards)

### 2. Seed Flashcards from API
Fetches words from Free Dictionary API and creates flashcards automatically.

```bash
npx tsx scripts/seed-flashcards-from-api.ts
```

**Creates:**
- IELTS Essential Vocabulary (30 flashcards)
- Business English (15 flashcards)
- Academic English (10 flashcards)

**Note:** This script takes ~2 minutes to complete due to API rate limiting (200ms delay between requests).

### 3. Clear All Flashcards
Deletes all flashcard data (categories, flashcards, and progress).

```bash
npx tsx scripts/clear-flashcards.ts
```

**Warning:** This will permanently delete all flashcard data!

## Test Scripts

### Clear Test Data
Deletes all test-related data.

```bash
npx tsx scripts/clear-test-data.ts
```

### Seed Test Structure
Creates sample test with sections and questions.

```bash
npx tsx scripts/seed-new-test-structure.ts
```

## Course Scripts

### Add Created By to Courses
Updates existing courses to add `createdBy` field.

```bash
npx tsx scripts/add-created-by-to-courses.ts
```

**Note:** This script deletes all existing courses to avoid migration issues.

## Usage Tips

### Fresh Start
To start with clean flashcard data:

```bash
# 1. Clear existing data
npx tsx scripts/clear-flashcards.ts

# 2. Seed new data from API
npx tsx scripts/seed-flashcards-from-api.ts
```

### Quick Test Data
For quick testing with minimal data:

```bash
npx tsx scripts/seed-flashcards.ts
```

### Production Setup
For production with comprehensive vocabulary:

```bash
# Run API seeding script
npx tsx scripts/seed-flashcards-from-api.ts

# Optionally add more manual flashcards through the UI
```

## Environment Requirements

All scripts require:
- `.env` file with database connection string
- Database schema already migrated (`npx drizzle-kit push`)
- At least one teacher user in the database (or will use default ID)

## Error Handling

If a script fails:
1. Check database connection in `.env`
2. Ensure schema is up to date: `npx drizzle-kit push`
3. Check console output for specific error messages
4. For API scripts, check internet connection

## Free Dictionary API

The `seed-flashcards-from-api.ts` script uses:
- **API**: https://api.dictionaryapi.dev/
- **Rate Limit**: No official limit, but we add 200ms delay between requests
- **Language**: English only
- **Data**: Definitions, pronunciations, examples, synonyms, antonyms, audio

### API Response Example
```json
{
  "word": "hello",
  "phonetic": "həˈləʊ",
  "phonetics": [
    {
      "text": "həˈləʊ",
      "audio": "//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3"
    }
  ],
  "meanings": [
    {
      "partOfSpeech": "exclamation",
      "definitions": [
        {
          "definition": "used as a greeting or to begin a phone conversation.",
          "example": "hello there, Katie!",
          "synonyms": [],
          "antonyms": []
        }
      ]
    }
  ]
}
```

## Customization

### Adding More Words
Edit `scripts/seed-flashcards-from-api.ts` and add words to the arrays:
- `ieltsWords` - IELTS vocabulary
- `businessWords` - Business English
- `academicWords` - Academic vocabulary

### Creating New Categories
Add new category creation in the script:

```typescript
const [newCategory] = await db
  .insert(flashcardCategories)
  .values({
    name: "Your Category Name",
    description: "Category description",
    createdBy: teacherId,
  })
  .returning();
```

### Manual Flashcards
Edit `scripts/seed-flashcards.ts` to add manually-defined flashcards with custom data.

