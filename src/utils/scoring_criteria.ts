/**
 * AI scoring criteria and rubrics
 */

export const SCORING_CRITERIA = {
  contentQuality: {
    weight: 0.25,
    description: "Grammar, clarity, and coherence",
  },
  engagement: {
    weight: 0.25,
    description: "Interesting, thought-provoking, discussion-worthy",
  },
  relevance: {
    weight: 0.2,
    description: "Relevance to hashtag and topic",
  },
  authenticity: {
    weight: 0.15,
    description: "Not spam, bot, or promotional",
  },
  communityValue: {
    weight: 0.15,
    description: "Adds value to Nostr community",
  },
};

export interface PostScore {
  postId: string;
  overallScore: number; // 0-100
  breakdown: {
    contentQuality: number; // 0-100
    engagement: number; // 0-100
    relevance: number; // 0-100
    authenticity: number; // 0-100
    communityValue: number; // 0-100
  };
  reasoning: string;
}

/**
 * Content analysis result from AI
 */
export interface ContentAnalysis {
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  topics: string[];
  targetAudience: string;
  engagementPrediction: "high" | "medium" | "low";
  keyInsights: string[];
  warnings: string[];
}

export interface SmartFilterResult {
  highQualityPosts: string[]; // Post IDs
  mediumQualityPosts: string[];
  lowQualityPosts: string[];
  spamPosts: string[];
  reasoning: string;
}
