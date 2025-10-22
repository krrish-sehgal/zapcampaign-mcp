import { Event } from "nostr-tools";

/**
 * Nostr Post - formatted representation of a Nostr event
 */
export interface NostrPost {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  created_date: string;
  tags?: string[][];
  kind?: number;
}

/**
 * Nostr Query Filter for fetching events
 */
export interface NostrFilter {
  ids?: string[];
  authors?: string[];
  kinds?: number[];
  since?: number;
  until?: number;
  limit?: number;
  [key: `#${string}`]: string[] | undefined;
}

/**
 * Relay connection configuration
 */
export interface RelayConfig {
  urls: string[];
  timeout?: number;
}

/**
 * Fetch Posts Request
 */
export interface FetchPostsRequest {
  hashtag: string;
  limit: number;
}

/**
 * Fetch Posts Response
 */
export interface FetchPostsResponse {
  posts: NostrPost[];
  count: number;
  hashtag: string;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
  structuredContent?: {
    posts: NostrPost[];
  };
  isError?: boolean;
}

/**
 * Payment charge information
 */
export interface ChargeInfo {
  satoshi: number;
  description: string;
}

/**
 * Campaign filters
 */
export interface CampaignFilters {
  minEngagement?: number; // Minimum reactions/replies
  excludeAuthors?: string[]; // Pubkeys to exclude
  minContentLength?: number; // Minimum content length
  maxContentLength?: number; // Maximum content length
  since?: number; // Unix timestamp - posts after this time
  until?: number; // Unix timestamp - posts before this time
  requireImages?: boolean; // Only posts with images
  excludeReplies?: boolean; // Exclude reply posts
}

/**
 * Campaign configuration
 */
export interface Campaign {
  id: string;
  hashtag: string;
  satsPerPost: number;
  postCount: number;
  status: "draft" | "simulated" | "executed";
  createdAt: string;
  filters?: CampaignFilters;
  selectedPosts?: NostrPost[];
  results?: ZapResult[];
}

/**
 * Zap result for tracking payment status
 */
export interface ZapResult {
  postId: string;
  pubkey: string;
  amount: number;
  status: "success" | "failed";
  preimage?: string;
  error?: string;
  timestamp: string;
}

/**
 * Campaign simulation result
 */
export interface SimulationResult {
  campaign: Campaign;
  selectedPosts: NostrPost[];
  totalSats: number;
  postCount: number;
}

/**
 * Campaign execution result
 */
export interface ExecutionResult {
  campaign: Campaign;
  results: ZapResult[];
  successCount: number;
  failedCount: number;
  totalSatsSent: number;
}
