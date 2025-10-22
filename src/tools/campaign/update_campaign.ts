import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { Campaign } from "../../types.js";
import { campaignStorage } from "../../storage/campaign_storage.js";
import { getUserId } from "../../utils/user_context.js";

export function registerUpdateCampaignTool(server: PaidMcpServer) {
  server.registerTool(
    "updateCampaign",
    {
      title: "Update Campaign",
      description:
        "Update your campaign configuration before execution. You can modify hashtag, reward amount, post count, or filters. Campaign must be in 'draft' or 'simulated' status.",
      inputSchema: {
        walletPubkey: z
          .string()
          .optional()
          .describe(
            "Your wallet node pubkey (from Alby payment MCP). Should match the one used in createCampaign."
          ),
        hashtag: z
          .string()
          .min(1)
          .optional()
          .describe("New hashtag to target (without # symbol)"),
        satsPerPost: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("New amount of sats to zap per post"),
        postCount: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("New number of posts to reward"),
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
          .describe("New filters to apply (replaces existing filters)"),
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
        campaign: z.object({
          id: z.string(),
          hashtag: z.string(),
          satsPerPost: z.number(),
          postCount: z.number(),
          status: z.enum(["draft", "simulated", "executed"]),
        }),
      },
    },
    async (params) => {
      try {
        const userId = getUserId(params);
        const campaign = campaignStorage.get(userId);

        if (!campaign) {
          return {
            content: [
              {
                type: "text",
                text: "❌ No campaign found. Please create a campaign first using createCampaign()",
              },
            ],
            structuredContent: {
              success: false,
              message: "No campaign found",
              campaign: null,
            },
            isError: true,
          };
        }

        // Check if campaign can be updated
        if (campaign.status === "executed") {
          return {
            content: [
              {
                type: "text",
                text:
                  `❌ Cannot update executed campaign.\n\n` +
                  `Campaign ${campaign.id} has already been executed.\n` +
                  `Please delete this campaign and create a new one.`,
              },
            ],
            structuredContent: {
              success: false,
              message: "Campaign already executed",
              campaign: {
                id: campaign.id,
                hashtag: campaign.hashtag,
                satsPerPost: campaign.satsPerPost,
                postCount: campaign.postCount,
                status: campaign.status,
              },
            },
            isError: true,
          };
        }

        // Check if at least one field is being updated
        const { hashtag, satsPerPost, postCount, filters } = params;
        if (!hashtag && !satsPerPost && !postCount && !filters) {
          return {
            content: [
              {
                type: "text",
                text:
                  `⚠️ No updates provided.\n\n` +
                  `Please specify at least one field to update:\n` +
                  `  - hashtag\n` +
                  `  - satsPerPost\n` +
                  `  - postCount\n` +
                  `  - filters`,
              },
            ],
            structuredContent: {
              success: false,
              message: "No updates provided",
              campaign: {
                id: campaign.id,
                hashtag: campaign.hashtag,
                satsPerPost: campaign.satsPerPost,
                postCount: campaign.postCount,
                status: campaign.status,
              },
            },
          };
        }

        // Store original values for comparison
        const originalHashtag = campaign.hashtag;
        const originalSatsPerPost = campaign.satsPerPost;
        const originalPostCount = campaign.postCount;
        const originalFilters = campaign.filters;

        // Apply updates
        if (hashtag !== undefined) {
          campaign.hashtag = hashtag.replace("#", "");
        }
        if (satsPerPost !== undefined) {
          campaign.satsPerPost = satsPerPost;
        }
        if (postCount !== undefined) {
          campaign.postCount = postCount;
        }
        if (filters !== undefined) {
          campaign.filters = filters;
        }

        // Reset to draft if it was simulated (need to re-simulate with new params)
        if (campaign.status === "simulated") {
          campaign.status = "draft";
          campaign.selectedPosts = undefined;
        }

        // Save updated campaign
        campaignStorage.set(userId, campaign);

        // Build changes summary
        const changes: string[] = [];
        if (hashtag !== undefined && hashtag !== originalHashtag) {
          changes.push(
            `  - Hashtag: #${originalHashtag} → #${campaign.hashtag}`
          );
        }
        if (satsPerPost !== undefined && satsPerPost !== originalSatsPerPost) {
          changes.push(
            `  - Reward: ${originalSatsPerPost} sats → ${campaign.satsPerPost} sats`
          );
        }
        if (postCount !== undefined && postCount !== originalPostCount) {
          changes.push(
            `  - Post count: ${originalPostCount} → ${campaign.postCount}`
          );
        }
        if (filters !== undefined) {
          changes.push(`  - Filters: Updated`);
        }

        const totalSats = campaign.satsPerPost * campaign.postCount;

        return {
          content: [
            {
              type: "text",
              text:
                `✅ Campaign updated successfully!\n\n` +
                `Changes made:\n${changes.join("\n")}\n\n` +
                `Updated campaign:\n` +
                `  - ID: ${campaign.id}\n` +
                `  - Hashtag: #${campaign.hashtag}\n` +
                `  - Reward: ${campaign.satsPerPost} sats per post\n` +
                `  - Target: ${campaign.postCount} posts\n` +
                `  - Total budget: ${totalSats} sats\n` +
                `  - Status: ${campaign.status}\n\n` +
                (campaign.status === "draft"
                  ? `Next step: Use simulateCampaign() to preview results`
                  : `Campaign was reset to draft. Run simulateCampaign() to preview the updated campaign.`),
            },
          ],
          structuredContent: {
            success: true,
            message: "Campaign updated successfully",
            campaign: {
              id: campaign.id,
              hashtag: campaign.hashtag,
              satsPerPost: campaign.satsPerPost,
              postCount: campaign.postCount,
              status: campaign.status,
            },
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error updating campaign: ${error.message}`,
            },
          ],
          structuredContent: {
            success: false,
            message: error.message,
            campaign: null,
          },
          isError: true,
        };
      }
    }
  );
}
