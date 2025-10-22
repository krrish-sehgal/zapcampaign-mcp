import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { SimplePool } from "nostr-tools";
import {
  NostrPost,
  NostrFilter,
  SimulationResult,
  CampaignFilters,
} from "../../types.js";
import { campaignStorage } from "../../storage/campaign_storage.js";
import { filterPosts } from "../../utils/post_filters.js";

const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
];

/**
 * Fetch and randomly select posts for the campaign
 */
async function fetchAndSelectPosts(
  hashtag: string,
  count: number,
  filters?: CampaignFilters
): Promise<NostrPost[]> {
  const pool = new SimplePool();

  try {
    const filter: NostrFilter = {
      kinds: [1],
      "#t": [hashtag.toLowerCase()],
      limit: 100, // Fetch more to have selection pool
      since: filters?.since,
      until: filters?.until,
    };

    const events = await pool.querySync(DEFAULT_RELAYS, filter);

    // Convert to NostrPost format
    let posts: NostrPost[] = Array.from(events).map((event) => ({
      id: event.id,
      pubkey: event.pubkey,
      content: event.content,
      created_at: event.created_at,
      created_date: new Date(event.created_at * 1000).toISOString(),
      tags: event.tags,
      kind: event.kind,
    }));

    // Apply unified filtering (spam detection + campaign filters)
    posts = filterPosts(posts, {
      enableSpamFilter: true,
      campaignFilters: filters,
    });

    // Filter duplicates by pubkey (one post per author for fairness)
    const uniqueByAuthor = new Map<string, NostrPost>();
    posts.forEach((post) => {
      if (!uniqueByAuthor.has(post.pubkey)) {
        uniqueByAuthor.set(post.pubkey, post);
      }
    });

    // Randomly select posts
    const uniquePosts = Array.from(uniqueByAuthor.values());
    const shuffled = uniquePosts.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } finally {
    pool.close(DEFAULT_RELAYS);
  }
}

export function registerSimulateCampaignTool(server: PaidMcpServer) {
  server.registerTool(
    "simulateCampaign",
    {
      title: "Simulate Campaign",
      description:
        "Preview which Nostr posts will receive zaps without actually sending payments. Fetches posts and randomly selects winners.",
      inputSchema: {},
      outputSchema: {
        campaign: z.object({
          id: z.string(),
          hashtag: z.string(),
          satsPerPost: z.number(),
          postCount: z.number(),
          status: z.enum(["draft", "simulated", "executed"]),
        }),
        selectedPosts: z.array(
          z.object({
            id: z.string(),
            pubkey: z.string(),
            content: z.string(),
            created_at: z.number(),
          })
        ),
        totalSats: z.number(),
        postCount: z.number(),
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
                text: "❌ No campaign found. Please create a campaign first using createCampaign()",
              },
            ],
            isError: true,
          };
        }

        // Fetch and select posts (applying campaign filters)
        const selectedPosts = await fetchAndSelectPosts(
          campaign.hashtag,
          campaign.postCount,
          campaign.filters
        );

        if (selectedPosts.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `❌ No posts found for hashtag #${campaign.hashtag}`,
              },
            ],
            isError: true,
          };
        }

        // Update campaign with selected posts
        campaign.selectedPosts = selectedPosts;
        campaign.status = "simulated";
        campaignStorage.set(campaign);

        const totalSats = campaign.satsPerPost * selectedPosts.length;

        // Format preview
        const preview = selectedPosts
          .map(
            (post, idx) =>
              `${idx + 1}. @${post.pubkey.substring(0, 16)}... (${
                campaign.satsPerPost
              } sats)\n   "${post.content.substring(0, 100)}..."`
          )
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: `🎯 Campaign Simulation Results\n\nHashtag: #${campaign.hashtag}\nSelected: ${selectedPosts.length} posts\nReward per post: ${campaign.satsPerPost} sats\nTotal to send: ${totalSats} sats\n\n📋 Selected Posts:\n${preview}\n\n✅ Ready to execute! Use executeCampaign() to send zaps.`,
            },
          ],
          structuredContent: {
            campaign: {
              id: campaign.id,
              hashtag: campaign.hashtag,
              satsPerPost: campaign.satsPerPost,
              postCount: selectedPosts.length,
              status: campaign.status,
            },
            selectedPosts: selectedPosts.map((p) => ({
              id: p.id,
              pubkey: p.pubkey,
              content: p.content.substring(0, 200),
              created_at: p.created_at,
            })),
            totalSats,
            postCount: selectedPosts.length,
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error simulating campaign: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
