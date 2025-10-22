import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { getGeminiClient } from "../../utils/llm_client.js";
import { ANALYZE_CONTENT_PROMPT } from "../../utils/ai_prompts.js";
import { ContentAnalysis } from "../../utils/scoring_criteria.js";

export function registerAnalyzeContentTool(server: PaidMcpServer) {
  server.registerTool(
    "analyzeContent",
    {
      title: "Analyze Content with AI",
      description:
        "Deep content analysis using Gemini AI. Provides sentiment, topics, target audience, engagement predictions, and actionable insights for Nostr posts.",
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
          .max(10)
          .describe("Posts to analyze (max 10 per request)"),
        hashtag: z.string().optional().describe("Hashtag context for analysis"),
      },
      outputSchema: {
        analyses: z.array(
          z.object({
            postId: z.string(),
            sentiment: z.enum(["positive", "negative", "neutral", "mixed"]),
            topics: z.array(z.string()),
            targetAudience: z.string(),
            engagementPrediction: z.enum(["high", "medium", "low"]),
            keyInsights: z.array(z.string()),
            warnings: z.array(z.string()),
          })
        ),
      },
    },
    // async (params) => {
    //   // Charge callback - 5 sats per request
    //   return {
    //     satoshi: 5,
    //     description: `AI content analysis for ${params.posts.length} post(s)`,
    //   };
    // },
    async (params) => {
      try {
        const { posts, hashtag } = params;
        const gemini = getGeminiClient();

        // Analyze each post with Gemini
        const analysisPrompts = posts.map((post: any) =>
          ANALYZE_CONTENT_PROMPT(post.content, hashtag || "nostr")
        );

        const analyses = await gemini.generateBatch<ContentAnalysis>(
          analysisPrompts
        );

        // Add post IDs to analyses
        const analyzedPosts = analyses.map((analysis, idx) => ({
          ...analysis,
          postId: posts[idx].id,
        }));

        // Format output
        const output = analyzedPosts
          .map(
            (a, idx) =>
              `${idx + 1}. Post: ${a.postId.substring(0, 16)}...\n` +
              `   📊 Sentiment: ${a.sentiment.toUpperCase()}\n` +
              `   🏷️  Topics: ${a.topics.join(", ")}\n` +
              `   👥 Target: ${a.targetAudience}\n` +
              `   📈 Engagement: ${a.engagementPrediction.toUpperCase()}\n` +
              `    Insights:\n      - ${a.keyInsights.join("\n      - ")}` +
              (a.warnings && a.warnings.length > 0
                ? `\n   ⚠️  Warnings:\n      - ${a.warnings.join("\n      - ")}`
                : "")
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text:
                `🔍 AI Content Analysis Results (Gemini 1.5 Flash)\n\n` +
                `📊 Analyzed ${posts.length} post(s)\n\n${output}`,
            },
          ],
          structuredContent: {
            analyses: analyzedPosts,
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error analyzing content with AI: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
