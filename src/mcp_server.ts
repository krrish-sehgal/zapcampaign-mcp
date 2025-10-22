import { PaidMcpServer, MemoryStorage } from "@getalby/paidmcp";
import { registerFetchPostsTool } from "./tools/nostr/fetch_posts.js";
import { registerFilterSpamTool } from "./tools/nostr/filter_spam.js";
import { registerCreateCampaignTool } from "./tools/campaign/create_campaign.js";
import { registerSimulateCampaignTool } from "./tools/campaign/simulate_campaign.js";
import { registerExecuteCampaignTool } from "./tools/campaign/execute_campaign.js";
import { registerUpdateCampaignTool } from "./tools/campaign/update_campaign.js";
import { registerDeleteCampaignTool } from "./tools/campaign/delete_campaign.js";
import { registerPrepareZapTool } from "./tools/payment/prepare_zap.js";
import { registerScorePostsTool } from "./tools/ai/score_posts.js";
import { registerAnalyzeContentTool } from "./tools/ai/analyze_content.js";
import { registerSmartFilterTool } from "./tools/ai/smart_filter.js";

export function createMCPServer(nwcUrl: string): PaidMcpServer {
  const storage = new MemoryStorage();

  const server = new PaidMcpServer(
    {
      name: "zapcampaign-mcp",
      version: "1.0.0",
    },
    {
      nwcUrl,
      storage,
    }
  );

  // Register paid tools
  registerFetchPostsTool(server); // PAID - 1 sat per request
  registerScorePostsTool(server); // PAID - 10 sats per request (AI scoring)
  registerAnalyzeContentTool(server); // PAID - 5 sats per request (AI analysis)
  registerSmartFilterTool(server); // PAID - 5 sats per request (AI filtering)

  // Register free tools
  registerFilterSpamTool(server); // FREE - Filter spam posts
  registerCreateCampaignTool(server); // FREE - Create campaign
  registerUpdateCampaignTool(server); // FREE - Update campaign
  registerDeleteCampaignTool(server); // FREE - Delete campaign
  registerSimulateCampaignTool(server); // FREE - Preview campaign
  registerExecuteCampaignTool(server); // FREE - Execute campaign
  registerPrepareZapTool(server); // FREE - Prepare zap payment details

  return server;
}
