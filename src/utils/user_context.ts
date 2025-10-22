/**
 * User context utilities for identifying users via wallet node pubkey
 *
 * USER IDENTIFICATION:
 * - Connected users (with walletPubkey): Campaigns persist in-memory per user
 * - Anonymous users (no walletPubkey): Single session-based campaign
 *
 * IMPORTANT: We never store wallet credentials, only the pubkey (public identifier)
 */

/**
 * Extract user ID from tool invocation context
 *
 * @param params - Tool parameters that may contain walletPubkey
 * @returns User ID (wallet pubkey) or "anonymous"
 */
export function getUserId(params: any): string {
  // Check if wallet node pubkey is provided by payment MCP
  if (params.walletPubkey && typeof params.walletPubkey === "string") {
    return params.walletPubkey;
  }

  // Fallback to anonymous (session-based, non-persistent)
  return "anonymous";
}

/**
 * Check if user is identified (not anonymous)
 */
export function isIdentifiedUser(userId: string): boolean {
  return userId !== "anonymous";
}
