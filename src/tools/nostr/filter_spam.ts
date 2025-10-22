import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import { NostrPost } from "../../types.js";
import { filterSpam } from "../../utils/post_filters.js";

export function registerFilterSpamTool(server: PaidMcpServer) {
  server.registerTool(
    "filterSpam",
    {
      title: "Filter Spam Posts",
      description:
        "Filter out spam and low-quality Nostr posts based on heuristics like duplicate content, excessive posting from same pubkey, and too many hashtags",
      inputSchema: {
        posts: z
          .array(
            z.object({
              id: z.string(),
              pubkey: z.string(),
              content: z.string(),
              created_at: z.number(),
              created_date: z.string(),
              tags: z.array(z.array(z.string())).optional(),
              kind: z.number().optional(),
            })
          )
          .describe("Array of Nostr posts to filter"),
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
        filteredCount: z.number(),
        remainingCount: z.number(),
      },
    },
    async (params) => {
      try {
        const { posts } = params;

        // Filter spam using unified utility
        const filteredPosts = filterSpam(posts);
        const removedCount = posts.length - filteredPosts.length;

        return {
          content: [
            {
              type: "text",
              text: `Filtered ${removedCount} spam posts. ${
                filteredPosts.length
              } posts remaining.\n\n${JSON.stringify(filteredPosts, null, 2)}`,
            },
          ],
          structuredContent: {
            posts: filteredPosts,
            filteredCount: removedCount,
            remainingCount: filteredPosts.length,
          },
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error filtering posts: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
