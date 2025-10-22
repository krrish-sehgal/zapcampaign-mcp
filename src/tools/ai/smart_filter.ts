import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { getGeminiClient } from "../../utils/llm_client.js";
import { SMART_FILTER_PROMPT } from "../../utils/ai_prompts.js";
import { SmartFilterResult } from "../../utils/scoring_criteria.js";

export function registerSmartFilterTool(server: PaidMcpServer) {
  server.registerTool(
    "smartFilter",
    {
      title: "Smart Filter Posts with AI",
      description:
        "Batch categorize Nostr posts by quality using Gemini AI. Automatically sorts posts into high/medium/low quality and spam categories.",
      inputSchema: {
        posts: z
          .array(
            z.object({
              id: z.string(),
              pubkey: z.string(),
              content: z.string(),
              created_at: z.number().optional(),
            })
          )
          .min(1)
          .max(50)
          .describe("Posts to filter (max 50 per request)"),
        hashtag: z
          .string()
          .optional()
          .describe("Hashtag context for relevance filtering"),
      },
      outputSchema: {
        highQualityPosts: z.array(z.string()),
        mediumQualityPosts: z.array(z.string()),
        lowQualityPosts: z.array(z.string()),
        spamPosts: z.array(z.string()),
        summary: z.object({
          total: z.number(),
          highQuality: z.number(),
          mediumQuality: z.number(),
          lowQuality: z.number(),
          spam: z.number(),
        }),
      },
    },
    // async (params) => {
    //   // Charge callback - 5 sats per request
    //   return {
    //     satoshi: 5,
    //     description: `AI smart filtering for ${params.posts.length} post(s)`,
    //   };
    // },
    async (params) => {
      try {
        const { posts, hashtag } = params;
        const gemini = getGeminiClient();

        // Prepare posts for the prompt
        const postsForPrompt = posts.map((post: any) => ({
          id: post.id,
          content: post.content,
          pubkey: post.pubkey,
        }));

        // Filter posts with Gemini
        const prompt = SMART_FILTER_PROMPT(postsForPrompt, hashtag || "nostr");
        const result = await gemini.generateJSON<SmartFilterResult>(prompt);

        // Calculate summary
        const summary = {
          total: posts.length,
          highQuality: result.highQualityPosts.length,
          mediumQuality: result.mediumQualityPosts.length,
          lowQuality: result.lowQualityPosts.length,
          spam: result.spamPosts.length,
        };

        // Format output
        const output =
          `🎯 HIGH QUALITY (${summary.highQuality}):\n` +
          (result.highQualityPosts.length > 0
            ? result.highQualityPosts
                .map((id) => `  - ${id.substring(0, 16)}...`)
                .join("\n")
            : "  (none)") +
          `\n\n📝 MEDIUM QUALITY (${summary.mediumQuality}):\n` +
          (result.mediumQualityPosts.length > 0
            ? result.mediumQualityPosts
                .map((id) => `  - ${id.substring(0, 16)}...`)
                .join("\n")
            : "  (none)") +
          `\n\n⚠️  LOW QUALITY (${summary.lowQuality}):\n` +
          (result.lowQualityPosts.length > 0
            ? result.lowQualityPosts
                .map((id) => `  - ${id.substring(0, 16)}...`)
                .join("\n")
            : "  (none)") +
          `\n\n🚫 SPAM (${summary.spam}):\n` +
          (result.spamPosts.length > 0
            ? result.spamPosts
                .map((id) => `  - ${id.substring(0, 16)}...`)
                .join("\n")
            : "  (none)");

        return {
          content: [
            {
              type: "text",
              text:
                `🤖 AI Smart Filter Results (Gemini 1.5 Flash)\n\n` +
                `📊 Analyzed ${posts.length} posts for #${
                  hashtag || "nostr"
                }\n\n` +
                output,
            },
          ],
          structuredContent: {
            ...result,
            summary,
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error filtering posts with AI: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
