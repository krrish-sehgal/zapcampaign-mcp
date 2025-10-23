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

  // Register paid tools (4 tools - AI + campaign execution)
  registerScorePostsTool(server); // PAID - 1 sats per request (AI scoring)
  registerAnalyzeContentTool(server); // PAID - 1 sats per request (AI analysis)
  registerSmartFilterTool(server); // PAID - 1 sats per request (AI filtering)
  registerExecuteCampaignTool(server); // PAID - 1 sats per request (triggers real zaps)

  // Register free tools (7 tools - basic functionality)
  registerFetchPostsTool(server); // FREE - Fetch posts from Nostr
  registerFilterSpamTool(server); // FREE - Basic spam filtering
  registerCreateCampaignTool(server); // FREE - Create campaign
  registerUpdateCampaignTool(server); // FREE - Update campaign
  registerDeleteCampaignTool(server); // FREE - Delete campaign
  registerSimulateCampaignTool(server); // FREE - Preview campaign
  registerPrepareZapTool(server); // FREE - Prepare zap payment details

  return server;
}
