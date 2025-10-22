/**
 * System prompts for Gemini AI scoring
 */

export const SCORE_POST_PROMPT = (
  content: string,
  hashtag: string,
  pubkey: string
) => `You are an expert at evaluating Nostr social media posts for quality and engagement potential.

Analyze this post and provide a detailed quality score.

POST CONTENT:
"${content}"

CONTEXT:
- Hashtag: #${hashtag}
- Author pubkey: ${pubkey}

EVALUATION CRITERIA (0-100 each):
1. Content Quality (25%): Grammar, clarity, coherence, writing quality
2. Engagement (25%): How interesting, thought-provoking, or discussion-worthy
3. Relevance (20%): How relevant to #${hashtag} and the topic
4. Authenticity (15%): Not spam, bot-generated, or overly promotional
5. Community Value (15%): Adds value to the Nostr community

Return ONLY valid JSON in this exact format:
{
  "overallScore": <0-100>,
  "breakdown": {
    "contentQuality": <0-100>,
    "engagement": <0-100>,
    "relevance": <0-100>,
    "authenticity": <0-100>,
    "communityValue": <0-100>
  },
  "reasoning": "<2-3 sentence explanation>"
}`;

export const ANALYZE_CONTENT_PROMPT = (
  content: string,
  hashtag: string
) => `You are an expert at analyzing social media content for Nostr.

Analyze this post deeply and provide insights.

POST CONTENT:
"${content}"

HASHTAG CONTEXT: #${hashtag}

Provide a comprehensive analysis including:
- Sentiment
- Main topics/themes
- Target audience
- Engagement prediction
- Key insights
- Any warnings (spam, offensive content, etc.)

Return ONLY valid JSON in this exact format:
{
  "sentiment": "<positive|negative|neutral|mixed>",
  "topics": ["<topic1>", "<topic2>", ...],
  "targetAudience": "<description of target audience>",
  "engagementPrediction": "<high|medium|low>",
  "keyInsights": ["<insight1>", "<insight2>", ...],
  "warnings": ["<warning1>", ...] // empty array if none
}`;

export const SMART_FILTER_PROMPT = (
  posts: Array<{ id: string; content: string; pubkey: string }>,
  hashtag: string
) => `You are an expert at filtering and ranking social media posts for quality.

Analyze these ${
  posts.length
} posts related to #${hashtag} and categorize them by quality.

POSTS:
${posts
  .map(
    (p, i) => `
${i + 1}. ID: ${p.id}
   Author: ${p.pubkey.substring(0, 16)}...
   Content: "${p.content}"
`
  )
  .join("\n")}

Categorize each post into:
- HIGH QUALITY: Excellent content, high engagement potential, valuable
- MEDIUM QUALITY: Good content, moderate engagement, acceptable
- LOW QUALITY: Poor quality, low engagement, but not spam
- SPAM: Bot-generated, promotional spam, or malicious

Return ONLY valid JSON in this exact format:
{
  "highQualityPosts": ["<id1>", "<id2>", ...],
  "mediumQualityPosts": ["<id1>", "<id2>", ...],
  "lowQualityPosts": ["<id1>", "<id2>", ...],
  "spamPosts": ["<id1>", "<id2>", ...],
  "reasoning": "<brief explanation of categorization>"
}`;
