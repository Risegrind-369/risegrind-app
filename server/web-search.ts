/**
 * Web Search Helper
 *
 * Provides web search capability for AI mutations to verify facts and provide
 * real-time information about health, habits, routines, and wellness topics.
 *
 * Uses the built-in Manus API Hub omni_search endpoint.
 */
import { callDataApi } from "./_core/dataApi";

export interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
}

/**
 * Extract relevant keywords from text for web search
 * Focuses on health, habit, and wellness-related terms
 */
function extractSearchKeywords(text: string): string[] {
  const healthKeywords = [
    "sleep", "exercise", "workout", "fitness", "health", "nutrition",
    "diet", "protein", "caffeine", "meditation", "focus", "stress",
    "anxiety", "mood", "energy", "routine", "habit", "morning",
    "hydration", "water", "breathing", "yoga", "running", "walking",
    "strength", "cardio", "mental health", "wellness", "recovery",
    "supplement", "vitamin", "metabolism", "weight", "body",
  ];

  const words = text.toLowerCase().split(/\s+/);
  const found: Set<string> = new Set();

  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, "");
    for (const keyword of healthKeywords) {
      if (cleanWord.includes(keyword.replace(/\s+/g, ""))) {
        found.add(keyword);
      }
    }
  }

  return Array.from(found).slice(0, 3); // Limit to top 3 keywords
}

/**
 * Perform a web search for health/habit-related information
 * Returns a formatted string suitable for injection into LLM prompts
 */
export async function performWebSearch(query: string): Promise<string> {
  try {
    const keywords = extractSearchKeywords(query);
    if (keywords.length === 0) {
      return ""; // No health-related keywords found
    }

    const searchQuery = keywords.join(" ");

    // Call the built-in omni_search API
    const result = await callDataApi("omni_search", {
      query: {
        q: searchQuery,
        search_type: "api",
        limit: 3,
      },
    });

    if (!result || typeof result !== "object") {
      return "";
    }

    // Extract search results from the response
    const results = (result as any).results || [];
    if (!Array.isArray(results) || results.length === 0) {
      return "";
    }

    // Format search results for LLM injection
    const formattedResults = results
      .slice(0, 3)
      .map((r: any, idx: number) => {
        const title = r.title || r.name || "Result";
        const snippet = r.snippet || r.description || "";
        return `[${idx + 1}] ${title}: ${snippet}`;
      })
      .join("\n");

    return `\n\n[Web Search Results for "${searchQuery}"]:\n${formattedResults}`;
  } catch (error) {
    console.warn("[WebSearch] Error performing search:", error);
    return ""; // Gracefully fail without disrupting AI response
  }
}

/**
 * Get search context for a user's entry
 * Returns formatted string to inject into system prompt or user message
 */
export async function getSearchContextForEntry(entryContent: string): Promise<string> {
  if (!entryContent || entryContent.length < 10) {
    return ""; // Skip search for very short entries
  }

  return performWebSearch(entryContent);
}
