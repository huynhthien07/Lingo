/**
 * Seed Flashcards from Dictionary API
 * Creates flashcards by fetching data from Free Dictionary API
 */

import "dotenv/config";
import db from "@/db/drizzle";
import { flashcardCategories, flashcards, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Common IELTS words to fetch from API
const ieltsWords = [
  "analyze", "significant", "hypothesis", "demonstrate", "comprehensive",
  "evaluate", "interpret", "perspective", "relevant", "substantial",
  "acknowledge", "advocate", "allocate", "ambiguous", "anticipate",
  "arbitrary", "assess", "attribute", "coherent", "coincide",
  "commence", "compatible", "compensate", "complement", "conceive",
  "concurrent", "conduct", "confine", "conform", "consent",
];

const businessWords = [
  "negotiate", "strategy", "revenue", "profit", "investment",
  "stakeholder", "leverage", "synergy", "benchmark", "forecast",
  "merger", "acquisition", "dividend", "equity", "liability",
];

const academicWords = [
  "abstract", "theory", "methodology", "empirical", "paradigm",
  "framework", "criterion", "hypothesis", "inference", "correlation",
];

async function fetchWordFromAPI(word: string) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      console.log(`⚠️  Word not found: ${word}`);
      return null;
    }

    const data = await response.json();
    const firstEntry = data[0];

    // Get phonetics with audio
    const phoneticsWithAudio = firstEntry.phonetics?.filter((p: any) => p.audio) || [];
    const audioUrl = phoneticsWithAudio[0]?.audio || "";
    const fixedAudioUrl = audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl;

    // Get pronunciation
    const pronunciation =
      phoneticsWithAudio[0]?.text ||
      firstEntry.phonetic ||
      firstEntry.phonetics?.[0]?.text ||
      "";

    // Collect data
    const allDefinitions: string[] = [];
    const allExamples: string[] = [];
    const allSynonyms: string[] = [];
    const allAntonyms: string[] = [];
    const partsOfSpeech: string[] = [];

    firstEntry.meanings?.forEach((meaning: any) => {
      if (meaning.partOfSpeech && !partsOfSpeech.includes(meaning.partOfSpeech)) {
        partsOfSpeech.push(meaning.partOfSpeech);
      }

      meaning.definitions?.forEach((def: any) => {
        if (def.definition) allDefinitions.push(def.definition);
        if (def.example) allExamples.push(def.example);
      });

      if (meaning.synonyms?.length > 0) allSynonyms.push(...meaning.synonyms);
      if (meaning.antonyms?.length > 0) allAntonyms.push(...meaning.antonyms);
    });

    return {
      word: firstEntry.word,
      pronunciation,
      audioUrl: fixedAudioUrl,
      partOfSpeech: partsOfSpeech.join(", "),
      definition: allDefinitions[0] || "",
      example: allExamples[0] || "",
      synonyms: [...new Set(allSynonyms)].slice(0, 10).join(", "),
      antonyms: [...new Set(allAntonyms)].slice(0, 10).join(", "),
    };
  } catch (error) {
    console.error(`Error fetching ${word}:`, error);
    return null;
  }
}

async function seedFlashcardsFromAPI() {
  try {
    console.log("🌱 Seeding flashcards from Dictionary API...");

    // Get first teacher from database
    const teacher = await db.query.users.findFirst({
      where: eq(users.role, "TEACHER"),
    });

    const teacherId = teacher?.userId || "default_teacher_id";

    // Create categories
    const [ieltsCategory] = await db
      .insert(flashcardCategories)
      .values({
        name: "IELTS Essential Vocabulary",
        description: "Essential vocabulary for IELTS exam preparation",
        createdBy: teacherId,
      })
      .returning();

    const [businessCategory] = await db
      .insert(flashcardCategories)
      .values({
        name: "Business English",
        description: "Common business and professional vocabulary",
        createdBy: teacherId,
      })
      .returning();

    const [academicCategory] = await db
      .insert(flashcardCategories)
      .values({
        name: "Academic English",
        description: "Academic and research-related vocabulary",
        createdBy: teacherId,
      })
      .returning();

    console.log("✓ Created categories");

    // Fetch and create IELTS flashcards
    console.log("📚 Fetching IELTS words from API...");
    let ieltsCount = 0;
    for (const word of ieltsWords) {
      const wordData = await fetchWordFromAPI(word);
      if (wordData) {
        await db.insert(flashcards).values({
          categoryId: ieltsCategory.id,
          ...wordData,
          difficulty: "MEDIUM",
          source: "API",
          createdBy: teacherId,
        });
        ieltsCount++;
        console.log(`  ✓ ${word}`);
      }
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`✓ Created ${ieltsCount} IELTS flashcards`);

    // Fetch and create Business flashcards
    console.log("📚 Fetching Business words from API...");
    let businessCount = 0;
    for (const word of businessWords) {
      const wordData = await fetchWordFromAPI(word);
      if (wordData) {
        await db.insert(flashcards).values({
          categoryId: businessCategory.id,
          ...wordData,
          difficulty: "MEDIUM",
          source: "API",
          createdBy: teacherId,
        });
        businessCount++;
        console.log(`  ✓ ${word}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`✓ Created ${businessCount} Business flashcards`);

    // Fetch and create Academic flashcards
    console.log("📚 Fetching Academic words from API...");
    let academicCount = 0;
    for (const word of academicWords) {
      const wordData = await fetchWordFromAPI(word);
      if (wordData) {
        await db.insert(flashcards).values({
          categoryId: academicCategory.id,
          ...wordData,
          difficulty: "HARD",
          source: "API",
          createdBy: teacherId,
        });
        academicCount++;
        console.log(`  ✓ ${word}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`✓ Created ${academicCount} Academic flashcards`);

    console.log("✅ Flashcards seeded successfully from API!");
    console.log(`
Summary:
- 3 categories created
- ${ieltsCount} IELTS flashcards
- ${businessCount} Business flashcards
- ${academicCount} Academic flashcards
- Total: ${ieltsCount + businessCount + academicCount} flashcards
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding flashcards:", error);
    process.exit(1);
  }
}

seedFlashcardsFromAPI();

