import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini LLM client for AI scoring and analysis
 */
class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using Gemini 1.5 Flash for speed and cost efficiency
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });
  }

  /**
   * Generate structured JSON response from Gemini
   */
  async generateJSON<T>(prompt: string): Promise<T> {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Extract JSON from response (sometimes wrapped in markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${text}`);
    }
  }

  /**
   * Generate text response from Gemini
   */
  async generateText(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Batch process multiple prompts
   */
  async generateBatch<T>(prompts: string[]): Promise<T[]> {
    const results = await Promise.all(
      prompts.map((prompt) => this.generateJSON<T>(prompt))
    );
    return results;
  }
}

// Singleton instance
let geminiClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set"
      );
    }
    geminiClient = new GeminiClient(apiKey);
  }
  return geminiClient;
}
