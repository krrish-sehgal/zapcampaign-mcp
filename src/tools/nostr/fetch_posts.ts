import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { SimplePool, Event } from "nostr-tools";
import {
  NostrPost,
  NostrFilter,
  FetchPostsRequest,
  ChargeInfo,
  ToolResult,
} from "../../types.js";

/**
 * Default Nostr relays to connect to
 */
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
];

/**
 * Fetch posts from Nostr by hashtag
 */
async function fetchPosts(
  hashtag: string,
  limit: number = 20,
  relays: string[] = DEFAULT_RELAYS
): Promise<NostrPost[]> {
  const pool = new SimplePool();

  // Normalize hashtag (remove # if present)
  const normalizedHashtag = hashtag.startsWith("#")
    ? hashtag.substring(1)
    : hashtag;

  try {
    // Query for kind 1 (text notes) with the hashtag
    const filter: NostrFilter = {
      kinds: [1],
      "#t": [normalizedHashtag.toLowerCase()],
      limit: Math.min(limit, 100),
    };

    const events = await pool.querySync(relays, filter);

    // Sort by created_at (newest first)
    const sortedEvents = Array.from(events).sort(
      (a, b) => b.created_at - a.created_at
    );

    // Convert to NostrPost format
    return sortedEvents.slice(0, limit).map(
      (event: Event): NostrPost => ({
        id: event.id,
        pubkey: event.pubkey,
        content: event.content,
        created_at: event.created_at,
        created_date: new Date(event.created_at * 1000).toISOString(),
        tags: event.tags,
        kind: event.kind,
      })
    );
  } finally {
    pool.close(relays);
  }
}

export function registerFetchPostsTool(server: PaidMcpServer) {
  server.registerTool(
    "fetchPosts",
    {
      title: "Fetch Nostr Posts",
      description: "Fetch Nostr posts by hashtag from Nostr relays",
      inputSchema: {
        hashtag: z
          .string()
          .min(1)
          .describe("The hashtag to search for (without the # symbol)"),
        limit: z
          .number()
          .int()
          .default(20)
          .describe("Maximum number of posts to fetch"),
      },
      outputSchema: {
        posts: z.array(
          z.object({
            id: z.string(),
            pubkey: z.string(),
            content: z.string(),
            created_at: z.number(),
            created_date: z.string(),
          })
        ),
      },
    },
    // async (params) => {
    //   // Charge callback - return the amount to charge (1 sat per request)
    //   return {
    //     satoshi: 1,
    //     description: `Fetching Nostr posts for #${params.hashtag}`,
    //   };
    // },
    async (params) => {
      // Tool execution callback
      try {
        const { hashtag, limit } = params;

        // Fetch posts
        const posts = await fetchPosts(hashtag, limit);

        if (posts.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No posts found for hashtag: #${hashtag}`,
              },
            ],
            structuredContent: {
              posts: [],
            },
          };
        }

        // Format posts for display (truncate content)
        const formattedPosts: NostrPost[] = posts.map((post) => ({
          id: post.id,
          pubkey: post.pubkey,
          content:
            post.content.substring(0, 200) +
            (post.content.length > 200 ? "..." : ""),
          created_at: post.created_at,
          created_date: post.created_date,
        }));

        return {
          content: [
            {
              type: "text",
              text: `Found ${
                posts.length
              } posts for #${hashtag}:\n\n${JSON.stringify(
                formattedPosts,
                null,
                2
              )}`,
            },
          ],
          structuredContent: {
            posts: formattedPosts,
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching posts: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
