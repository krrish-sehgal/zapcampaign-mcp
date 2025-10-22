import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { Campaign } from "../../types.js";
import { campaignStorage } from "../../storage/campaign_storage.js";

export function registerCreateCampaignTool(server: PaidMcpServer) {
  server.registerTool(
    "createCampaign",
    {
      title: "Create Campaign",
      description:
        "Create a new zap campaign to reward Nostr posts by hashtag. Stores campaign configuration for simulation and execution. Supports optional filters for targeting specific posts.",
      inputSchema: {
        hashtag: z
          .string()
          .min(1)
          .describe("The hashtag to target (without # symbol)"),
        satsPerPost: z
          .number()
          .int()
          .positive()
          .describe("Amount of sats to zap per post"),
        postCount: z
          .number()
          .int()
          .positive()
          .default(5)
          .describe("Number of posts to reward (default: 5)"),
        filters: z
          .object({
            minEngagement: z
              .number()
              .int()
              .optional()
              .describe("Minimum reactions/replies count"),
            excludeAuthors: z
              .array(z.string())
              .optional()
              .describe("List of pubkeys to exclude"),
            minContentLength: z
              .number()
              .int()
              .optional()
              .describe("Minimum content length in characters"),
            maxContentLength: z
              .number()
              .int()
              .optional()
              .describe("Maximum content length in characters"),
            since: z
              .number()
              .int()
              .optional()
              .describe("Unix timestamp - only posts after this time"),
            until: z
              .number()
              .int()
              .optional()
              .describe("Unix timestamp - only posts before this time"),
            requireImages: z
              .boolean()
              .optional()
              .describe("Only include posts with images"),
            excludeReplies: z
              .boolean()
              .optional()
              .describe("Exclude reply posts"),
          })
          .optional()
          .describe("Optional filters to target specific posts"),
      },
      outputSchema: {
        campaign: z.object({
          id: z.string(),
          hashtag: z.string(),
          satsPerPost: z.number(),
          postCount: z.number(),
          status: z.enum(["draft", "simulated", "executed"]),
          createdAt: z.string(),
        }),
      },
    },
    async (params) => {
      try {
        const { hashtag, satsPerPost, postCount, filters } = params;

        // Create campaign
        const campaign: Campaign = {
          id: `campaign-${Date.now()}`,
          hashtag: hashtag.replace("#", ""),
          satsPerPost,
          postCount,
          status: "draft",
          createdAt: new Date().toISOString(),
          filters: filters || undefined,
        };

        // Store campaign
        campaignStorage.set(campaign);

        const totalSats = satsPerPost * postCount;

        // Format filters info
        const filtersInfo = filters
          ? `\n\n🔍 Filters applied:\n${Object.entries(filters)
              .map(([key, value]) => `  - ${key}: ${JSON.stringify(value)}`)
              .join("\n")}`
          : "";

        return {
          content: [
            {
              type: "text",
              text:
                `✅ Campaign created successfully!\n\n` +
                `ID: ${campaign.id}\n` +
                `Hashtag: #${campaign.hashtag}\n` +
                `Reward: ${satsPerPost} sats per post\n` +
                `Target: ${postCount} posts\n` +
                `Total budget: ${totalSats} sats\n` +
                `Status: ${campaign.status}${filtersInfo}\n\n` +
                `Next steps:\n` +
                `1. Use simulateCampaign() to preview results\n` +
                `2. Use executeCampaign() to send zaps`,
            },
          ],
          structuredContent: {
            campaign,
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating campaign: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
