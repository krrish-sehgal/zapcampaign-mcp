# 📖 User Guide: Running Bitcoin Zap Campaigns with AI

> **For companies, brands, and creators who want to reward quality Nostr content automatically**

This guide shows you how to use ZapCampaign MCP to run AI-powered Bitcoin Lightning zap campaigns on Nostr - no manual post review required!

---

## 🎯 **Who is This For?**

- **Brands** running hashtag campaigns (#YourBrand)
- **Companies** wanting to reward early adopters
- **DAOs** incentivizing community contributions
- **Creators** supporting quality content in their niche
- **Event organizers** rewarding conference attendees (#EventName)

---

## ⚡ **What You'll Need**

1. **Goose Desktop or Claude Desktop** (AI agent with MCP support)
2. **Alby Lightning Wallet** (funded with sats)
3. **Alby MCP installed** (for Bitcoin payments)
4. **Access to ZapCampaign MCP server** (costs 1-10 sats per AI request)

---

## 🚀 **Quick Start**

### **Step 1: Install Goose Desktop**

Download from: https://block.github.io/goose/

### **Step 2: Set Up Your Alby Wallet**

1. Go to: https://getalby.com
2. Create a wallet or login
3. **Fund your wallet** with at least 5,000 sats to start
   - Campaign costs: Post count × zap amount
   - AI tool costs: ~4-10 sats per campaign
   - Example: 10 posts × 100 sats = 1,000 sats + 4 sats AI = 1,004 sats

4. Create NWC connection:
   - Go to **Wallet** → **Nostr Wallet Connect**
   - Click **"Create Connection"**
   - Name: `Goose AI Agent`
   - Permissions: **✅ Send payments, ✅ Make invoices**
   - Copy the connection string

### **Step 3: Install Alby MCP in Goose**

1. Open Goose Desktop
2. Go to **Settings** → **Extensions** → **Add Extension**
3. Select **Command Line Extension**
4. Configure:

**Name:** `Alby MCP - Bitcoin Payments`

**Command:**
```bash
npx -y @getalby/mcp
```

**Environment Variables:**
```
NWC_CONNECTION_STRING=nostr+walletconnect://...your_connection_string
```

5. Click **Save**
6. Restart Goose

### **Step 4: Connect to ZapCampaign MCP**

Ask your Goose AI agent operator or ZapCampaign MCP provider for:
- Their MCP server endpoint
- Current pricing (typically 1-10 sats per AI tool)

The server operator will have already configured ZapCampaign MCP in their Goose instance.

---

## 🎨 **Running Your First Campaign**

### **Scenario: You're a Bitcoin company launching a new product**

You want to reward the first 20 people who post about your launch using `#YourProduct`.

#### **Step 1: Discover Posts**

Ask Goose:

```
Fetch 50 recent posts about #YourProduct from Nostr
```

**Cost:** FREE (uses `fetchPosts` tool)

**Result:** You get 50 raw posts with author info, content, timestamps.

---

#### **Step 2: Filter Out Spam (Optional)**

Ask Goose:

```
Filter those 50 posts to remove obvious spam
```

**Cost:** FREE (uses `filterSpam` heuristic tool)

**Result:** Removes:
- Posts with excessive emoji (>30%)
- Too many hashtags (>5)
- Repeated characters (!!!!, aaaa)
- All caps text

---

#### **Step 3: AI Quality Scoring** ⚡ PAID

Now use AI to score the remaining posts for quality:

```
Score these posts using AI quality analysis
```

**Cost:** 1 sat (testing price, normally 10 sats)

**What AI Analyzes:**
- **Content quality** (0-100): Originality, depth, value
- **Engagement potential** (0-100): Likely to get interactions
- **Relevance** (0-100): How well it matches your campaign
- **Authenticity** (0-100): Real person vs bot/spam
- **Community value** (0-100): Helpful to others

**Result:**
```
Post 1: 87/100 - High quality product review with screenshots
Post 2: 45/100 - Generic "cool product" comment
Post 3: 92/100 - Detailed use case and benefits explanation
...
```

**💡 Why this matters:** Manually reviewing 50 posts takes 30+ minutes. AI does it in 5 seconds.

---

#### **Step 4: Smart Filtering** ⚡ PAID

Let AI categorize posts automatically:

```
Use smart AI filtering to categorize these posts
```

**Cost:** 1 sat (testing price, normally 5 sats)

**AI sorts into:**
- **High Quality**: Detailed, original, valuable (zap these!)
- **Medium Quality**: Decent but basic (maybe zap smaller amounts)
- **Low Quality**: Minimal effort, generic
- **Spam**: Bots, abuse, irrelevant

**Result:**
```
High Quality (8 posts): [list]
Medium Quality (22 posts): [list]
Low Quality (15 posts): [list]
Spam (5 posts): [list]
```

---

#### **Step 5: Deep Content Analysis** ⚡ PAID (Optional)

For high-value campaigns, get detailed insights:

```
Analyze the sentiment and topics of the top 10 posts
```

**Cost:** 1 sat (testing price, normally 5 sats)

**AI provides:**
- **Sentiment**: Positive, negative, neutral, mixed
- **Topics**: Main themes discussed
- **Target audience**: Who this resonates with
- **Engagement predictions**: Expected reach
- **Key insights**: What makes it valuable

**Example output:**
```
Post 1:
- Sentiment: Very positive
- Topics: User experience, ease of setup, Lightning speed
- Audience: Bitcoin beginners, mobile users
- Engagement: High (personal story, relatable)
- Insight: Authentic first-time user experience
```

---

#### **Step 6: Create Campaign**

Now create your zap campaign:

```
Create a campaign to zap the top 20 high-quality posts 
with 100 sats each. Name it "Product Launch Rewards"
```

**Cost:** FREE (uses `createCampaign` tool)

**Campaign details:**
- Name: "Product Launch Rewards"
- Posts: 20 selected posts
- Amount: 100 sats per post
- Total budget: 2,000 sats
- Status: Draft (not executed yet)

---

#### **Step 7: Preview Campaign**

Before spending sats, simulate:

```
Simulate the "Product Launch Rewards" campaign
```

**Cost:** FREE (uses `simulateCampaign` tool)

**Preview shows:**
- ✅ 18 posts have valid Lightning addresses
- ❌ 2 posts missing Lightning addresses (will skip)
- Total sats to send: 1,800 sats (18 × 100)
- Estimated fees: ~1 sat per payment
- Grand total: ~1,818 sats

---

#### **Step 8: Execute Campaign** ⚡ PAID

Ready to send zaps? Execute:

```
Execute the "Product Launch Rewards" campaign
```

**Cost:** 1 sat execution fee (testing price, normally 10 sats)

**What happens:**
1. ZapCampaign prepares 18 Lightning invoices
2. Creates NIP-57 zap requests for each post
3. Goose uses Alby MCP to pay each creator
4. 18 creators receive 100 sats each instantly ⚡
5. Zaps appear as comments on the original Nostr posts

**Result:**
```
✅ Campaign executed successfully!
- Sent: 1,800 sats to 18 creators
- Skipped: 2 posts (no Lightning address)
- Total cost: 1,801 sats (1,800 + 1 fee)
- Execution time: 45 seconds
```

---

## 🧠 **Why AI Makes This Better**

### **The Problem Without AI:**

Imagine manually reviewing 50 posts:
1. Read each post carefully (30 seconds/post)
2. Evaluate quality subjectively
3. Check for spam patterns
4. Decide zap amounts
5. Risk missing good content or rewarding spam

**Time:** 25+ minutes per campaign  
**Accuracy:** Subjective, inconsistent, tiring

### **With AI:**

1. AI reads all 50 posts in 5 seconds
2. Scores objectively on multiple dimensions
3. Detects subtle spam patterns humans miss
4. Consistent quality standards
5. Catches high-quality content you might overlook

**Time:** 30 seconds per campaign  
**Accuracy:** Consistent, data-driven, learns patterns

**ROI:** 50x time savings, better outcomes

---

## 📊 **Can You Trust AI to Pick Good Posts?**

### **How AI Scoring Works:**

ZapCampaign uses **Google Gemini 1.5 Flash**, trained on billions of text examples. For each post, it evaluates:

**1. Content Quality (0-100)**
- Originality vs copying
- Depth of information
- Value added to conversation
- Grammar and clarity

**2. Engagement Potential (0-100)**
- Likely to get replies/likes
- Shareability factor
- Emotional resonance
- Call-to-action effectiveness

**3. Relevance (0-100)**
- Matches campaign hashtag intent
- On-topic vs tangential
- Target audience fit

**4. Authenticity (0-100)**
- Human vs bot patterns
- Genuine voice vs promotional
- Account history indicators
- Engagement authenticity

**5. Community Value (0-100)**
- Helpful to others
- Advances discussion
- Educational content
- Positive contribution

### **Real Example:**

**Post A:** "Just bought #YourProduct! It's amazing! 🚀🚀🚀 #Bitcoin #Lightning #BTC #Crypto #Web3"

**AI Score:** 35/100
- Content quality: Low (no details)
- Engagement: Low (generic)
- Relevance: Medium (has hashtag)
- Authenticity: Low (excessive hashtags, spam patterns)
- Community value: Low (no useful info)

---

**Post B:** "Spent the weekend testing #YourProduct. The Lightning integration is seamless - went from setup to first payment in under 2 minutes. The UX for non-technical users is impressive. One suggestion: add a transaction history export feature for accounting."

**AI Score:** 89/100
- Content quality: High (specific details, constructive)
- Engagement: High (relatable experience)
- Relevance: Very high (detailed product usage)
- Authenticity: Very high (genuine user voice)
- Community value: High (helpful review + suggestion)

### **AI Accuracy:**

Based on testing:
- **High scores (80-100):** 95% are genuinely quality posts
- **Medium scores (50-79):** 80% are decent but unremarkable
- **Low scores (30-49):** 90% are spam or low-effort
- **Very low (<30):** 99% are spam/bots

**You can still review AI picks!** Use `simulateCampaign` to preview before executing.

---

## 💰 **Campaign Economics**

### **Cost Breakdown:**

For a typical campaign (50 posts analyzed, 20 zapped):

| Item | Cost |
|------|------|
| Fetch posts | FREE |
| Basic spam filter | FREE |
| AI scoring (50 posts) | 1 sat |
| Smart filtering | 1 sat |
| Content analysis (optional) | 1 sat |
| Campaign creation | FREE |
| Campaign simulation | FREE |
| Campaign execution | 1 sat |
| Zaps (20 × 100 sats) | 2,000 sats |
| **Total** | **2,004 sats ≈ $0.80** |

### **Value Comparison:**

**Traditional approach:**
- Manual review: 30 minutes
- Your time value: $30/hour
- Cost: $15 in time

**With ZapCampaign:**
- Automated: 2 minutes
- AI tools: $0.0016 (4 sats)
- Savings: $14.998 per campaign

**For companies running daily campaigns:** ~$450/month saved in time

---

## 🎯 **Advanced Use Cases**

### **1. Tiered Reward System**

```
Create three campaigns:
- "Gold Tier": Top 5 posts (90+ score) × 500 sats
- "Silver Tier": Next 15 posts (75-89 score) × 200 sats  
- "Bronze Tier": Next 30 posts (60-74 score) × 50 sats
```

**Result:** Rewards quality proportionally, maximizes ROI

---

### **2. Ongoing Community Support**

```
Every Monday:
1. Fetch 100 posts about #BitcoinEducation from last week
2. Score with AI
3. Zap top 20 educational posts with 250 sats each
```

**Result:** Automated weekly creator rewards, builds community loyalty

---

### **3. Event Coverage Rewards**

```
During #BitcoinConf2025:
1. Fetch posts with conference hashtag every 2 hours
2. Filter and score in real-time
3. Auto-zap quality posts within 30 minutes
```

**Result:** Instant gratification for attendees, viral social proof

---

### **4. Contest Management**

```
For #YourProductReview contest:
1. Collect all entries over 2 weeks
2. AI scores for quality and creativity
3. Top 10 get prizes: 1st (10,000 sats), 2nd (5,000 sats), etc.
```

**Result:** Objective judging, transparent criteria, fast results

---

## 🛡️ **Safety Features**

### **Prevents Over-Spending:**

- Preview campaigns before execution
- Set per-post limits
- Validate Lightning addresses before sending
- Skip invalid recipients automatically

### **Spam Protection:**

- Multi-layer filtering (heuristic + AI)
- Detects subtle spam patterns
- Flags suspicious accounts
- Learns from Nostr community standards

### **Budget Control:**

```
Set a maximum budget:
"Create campaign to zap high-quality posts, 
max budget 5,000 sats total"
```

AI will automatically select the best posts that fit within budget.

---

## 📱 **Example Workflows**

### **For Brands: Product Launch**

```
1. "Fetch 100 posts about #OurProduct"
2. "Score them with AI and show me the top 20"
3. "Analyze sentiment of the top posts"
4. "Create campaign to zap top 15 positive posts with 200 sats each"
5. "Simulate the campaign"
6. "Execute it"
```

**Time:** 3 minutes  
**Result:** 15 quality posts rewarded, positive brand association

---

### **For Creators: Supporting Peers**

```
1. "Fetch 50 recent #BitcoinArt posts"
2. "Score them and filter to high quality only"
3. "Create campaign to zap top 10 with 100 sats each"
4. "Execute it"
```

**Time:** 2 minutes  
**Result:** Support fellow artists, build community goodwill

---

### **For DAOs: Governance Participation**

```
1. "Fetch all posts about #DAOProposal42"
2. "Analyze the sentiment and topics"
3. "Create campaign to zap thoughtful discussion posts with 50 sats each"
4. "Execute it"
```

**Time:** 2 minutes  
**Result:** Incentivize quality governance participation

---

## 📞 **Support**

- **Issues:** https://github.com/krrish-sehgal/zapcampaign-mcp/issues
- **Creator:** [linktr.ee/krrishsehgal](https://linktr.ee/krrishsehgal)
- **Documentation:** See [README.md](./README.md)
