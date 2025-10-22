import { NostrPost, CampaignFilters } from "../types.js";

/**
 * Unified post filtering system
 * Handles both spam filtering and campaign-specific filtering
 */

/**
 * Basic spam detection filters
 */
export function filterSpam(posts: NostrPost[]): NostrPost[] {
  const seen = new Set<string>();
  const pubkeyCounts = new Map<string, number>();

  // Count posts per pubkey
  posts.forEach((post) => {
    pubkeyCounts.set(post.pubkey, (pubkeyCounts.get(post.pubkey) || 0) + 1);
  });

  return posts.filter((post) => {
    // Skip duplicate content
    const contentHash = post.content.toLowerCase().trim();
    if (seen.has(contentHash)) {
      return false;
    }
    seen.add(contentHash);

    // Skip if same pubkey appears too many times (> 3 times = likely spam)
    if ((pubkeyCounts.get(post.pubkey) || 0) > 3) {
      return false;
    }

    // Skip very short posts (< 10 characters)
    if (post.content.trim().length < 10) {
      return false;
    }

    // Skip posts with too many hashtags (> 10 = likely spam)
    const hashtagCount = (post.tags || []).filter(
      (tag) => tag[0] === "t"
    ).length;
    if (hashtagCount > 10) {
      return false;
    }

    return true;
  });
}

/**
 * Apply campaign-specific filters
 */
export function applyCampaignFilters(
  posts: NostrPost[],
  filters?: CampaignFilters
): NostrPost[] {
  if (!filters) return posts;

  return posts.filter((post) => {
    // Exclude specific authors
    if (filters.excludeAuthors?.includes(post.pubkey)) {
      return false;
    }

    // Minimum engagement (count replies/reactions from tags)
    if (filters.minEngagement !== undefined) {
      const engagementTags = (post.tags || []).filter(
        (tag) => tag[0] === "e" || tag[0] === "p"
      ).length;
      if (engagementTags < filters.minEngagement) {
        return false;
      }
    }

    // Content length constraints
    if (
      filters.minContentLength !== undefined &&
      post.content.length < filters.minContentLength
    ) {
      return false;
    }
    if (
      filters.maxContentLength !== undefined &&
      post.content.length > filters.maxContentLength
    ) {
      return false;
    }

    // Time range filters
    if (filters.since !== undefined && post.created_at < filters.since) {
      return false;
    }
    if (filters.until !== undefined && post.created_at > filters.until) {
      return false;
    }

    // Require images (check for image URLs in content or tags)
    if (filters.requireImages) {
      const hasImageUrl = /https?:\/\/\S+\.(jpg|jpeg|png|gif|webp)/i.test(
        post.content
      );
      const hasImageTag = (post.tags || []).some(
        (tag) => tag[0] === "image" || tag[0] === "imeta"
      );
      if (!hasImageUrl && !hasImageTag) {
        return false;
      }
    }

    // Exclude replies (posts with "e" or "reply" tags)
    if (filters.excludeReplies) {
      const isReply = (post.tags || []).some(
        (tag) =>
          tag[0] === "e" ||
          (tag[0] === "t" && tag[1]?.toLowerCase() === "reply")
      );
      if (isReply) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Apply all filters in sequence: spam detection + campaign filters
 */
export function filterPosts(
  posts: NostrPost[],
  options?: {
    enableSpamFilter?: boolean;
    campaignFilters?: CampaignFilters;
  }
): NostrPost[] {
  let filtered = posts;

  // Apply spam filter first (enabled by default)
  if (options?.enableSpamFilter !== false) {
    filtered = filterSpam(filtered);
  }

  // Apply campaign-specific filters
  if (options?.campaignFilters) {
    filtered = applyCampaignFilters(filtered, options.campaignFilters);
  }

  return filtered;
}
