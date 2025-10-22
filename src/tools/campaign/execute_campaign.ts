import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { ZapResult, ExecutionResult } from "../../types.js";
import { campaignStorage } from "../../storage/campaign_storage.js";
import { prepareZapPayment } from "../payment/send_zap.js";

export function registerExecuteCampaignTool(server: PaidMcpServer) {
  server.registerTool(
    "executeCampaign",
    {
      title: "Execute Campaign",
      description:
        "Prepare zap payment invoices for all selected posts in the simulated campaign. Returns Lightning invoices for the Alby payment MCP to execute.",
      inputSchema: {},
      outputSchema: {
        campaign: z.object({
          id: z.string(),
          hashtag: z.string(),
          status: z.enum(["draft", "simulated", "executed"]),
        }),
        results: z.array(
          z.object({
            postId: z.string(),
            pubkey: z.string(),
            amount: z.number(),
            status: z.enum(["success", "failed"]),
            error: z.string().optional(),
          })
        ),
        invoices: z.array(
          z.object({
            postId: z.string(),
            pubkey: z.string(),
            invoice: z.string(),
            amount: z.number(),
          })
        ),
        successCount: z.number(),
        failedCount: z.number(),
        totalSatsSent: z.number(),
      },
    },
    async (params) => {
      try {
        const campaign = campaignStorage.get();

        if (!campaign) {
          return {
            content: [
              {
                type: "text",
                text: "❌ No campaign found. Please create a campaign first.",
              },
            ],
            isError: true,
          };
        }

        if (campaign.status !== "simulated") {
          return {
            content: [
              {
                type: "text",
                text: "❌ Campaign not simulated. Please run simulateCampaign() first.",
              },
            ],
            isError: true,
          };
        }

        if (!campaign.selectedPosts || campaign.selectedPosts.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "❌ No posts selected. Please run simulateCampaign() first.",
              },
            ],
            isError: true,
          };
        }

        // Prepare zap details for each selected post
        const results: ZapResult[] = [];
        const zapInvoices: Array<{
          postId: string;
          pubkey: string;
          invoice: string;
          amount: number;
        }> = [];

        for (const post of campaign.selectedPosts) {
          try {
            const zapDetails = await prepareZapPayment(
              post.pubkey,
              campaign.satsPerPost,
              `Zap from campaign: #${campaign.hashtag}`
            );

            zapInvoices.push({
              postId: post.id,
              pubkey: post.pubkey,
              invoice: zapDetails.invoice,
              amount: campaign.satsPerPost,
            });

            results.push({
              postId: post.id,
              pubkey: post.pubkey,
              amount: campaign.satsPerPost,
              status: "success",
              timestamp: new Date().toISOString(),
            });
          } catch (error: any) {
            results.push({
              postId: post.id,
              pubkey: post.pubkey,
              amount: campaign.satsPerPost,
              status: "failed",
              error: error.message,
              timestamp: new Date().toISOString(),
            });
          }
        }

        const successCount = results.filter(
          (r) => r.status === "success"
        ).length;
        const failedCount = results.filter((r) => r.status === "failed").length;
        const totalSats = successCount * campaign.satsPerPost;

        // Update campaign status
        campaign.status = "executed";
        campaign.results = results;
        campaignStorage.set(campaign);

        // Format results
        const successList = results
          .filter((r) => r.status === "success")
          .map(
            (r, idx) =>
              `${idx + 1}. @${r.pubkey.substring(0, 16)}... - ${
                r.amount
              } sats ✅`
          )
          .join("\n");

        const failedList =
          failedCount > 0
            ? results
                .filter((r) => r.status === "failed")
                .map(
                  (r, idx) =>
                    `${idx + 1}. @${r.pubkey.substring(0, 16)}... - ${
                      r.amount
                    } sats ❌ (${r.error})`
                )
                .join("\n")
            : "";

        // Format invoices for agent to use
        const invoiceList = zapInvoices
          .map(
            (z, idx) =>
              `${idx + 1}. ${z.amount} sats → @${z.pubkey.substring(
                0,
                16
              )}...\n   Invoice: ${z.invoice}`
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text:
                `⚡ Campaign Zap Invoices Prepared!\n\n` +
                `Hashtag: #${campaign.hashtag}\n` +
                `Posts prepared: ${successCount}\n` +
                `Failed to prepare: ${failedCount}\n` +
                `Total amount: ${totalSats} sats\n\n` +
                `📋 Payment Invoices:\n${invoiceList}\n\n` +
                `💡 Use Alby payment MCP to pay these invoices and complete the zaps.${
                  failedList ? `\n\n❌ Failed:\n${failedList}` : ""
                }`,
            },
          ],
          structuredContent: {
            campaign: {
              id: campaign.id,
              hashtag: campaign.hashtag,
              status: campaign.status,
            },
            results: results.map((r) => ({
              postId: r.postId,
              pubkey: r.pubkey,
              amount: r.amount,
              status: r.status,
              error: r.error,
            })),
            invoices: zapInvoices,
            successCount,
            failedCount,
            totalSatsSent: totalSats,
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing campaign: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
