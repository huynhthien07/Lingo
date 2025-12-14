/**
 * Free Dictionary API Integration
 * GET /api/dictionary/[word] - Fetch word definition from Free Dictionary API
 * 
 * Free Dictionary API: https://dictionaryapi.dev/
 * Example: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { word } = await params;

    if (!word) {
      return NextResponse.json(
        { error: "Word parameter is required" },
        { status: 400 }
      );
    }

    // Fetch from Free Dictionary API
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Word not found in dictionary" },
          { status: 404 }
        );
      }
      throw new Error(`Dictionary API returned ${response.status}`);
    }

    const data = await response.json();

    // Transform API response to our format
    const firstEntry = data[0];

    // Get all phonetics with audio
    const phoneticsWithAudio = firstEntry.phonetics?.filter((p: any) => p.audio) || [];
    const audioUrl = phoneticsWithAudio[0]?.audio || "";

    // Fix audio URL if it starts with //
    const fixedAudioUrl = audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl;

    // Get pronunciation (prefer phonetic with audio, fallback to first phonetic)
    const pronunciation =
      phoneticsWithAudio[0]?.text ||
      firstEntry.phonetic ||
      firstEntry.phonetics?.[0]?.text ||
      "";

    // Collect all definitions, examples, synonyms, and antonyms
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
        if (def.definition) {
          allDefinitions.push(def.definition);
        }
        if (def.example) {
          allExamples.push(def.example);
        }
      });

      if (meaning.synonyms?.length > 0) {
        allSynonyms.push(...meaning.synonyms);
      }

      if (meaning.antonyms?.length > 0) {
        allAntonyms.push(...meaning.antonyms);
      }
    });

    // Get first definition and example
    const firstMeaning = firstEntry.meanings?.[0];
    const firstDefinition = firstMeaning?.definitions?.[0];

    const transformedData = {
      word: firstEntry.word,
      pronunciation: pronunciation,
      audioUrl: fixedAudioUrl,
      partOfSpeech: partsOfSpeech.join(", ") || firstMeaning?.partOfSpeech || "",
      definition: allDefinitions[0] || "",
      example: allExamples[0] || "",
      synonyms: [...new Set(allSynonyms)].slice(0, 10).join(", "), // Remove duplicates, limit to 10
      antonyms: [...new Set(allAntonyms)].slice(0, 10).join(", "), // Remove duplicates, limit to 10
      origin: firstEntry.origin || "",
      // Additional data
      allDefinitions: allDefinitions.slice(0, 5), // First 5 definitions
      allExamples: allExamples.slice(0, 5), // First 5 examples
      allPartsOfSpeech: partsOfSpeech,
      // Include raw data for reference
      rawData: data,
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error("Error fetching from Dictionary API:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to fetch word definition" },
      { status: 500 }
    );
  }
};

