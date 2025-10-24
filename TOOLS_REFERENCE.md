# ZapCampaign MCP - Tools Reference

> **Complete API Reference for All 11 Tools**

This document provides detailed specifications for all FREE and PAID tools in ZapCampaign MCP.

---

## 📋 **Tools Overview**

- **7 FREE Tools**: No payment required
- **4 PAID Tools**: AI-powered with Google Gemini (1 sat per request during testing)

---

## 🆓 **FREE TOOLS**

### **1. fetchPosts**

Fetch Nostr posts by hashtag from relays.

**Input:**
- `hashtag` (string, required): The hashtag to search (without #)
- `limit` (number, optional): Number of posts to fetch (1-100, default: 10)
- `since` (number, optional): Unix timestamp for recent posts

**Output:**
- Array of posts with:
  - `id`: Post event ID
  - `content`: Post text content
  - `author`: Author's pubkey
  - `created_at`: Unix timestamp
  - `reactions`: Number of reactions
  - `zaps`: Number of zaps received
  - `replies`: Number of replies
  - Additional metadata

**Trigger Phrases:**
- "fetch posts about..."
- "get recent posts for #..."
- "search for hashtag..."

**Example:**
```
Fetch 20 posts about #Bitcoin from the last 24 hours
```

---

### **2. filterSpam**

Basic heuristic spam filtering for posts.

**Input:**
- `posts` (array, required): Array of posts from fetchPosts

**Output:**
- Filtered array of posts with spam removed

**Filtering Criteria:**
- Very short content (< 10 characters)
- Excessive emojis
- Repeated characters
- Common spam patterns
- URL-only posts

**Triggers:**
- "filter spam"
- "remove spam posts"
- "clean up the results"

**Example:**
```
Fetch posts about #Nostr and filter out spam
```

---

### **3. createCampaign**

Create a zap campaign configuration.

**Input:**
- `hashtag` (string, required): Target hashtag
- `zapAmount` (number, required): Sats per post
- `maxPosts` (number, required): Maximum posts to zap
- `criteria` (object, optional): Quality thresholds
  - `minScore`: Minimum quality score (0-100)
  - `minReactions`: Minimum reactions required
  - `minZaps`: Minimum existing zaps

**Output:**
- Campaign object with:
  - `campaignId`: Unique identifier
  - `hashtag`: Target hashtag
  - `zapAmount`: Sats per post
  - `maxPosts`: Max posts
  - `criteria`: Quality criteria
  - `status`: "created"
  - `createdAt`: Timestamp

**Triggers:**
- "create a campaign"
- "set up zap campaign"
- "reward posts with..."

**Example:**
```
Create a campaign for #BitcoinBuilder hashtag, 
zap 200 sats per post, max 10 posts, 
only posts with score above 80
```

---

### **4. updateCampaign**

Modify existing campaign before execution.

**Input:**
- `campaignId` (string, required): ID from createCampaign
- `updates` (object, required): Fields to update
  - `zapAmount`: New sats per post
  - `maxPosts`: New max posts
  - `criteria`: Updated quality thresholds

**Output:**
- Updated campaign object

**Example:**
```
Update campaign ABC123 to zap 300 sats per post instead
```

---

### **5. deleteCampaign**

Remove campaign from storage.

**Input:**
- `campaignId` (string, required): Campaign to delete

**Output:**
- Confirmation message
- Deleted campaign details

**Example:**
```
Delete campaign ABC123
```

---

### **6. simulateCampaign**

Preview campaign without spending sats.

**Input:**
- `campaignId` (string, required): Campaign to simulate

**Output:**
- List of posts that would be zapped
- Total cost calculation
- Warning messages if any
- Post details (author, content preview, scores)

**Triggers:**
- "simulate campaign"
- "preview before execution"
- "show me what will happen"

**Example:**
```
Simulate campaign ABC123 to see which posts will be zapped
```

---

### **7. prepareZap**

Prepare Lightning zap payment details.

**Input:**
- `postId` (string, required): Nostr post event ID
- `amount` (number, required): Sats to zap
- `relays` (array, optional): Relay hints for the zap
- `comment` (string, optional): Message with the zap

**Output:**
- Lightning invoice or payment request
- NIP-57 zap request details
- Payment instructions

**Example:**
```
Prepare a 500 sat zap for post note1abc...xyz
```

---

## 💰 **PAID TOOLS (AI-Powered with Google Gemini)**

### **💰 1. scorePosts** (1 sat per request)

AI quality scoring with detailed breakdowns.

**Input:**
- `posts` (array, required): Array of posts to score (max 20)
- `hashtag` (string, required): Context for relevance scoring

**Output:**
```json
{
  "scores": [
    {
      "id": "post_id",
      "totalScore": 85,
      "breakdown": {
        "contentQuality": 90,
        "engagement": 80,
        "relevance": 85,
        "authenticity": 85,
        "communityValue": 85
      },
      "reasoning": "High-quality technical content with clear explanations and practical examples. Shows deep understanding of Bitcoin technology."
    }
  ]
}
```

**Scoring Criteria:**
- **Content Quality** (0-100): Writing quality, clarity, originality
- **Engagement** (0-100): Reactions, replies, zaps potential
- **Relevance** (0-100): Match to hashtag topic
- **Authenticity** (0-100): Genuine vs spam/promotional
- **Community Value** (0-100): Educational, helpful, insightful

**Trigger Phrases:**
- "score these posts"
- "rate post quality"
- "evaluate posts"
- "rank posts by quality"

**Cost:** 1 sat (testing), normally 10 sats  
**Max:** 20 posts per request

**Example:**
```
Fetch 15 posts about #Bitcoin and score them by quality
```

---

### **💰 2. analyzeContent** (1 sat per request)

Deep content analysis with sentiment and insights.

**Input:**
- `posts` (array, required): Array of posts to analyze (max 10)

**Output:**
```json
{
  "analyses": [
    {
      "id": "post_id",
      "sentiment": "positive",
      "sentimentScore": 0.85,
      "topics": ["Bitcoin", "Lightning Network", "Scaling Solutions"],
      "targetAudience": "Bitcoin developers and technical enthusiasts",
      "engagementPrediction": "high",
      "keyInsights": [
        "Technical depth appeals to developer community",
        "Clear explanations make complex topics accessible",
        "Community impact: advances Lightning adoption"
      ],
      "warnings": []
    }
  ]
}
```

**Analysis Components:**
- **Sentiment**: positive, negative, neutral, mixed
- **Sentiment Score**: -1.0 (very negative) to +1.0 (very positive)
- **Topics**: Extracted key topics and themes
- **Target Audience**: Intended audience demographics
- **Engagement Prediction**: high, medium, low
- **Key Insights**: Important observations
- **Warnings**: Red flags (spam, controversial, etc.)

**Trigger Phrases:**
- "analyze content"
- "what's the sentiment?"
- "what topics are covered?"
- "who is the target audience?"

**Cost:** 1 sat (testing), normally 5 sats  
**Max:** 10 posts per request

**Example:**
```
Analyze the sentiment and topics of these #Nostr posts
```

---

### **💰 3. smartFilter** (1 sat per request)

AI batch categorization into quality tiers.

**Input:**
- `posts` (array, required): Array of posts to categorize (max 50)

**Output:**
```json
{
  "categorized": {
    "high": ["post_id_1", "post_id_2"],
    "medium": ["post_id_3", "post_id_4"],
    "low": ["post_id_5"],
    "spam": ["post_id_6"]
  },
  "summary": {
    "total": 6,
    "high": 2,
    "medium": 2,
    "low": 1,
    "spam": 1
  }
}
```

**Quality Tiers:**
- **High**: Exceptional quality, original insights, high engagement potential
- **Medium**: Good quality, relevant content, moderate engagement
- **Low**: Basic content, minimal value, low engagement
- **Spam**: Promotional, repetitive, irrelevant, or malicious

**Advantages over Rule-Based Filtering:**
- Understands context and nuance
- Catches subtle spam (fake engagement bait)
- Identifies low-effort content (generic replies)
- Better at detecting promotional content disguised as helpful

**Trigger Phrases:**
- "filter posts by quality"
- "categorize these posts"
- "find the best posts"
- "sort by quality"

**Cost:** 1 sat (testing), normally 5 sats  
**Max:** 50 posts per request

**Example:**
```
Fetch 50 #Bitcoin posts and categorize them into quality tiers, 
show me only the high-quality ones
```

---

### **💰 4. executeCampaign** (1 sat per request)

Prepare Lightning invoices for campaign execution.

**Input:**
- `campaignId` (string, required): Campaign to execute

**Output:**
- Array of Lightning invoices for each post
- Payment instructions for each creator
- Total cost breakdown:
  - Execution fee: 1 sat (paid to ZapCampaign)
  - Campaign cost: N sats (paid to creators)
  - Total: N + 1 sats

**Why This Tool is Paid:**
- **Prevents Abuse**: Stops spam campaign creation
- **Infrastructure Validation**: Validates all Lightning addresses
- **NIP-57 Compliance**: Creates proper Nostr zap requests
- **Quality Assurance**: Ensures campaign integrity before execution

**Execution Flow:**
1. Validates campaign exists and is ready
2. Charges 1 sat execution fee
3. Fetches Lightning addresses for all post authors
4. Validates each Lightning address
5. Creates NIP-57 zap requests
6. Generates payment invoices
7. Returns instructions for Alby MCP to execute

**Cost:** 1 sat (testing), normally 10 sats  
**No limit** on campaign size

**Example:**
```
Execute campaign ABC123 to zap all selected posts
```

---

**Created by Krrish Sehgal**  
Contact: [linktr.ee/krrishsehgal](https://linktr.ee/krrishsehgal)
