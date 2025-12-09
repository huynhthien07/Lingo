# Language Packs Configuration

This directory contains configuration files for the application, including language translations.

## Language Packs (`language-packs.ts`)

Language packs are now managed as **code configuration** instead of database records. This provides several benefits:

### ✅ Benefits

- **Version Control**: All translations are tracked in Git
- **Type Safety**: TypeScript interfaces ensure correct usage
- **Easy to Edit**: Edit directly in code, no admin panel needed
- **Fast**: Translations loaded from memory, no database queries
- **Code Review**: Changes can be reviewed in pull requests

### 📁 Structure

```typescript
interface LanguagePack {
  locale: string;      // Language code: "en", "vi", "fr", etc.
  namespace: string;   // Feature/module: "common", "auth", "course", etc.
  key: string;         // Translation key: "button.submit", "label.email", etc.
  value: string;       // Translated text
}
```

### 🔧 Usage

#### 1. Get a single translation

```typescript
import { getTranslation } from "@/lib/config/language-packs";

const submitText = getTranslation("en", "common", "button.submit");
// Returns: "Submit"

const submitTextVi = getTranslation("vi", "common", "button.submit");
// Returns: "Gửi"
```

#### 2. Get all translations for a namespace

```typescript
import { getTranslationsByNamespace } from "@/lib/config/language-packs";

const commonTranslations = getTranslationsByNamespace("en", "common");
// Returns: { "button.submit": "Submit", "button.cancel": "Cancel", ... }
```

#### 3. Get all translations for a locale

```typescript
import { getTranslationsByLocale } from "@/lib/config/language-packs";

const allEnglish = getTranslationsByLocale("en");
// Returns: Array of all English translations
```

#### 4. Get available locales

```typescript
import { getAvailableLocales } from "@/lib/config/language-packs";

const locales = getAvailableLocales();
// Returns: ["en", "vi"]
```

### 📝 Adding New Translations

To add new translations, edit `lib/config/language-packs.ts`:

```typescript
export const LANGUAGE_PACKS: LanguagePack[] = [
  // ... existing translations ...
  
  // Add your new translation
  {
    locale: "en",
    namespace: "myfeature",
    key: "welcome.message",
    value: "Welcome to my feature!",
  },
  {
    locale: "vi",
    namespace: "myfeature",
    key: "welcome.message",
    value: "Chào mừng đến với tính năng của tôi!",
  },
];
```

### 🔄 Syncing to Database (Optional)

If you want to sync translations to the database for faster queries:

```bash
npx tsx scripts/sync-language-packs.ts
```

This script will:
- Read all translations from `lib/config/language-packs.ts`
- Create new records in the database
- Update existing records if values changed
- Skip unchanged records

### 📚 Available Namespaces

Current namespaces in the system:

- `common` - Common UI elements (buttons, labels, etc.)
- `auth` - Authentication (login, signup, logout)
- `course` - Course management
- `user` - User management
- `dashboard` - Dashboard and statistics
- `lesson` - Lesson management
- `exercise` - Exercises and challenges
- `nav` - Navigation menu items
- `message` - Error messages and notifications

### 🌍 Available Locales

Current supported languages:

- `en` - English
- `vi` - Vietnamese

To add a new language, add translations for all existing keys with the new locale code.

### 💡 Best Practices

1. **Use consistent naming**: Follow the pattern `namespace.category.item`
   - ✅ `course.create.title`
   - ❌ `createCourseTitle`

2. **Group related translations**: Keep related translations in the same namespace

3. **Add translations for all locales**: When adding a new key, add it for all supported languages

4. **Use descriptive keys**: Make keys self-explanatory
   - ✅ `button.submit`
   - ❌ `btn1`

5. **Keep values concise**: Translations should be short and clear

### 🔍 Example: Using in a React Component

```typescript
"use client";

import { getTranslation } from "@/lib/config/language-packs";
import { useState } from "react";

export function MyComponent() {
  const [locale, setLocale] = useState("en");

  return (
    <div>
      <h1>{getTranslation(locale, "course", "list.title")}</h1>
      <button>
        {getTranslation(locale, "common", "button.create")}
      </button>
    </div>
  );
}
```

### 📊 Statistics

Current translation count: **~100+ translations** across 2 languages

