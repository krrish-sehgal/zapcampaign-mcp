import { PaidMcpServer, MemoryStorage } from "@getalby/paidmcp";
import { registerFetchPostsTool } from "./tools/nostr/fetch_posts.js";
import { registerFilterSpamTool } from "./tools/nostr/filter_spam.js";
import { registerCreateCampaignTool } from "./tools/campaign/create_campaign.js";
import { registerSimulateCampaignTool } from "./tools/campaign/simulate_campaign.js";
import { registerExecuteCampaignTool } from "./tools/campaign/execute_campaign.js";
import { registerPrepareZapTool } from "./tools/payment/send_zap.js";

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

  // Register free tools
  registerFilterSpamTool(server); // FREE - Filter spam posts
  registerCreateCampaignTool(server); // FREE - Create campaign
  registerSimulateCampaignTool(server); // FREE - Preview campaign
  registerExecuteCampaignTool(server); // FREE - Execute campaign
  registerPrepareZapTool(server); // FREE - Prepare zap payment details

  return server;
}
