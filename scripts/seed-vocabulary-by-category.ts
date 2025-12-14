/**
 * Seed Vocabulary by Category
 * Adds vocabulary words to specific flashcard categories using Dictionary API
 */

import "dotenv/config";
import db from "@/db/drizzle";
import { flashcardCategories, flashcards, users } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

// Vocabulary organized by category
const vocabularyByCategory: Record<string, string[]> = {
  "IELTS Reading Vocabulary": [
    "analyze", "significant", "hypothesis", "demonstrate", "comprehensive",
    "evaluate", "interpret", "perspective", "relevant", "substantial",
    "acknowledge", "advocate", "allocate", "ambiguous", "anticipate",
    "arbitrary", "assess", "attribute", "coherent", "coincide",
  ],
  "IELTS Writing Task 2": [
    "furthermore", "nevertheless", "consequently", "moreover", "therefore",
    "alternatively", "specifically", "particularly", "essentially", "primarily",
    "significantly", "considerably", "substantially", "dramatically", "gradually",
  ],
  "IELTS Speaking Part 2": [
    "memorable", "fascinating", "challenging", "rewarding", "inspiring",
    "overwhelming", "remarkable", "extraordinary", "exceptional", "outstanding",
  ],
  "IELTS Listening Vocabulary": [
    "accommodation", "appointment", "assignment", "available", "cancel",
    "confirm", "deadline", "deposit", "discount", "extension",
  ],
  "Business English - Meetings": [
    "agenda", "minutes", "adjourn", "proposal", "consensus",
    "delegate", "facilitate", "negotiate", "collaborate", "implement",
  ],
  "Business English - Emails": [
    "regarding", "attached", "forward", "acknowledge", "confirm",
    "apologize", "appreciate", "urgent", "deadline", "follow-up",
  ],
  "Business English - Negotiations": [
    "negotiate", "compromise", "concession", "leverage", "stakeholder",
    "proposal", "agreement", "contract", "terms", "conditions",
  ],
  "Academic Writing": [
    "abstract", "methodology", "empirical", "hypothesis", "correlation",
    "framework", "paradigm", "criterion", "inference", "analysis",
  ],
  "Academic Presentations": [
    "introduce", "outline", "emphasize", "illustrate", "demonstrate",
    "conclude", "summarize", "highlight", "elaborate", "clarify",
  ],
  "Common Phrasal Verbs": [
    "give up", "look forward", "carry out", "put off", "take over",
    "bring up", "turn down", "figure out", "come across", "run into",
  ],
  "English Idioms": [
    "break the ice", "piece of cake", "hit the nail", "cost an arm",
    "blessing in disguise", "call it a day", "cut corners", "get out of hand",
  ],
  "Technology Vocabulary": [
    "algorithm", "bandwidth", "encryption", "interface", "protocol",
    "software", "hardware", "database", "network", "server",
  ],
  "Medical English": [
    "diagnosis", "symptom", "treatment", "prescription", "therapy",
    "surgery", "patient", "physician", "clinic", "hospital",
  ],
  "Legal English": [
    "contract", "lawsuit", "attorney", "defendant", "plaintiff",
    "verdict", "testimony", "evidence", "jurisdiction", "litigation",
  ],
  "Travel & Tourism": [
    "itinerary", "reservation", "accommodation", "departure", "arrival",
    "luggage", "passport", "visa", "customs", "destination",
  ],
  "Food & Cooking": [
    "ingredient", "recipe", "cuisine", "flavor", "texture",
    "garnish", "marinate", "simmer", "sauté", "bake",
  ],
  "Environment & Climate": [
    "sustainability", "pollution", "conservation", "renewable", "emission",
    "biodiversity", "ecosystem", "deforestation", "recycling", "climate",
  ],
  "Education & Learning": [
    "curriculum", "pedagogy", "assessment", "literacy", "comprehension",
    "enrollment", "scholarship", "tuition", "semester", "graduate",
  ],
  "Finance & Economics": [
    "investment", "revenue", "profit", "budget", "inflation",
    "interest", "dividend", "equity", "liability", "asset",
  ],
  "Marketing & Advertising": [
    "campaign", "branding", "consumer", "target", "promotion",
    "strategy", "market", "advertising", "publicity", "awareness",
  ],
  "Science & Research": [
    "experiment", "hypothesis", "theory", "observation", "data",
    "variable", "control", "analysis", "conclusion", "evidence",
  ],
  "Social Media": [
    "viral", "trending", "hashtag", "follower", "engagement",
    "content", "platform", "algorithm", "influencer", "post",
  ],
  "Sports & Fitness": [
    "training", "exercise", "competition", "athlete", "tournament",
    "championship", "coach", "team", "opponent", "victory",
  ],
  "Arts & Culture": [
    "exhibition", "gallery", "performance", "artist", "masterpiece",
    "sculpture", "painting", "theater", "concert", "festival",
  ],
};

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

async function seedVocabulary() {
  try {
    console.log("🌱 Seeding vocabulary to flashcard categories...");

    // Get first teacher from database
    const teacher = await db.query.users.findFirst({
      where: eq(users.role, "TEACHER"),
    });

    const teacherId = teacher?.userId || "default_teacher_id";

    let totalAdded = 0;
    let categoriesProcessed = 0;

    // Process each category
    for (const [categoryName, words] of Object.entries(vocabularyByCategory)) {
      console.log(`\n📚 Processing category: ${categoryName}`);

      // Find category by name (case-insensitive)
      const category = await db.query.flashcardCategories.findFirst({
        where: ilike(flashcardCategories.name, categoryName),
      });

      if (!category) {
        console.log(`  ⚠️  Category not found: ${categoryName}`);
        continue;
      }

      let addedCount = 0;

      // Add words to category
      for (const word of words) {
        const wordData = await fetchWordFromAPI(word);
        if (wordData) {
          await db.insert(flashcards).values({
            categoryId: category.id,
            ...wordData,
            difficulty: "MEDIUM",
            source: "API",
            createdBy: teacherId,
          });
          addedCount++;
          totalAdded++;
          console.log(`  ✓ ${word}`);
        }
        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      console.log(`  ✅ Added ${addedCount} words to ${categoryName}`);
      categoriesProcessed++;
    }

    console.log(`\n✅ Vocabulary seeding completed!`);
    console.log(`
Summary:
- ${categoriesProcessed} categories processed
- ${totalAdded} flashcards created
- Ready to learn!
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding vocabulary:", error);
    process.exit(1);
  }
}

seedVocabulary();

