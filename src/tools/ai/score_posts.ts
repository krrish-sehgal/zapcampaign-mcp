import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { NostrPost } from "../../types.js";
import { getGeminiClient } from "../../utils/llm_client.js";
import { SCORE_POST_PROMPT } from "../../utils/ai_prompts.js";
import { PostScore } from "../../utils/scoring_criteria.js";

export function registerScorePostsTool(server: PaidMcpServer) {
  server.registerPaidTool(
    "scorePosts",
    {
      title: "Score Posts with AI",
      description:
        "🤖 USE THIS TOOL when user asks to: 'score posts', 'rate posts', 'evaluate post quality', 'rank posts by quality', or 'AI scoring'. Uses Gemini AI to score Nostr posts for quality, engagement potential, and relevance. Returns detailed scores (0-100) with breakdowns.",
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
          .max(20)
          .describe("Posts to score (max 20 per request)"),
        hashtag: z
          .string()
          .optional()
          .describe("Hashtag context for relevance scoring"),
      },
      outputSchema: {
        scores: z.array(
          z.object({
            postId: z.string(),
            overallScore: z.number(),
            breakdown: z.object({
              contentQuality: z.number(),
              engagement: z.number(),
              relevance: z.number(),
              authenticity: z.number(),
              communityValue: z.number(),
            }),
            reasoning: z.string(),
          })
        ),
        summary: z.object({
          averageScore: z.number(),
          highestScore: z.number(),
          lowestScore: z.number(),
          totalPosts: z.number(),
        }),
      },
    },
    async (params) => {
      // Charge callback - 1 sats per request
      return {
        satoshi: 1,
        description: `AI scoring for ${params.posts.length} post(s)`,
      };
    },
    async (params) => {
      try {
        const { posts, hashtag } = params;
        const gemini = getGeminiClient();

        // Score each post with Gemini
        const scoringPrompts = posts.map((post: any) =>
          SCORE_POST_PROMPT(post.content, hashtag || "nostr", post.pubkey)
        );

        const scores = await gemini.generateBatch<PostScore>(scoringPrompts);

        // Add post IDs to scores
        const scoredPosts = scores.map((score, idx) => ({
          ...score,
          postId: posts[idx].id,
        }));

        // Calculate summary statistics
        const overallScores = scoredPosts.map((s) => s.overallScore);
        const averageScore =
          overallScores.reduce((a, b) => a + b, 0) / overallScores.length;
        const highestScore = Math.max(...overallScores);
        const lowestScore = Math.min(...overallScores);

        // Format output
        const sortedPosts = [...scoredPosts].sort(
          (a, b) => b.overallScore - a.overallScore
        );

        const output = sortedPosts
          .map(
            (s, idx) =>
              `${idx + 1}. Score: ${
                s.overallScore
              }/100 - Post: ${s.postId.substring(0, 16)}...\n` +
              `   Quality: ${s.breakdown.contentQuality} | Engagement: ${s.breakdown.engagement} | Relevance: ${s.breakdown.relevance}\n` +
              `   ${s.reasoning}`
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text:
                `✨ AI Scoring Results (Gemini 1.5 Flash)\n\n` +
                `📊 Summary:\n` +
                `  - Posts analyzed: ${posts.length}\n` +
                `  - Average score: ${averageScore.toFixed(1)}/100\n` +
                `  - Highest score: ${highestScore}/100\n` +
                `  - Lowest score: ${lowestScore}/100\n\n` +
                `🏆 Ranked Posts:\n\n${output}`,
            },
          ],
          structuredContent: {
            scores: scoredPosts,
            summary: {
              averageScore: Math.round(averageScore * 10) / 10,
              highestScore,
              lowestScore,
              totalPosts: posts.length,
            },
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Error scoring posts with AI: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
