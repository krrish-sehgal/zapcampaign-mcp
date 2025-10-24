# ZapCampaign MCP Server

> **AI-Powered Bitcoin Lightning Zap Campaigns for Nostr - Reward Quality Content Automatically**

An advanced MCP (Model Context Protocol) server that enables AI agents to discover, analyze, and reward high-quality Nostr content with Bitcoin Lightning zaps. Features AI-powered content scoring, smart filtering, sentiment analysis, and automated campaign management.

Perfect for companies running hashtag campaigns or creators who want to support quality content efficiently.

---

## 🎥 **Learn More**

- **📺 Video Demo**: [Watch on YouTube](https://www.youtube.com/watch?v=ZW4Dq6avH-4)
- **📝 Blog Post**: [Read on Medium - Automating the Value-for-Value Economy](https://medium.com/@krrishsehgal03/automating-the-value-for-value-economy-46a03d8e5aee)

---

## ⚡ **Quick Start Requirements**

**To Use ZapCampaign MCP:**
- 🖥️ **Goose Desktop** (or any MCP client)
- 🔑 **Google Gemini API Key** (free tier available) - Get paid 1 sat per AI call
- 💰 **Your Alby/Lightning Wallet + NWC** - Receive payments for AI tools
- 💰 **User's Alby MCP + Funded Wallet** - Pay for tools + send campaign zaps

**Payment Flow:**
- Users pay **YOU** 1 sat per AI tool → Your NWC wallet
- Users pay **Nostr creators** via campaigns → Creator's Lightning addresses
- Powered by **Alby MCP** for all Bitcoin payments

👉 **[Jump to Complete Setup Guide](#-goose-desktop-recommended---complete-setup-guide)**

---

## 🌟 **Why ZapCampaign MCP?**

**The Problem:** You want to reward quality Nostr posts with zaps, but manually reviewing hundreds of posts takes hours and you risk wasting sats on spam or low-quality content.

**The Solution:** Let AI agents handle it! ZapCampaign MCP uses Google Gemini AI to:
- 🎯 Score posts for quality (0-100) with detailed breakdowns
- 🔍 Analyze content sentiment, topics, and target audiences  
- 🤖 Smart filter posts into high/medium/low/spam categories
- ⚡ Execute zap campaigns with Lightning payments

**Use Case:** Perfect for companies running branded hashtags who want to reward early adopters and quality creators without manual review.

---

## 🎯 **Features**

### **FREE Tools (7 tools)**

- ✅ **fetchPosts** - Fetch Nostr posts by hashtag from relays
- ✅ **filterSpam** - Basic heuristic spam filtering
- ✅ **createCampaign** - Create zap campaign configurations
- ✅ **updateCampaign** - Modify campaign before execution
- ✅ **deleteCampaign** - Remove campaigns from storage
- ✅ **simulateCampaign** - Preview campaigns before spending sats
- ✅ **prepareZap** - Prepare Lightning zap payment details

### **PAID Tools (4 tools) - Currently 1 sat each!**

- 💰 **scorePosts** (10 sats normally, **1 sat now**) - AI-powered quality scoring with Gemini
  - Scores 0-100 with detailed breakdowns
  - Content quality, engagement, relevance, authenticity, community value
  - Reasoning for each score
  - Max 20 posts per request

- 💰 **analyzeContent** (5 sats normally, **1 sat now**) - Deep content analysis
  - Sentiment detection (positive/negative/neutral/mixed)
  - Topic extraction
  - Target audience identification
  - Engagement predictions
  - Key insights and warnings
  - Max 10 posts per request

- 💰 **smartFilter** (5 sats normally, **1 sat now**) - AI batch categorization
  - Sorts posts into high/medium/low/spam
  - Better than rule-based filters
  - Catches subtle spam and low-effort content
  - Max 50 posts per request

- 💰 **executeCampaign** (10 sats normally, **1 sat now**) - Execute zap campaigns
  - Prepares Lightning invoices for all selected posts
  - Validates Lightning addresses
  - Creates NIP-57 zap requests
  - Prevents abuse of zap system

**Note:** Special testing pricing at 1 sat per request. Normal prices are 5-10 sats.

---

## � **Why PaidMCP adds value.**

PaidMCP enables **micropayment monetization** for AI tools, creating a sustainable ecosystem:

**For Tool Creators (You):**
- ✅ Earn 1-10 sats per AI request
- ✅ No subscription hassles - pay-per-use model
- ✅ Built-in payment infrastructure via Lightning Network
- ✅ Focus on building tools, not payment systems

**For Users:**
- ✅ Only pay for what you use (1 sat = ~$0.0004 USD)
- ✅ No monthly subscriptions or commitment
- ✅ Access premium AI features on-demand
- ✅ Transparent pricing - know the cost upfront

**The Economics:**
- AI cost: 4 sats (~$0.0016) for complete campaign analysis
- Traditional approach: 3 hours of manual work
- **ROI: 93,750x in time savings**

PaidMCP makes AI tools economically viable at micro-scale while keeping costs negligible for users.

---

#### **Payment Flow Summary**

```
User asks AI to score posts
         ↓
Goose calls scorePosts (ZapCampaign MCP)
         ↓
ZapCampaign says: "1 sat please" (Alby's PaidMCP at play here)
         ↓
Goose uses Alby PAID MCP to create invoice for the tools
         ↓
Alby Payments MCP sends 1 sat from user's wallet
         ↓
User's Lightning wallet receives 1 sat ✅
         ↓
Gemini API scores the posts
         ↓
Results returned to user
```

## �� **Quick Start**

### **Installation**

#### Option 1: Install from Source

```bash
# Clone the repository
git clone https://github.com/krrish-sehgal/zapcampaign-mcp.git
cd zapcampaign-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### **Configuration**

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Configure your environment variables:

```bash
# Required for paid AI tools (Google Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Required for executing campaigns (Nostr Wallet Connect)
NWC_CONNECTION_STRING=nostr+walletconnect://...

# Nostr relays (comma-separated)
NOSTR_RELAYS=wss://relay.damus.io,wss://relay.nostr.band,wss://nos.lol

# Optional: HTTP mode (default is STDIO)
# MODE=HTTP
# PORT=3000
```

### **Get Your API Keys**

1. **Google Gemini API Key** (Free tier available):
   - Go to: https://ai.google.dev
   - Create a new API key
   - Copy to `.env` as `GOOGLE_GENERATIVE_AI_API_KEY`

2. **NWC Connection String** (For zap execution):
   - Go to: https://getalby.com
   - Create/login to wallet
   - Enable Nostr Wallet Connect
   - Copy connection string to `.env` as `NWC_CONNECTION_STRING`

---

## 📦 **Setup with AI Agents**

### **🚀 Goose Desktop (Recommended) - Complete Setup Guide**

Follow these steps to get ZapCampaign MCP running with Goose Desktop:

#### **Step 1: Install Goose Desktop**

Download and install Goose from: https://block.github.io/goose/

#### **Step 2: Build ZapCampaign MCP**

```bash
cd /path/to/zapcampaign-mcp
npm install
npm run build
```

#### **Step 3: Get Your API Keys**

**A. Google Gemini API Key** (For AI tools - scorePosts, analyzeContent, smartFilter)

1. Go to: https://ai.google.dev
2. Click "Get API Key" → "Create API Key"
3. Copy the key (starts with `AIza...`)
4. **This key is for receiving payments** - when users call paid AI tools, the 1 sat goes to your NWC wallet

**B. NWC Connection String** (For receiving payments from AI agents)

1. Go to: https://getalby.com
2. Create account or login
3. Go to "Wallet" → "Nostr Wallet Connect"
4. Click "Create Connection"
5. Give permissions: **Receive payments** (this is how you get paid for AI tools)
6. Copy the connection string (starts with `nostr+walletconnect://...`)
7. **This wallet receives the 1 sat payments** when AI agents use your paid tools

#### **Step 4: Configure Goose Desktop**

Open Goose Desktop and add ZapCampaign MCP:

1. Click **Settings** → **Extensions** → **Add Extension**
2. Select **Command Line Extension**
3. Fill in the details:

**Name:** `ZapCampaign MCP`

**Command:** 
```bash
node /absolute/path/to/zapcampaign-mcp/build/index.js
```
*(Replace with your actual path)*

**Environment Variables:**
```
GOOGLE_GENERATIVE_AI_API_KEY=AIza...your_gemini_key
NWC_CONNECTION_STRING=nostr+walletconnect://...your_nwc_string
```

4. Click **Save**

#### **Step 5: Install Alby MCP (REQUIRED for Campaign Payments)**

**⚠️ CRITICAL:** Users need Alby MCP to:
- Pay **you** (1 sat per AI tool call)
- Pay **Nostr creators** (zap campaigns)

Add Alby MCP to Goose:

1. In Goose Settings → **Extensions** → **Add Extension**
2. Select **Command Line Extension**
3. Fill in:

**Name:** `Alby MCP - Bitcoin Payments`

**Command:**
```bash
npx -y @getalby/mcp
```

**Environment Variables:**
```
NWC_CONNECTION_STRING=nostr+walletconnect://...user_wallet
```

**Note:** Users need their OWN Alby wallet for SENDING payments:
- **Your NWC** (ZapCampaign) = Receives 1 sat from AI tool calls
- **User's NWC** (Alby MCP) = Sends payments for campaigns + pays you

#### **Step 6: Verify Setup**

Restart Goose Desktop and test:

```
Hey Goose, list all available MCP tools
```

You should see:
- ✅ **ZapCampaign MCP**: 11 tools (fetchPosts, scorePosts, analyzeContent, etc.)
- ✅ **Alby MCP**: Payment tools (makeInvoice, payInvoice, etc.)

#### **Step 7: Test Payment Flow**

Try this command to verify everything works:

```
Fetch 5 posts about #Bitcoin, then score them with AI
```

**Expected flow:**
1. fetchPosts (FREE) ✅
2. scorePosts (PAID - 1 sat) 💰
   - Goose uses Alby MCP to pay YOU 1 sat
   - Your NWC wallet receives the payment
   - AI scoring executes with Gemini API

#### **Campaign Execution Flow**

```
User creates campaign to zap 10 posts × 100 sats
         ↓
Goose calls executeCampaign (ZapCampaign MCP)
         ↓
ZapCampaign charges 1 sat for execution fee
         ↓
Goose uses Alby MCP to pay YOU 1 sat
         ↓
ZapCampaign prepares 10 Lightning invoices
         ↓
Goose uses Alby MCP to pay each Nostr creator
         ↓
10 creators receive 100 sats each (1,000 sats total)
         ↓
You received 1(or more) sat execution fee ✅
```


## 🤝 **Contributing**

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **License**

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 **Created By**

**Krrish Sehgal**  
Contact: [linktr.ee/krrishsehgal](https://linktr.ee/krrishsehgal)

**⚡ Reward quality content efficiently with AI-powered zap campaigns!**
