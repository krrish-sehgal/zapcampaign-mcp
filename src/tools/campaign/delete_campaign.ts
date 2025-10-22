import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { campaignStorage } from "../../storage/campaign_storage.js";
import { getUserId } from "../../utils/user_context.js";

export function registerDeleteCampaignTool(server: PaidMcpServer) {
  server.registerTool(
    "deleteCampaign",
    {
      title: "Delete Campaign",
      description:
        "Delete your active campaign. This will free up your campaign slot if you're on the free tier.",
      inputSchema: {
        walletPubkey: z
          .string()
          .optional()
          .describe(
            "Your wallet node pubkey (from Alby payment MCP). Should match the one used in createCampaign."
          ),
        confirm: z
          .boolean()
          .optional()
          .default(true)
          .describe("Confirmation to delete the campaign"),
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
        deletedCampaignId: z.string().optional(),
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
                text: "❌ No campaign found to delete.",
              },
            ],
            structuredContent: {
              success: false,
              message: "No campaign found",
            },
            isError: true,
          };
        }

        if (!params.confirm) {
          return {
            content: [
              {
                type: "text",
                text:
                  `⚠️ Campaign deletion requires confirmation.\n\n` +
                  `Campaign to be deleted:\n` +
                  `  - ID: ${campaign.id}\n` +
                  `  - Hashtag: #${campaign.hashtag}\n` +
                  `  - Status: ${campaign.status}\n\n` +
                  `Set confirm: true to proceed with deletion.`,
              },
            ],
            structuredContent: {
              success: false,
              message: "Confirmation required",
            },
          };
        }

        const campaignId = campaign.id;

        // Clear from in-memory storage
        campaignStorage.clear(userId);

        return {
          content: [
            {
              type: "text",
              text:
                `✅ Campaign deleted successfully!\n\n` +
                `Deleted campaign:\n` +
                `  - ID: ${campaignId}\n` +
                `  - Hashtag: #${campaign.hashtag}\n` +
                `  - Status: ${campaign.status}\n\n` +
                `You can now create a new campaign.`,
            },
          ],
          structuredContent: {
            success: true,
            message: "Campaign deleted successfully",
            deletedCampaignId: campaignId,
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting campaign: ${error.message}`,
            },
          ],
          structuredContent: {
            success: false,
            message: error.message,
          },
          isError: true,
        };
      }
    }
  );
}
