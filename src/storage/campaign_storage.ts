import { Campaign } from "../types.js";

/**
 * Simple in-memory campaign storage
 * Stores a single active campaign
 */
class CampaignStorage {
  private campaign: Campaign | null = null;

  set(campaign: Campaign): void {
    this.campaign = campaign;
  }

  get(): Campaign | null {
    return this.campaign;
  }

  clear(): void {
    this.campaign = null;
  }

  exists(): boolean {
    return this.campaign !== null;
  }
}

export const campaignStorage = new CampaignStorage();
