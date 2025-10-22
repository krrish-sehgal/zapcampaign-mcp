import { Campaign } from "../types.js";

/**
 * Hybrid campaign storage
 * - Identified users (with wallet pubkey): stored per user in Map
 * - Anonymous users: single campaign (lost on server restart)
 */
class CampaignStorage {
  private campaigns: Map<string, Campaign> = new Map();

  set(userId: string, campaign: Campaign): void {
    this.campaigns.set(userId, campaign);
  }

  get(userId: string): Campaign | null {
    return this.campaigns.get(userId) || null;
  }

  clear(userId: string): void {
    this.campaigns.delete(userId);
  }

  exists(userId: string): boolean {
    return this.campaigns.has(userId);
  }

  getAll(): Campaign[] {
    return Array.from(this.campaigns.values());
  }
}

export const campaignStorage = new CampaignStorage();
