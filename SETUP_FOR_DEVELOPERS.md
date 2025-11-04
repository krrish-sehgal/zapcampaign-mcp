# 🛠️ Setup Guide for MCP Server Operators

> **For developers who want to run ZapCampaign MCP server and earn sats from AI tool usage**

This guide is for people who want to:
- Run the ZapCampaign MCP server
- Earn micropayments (1-10 sats per AI request)
- Provide AI-powered Nostr content analysis services

---

## 📋 **Prerequisites**

- **Node.js** 18+ installed
- **Google Gemini API Key** (free tier available)
- **Alby Lightning Wallet** with Nostr Wallet Connect (NWC)
- **MCP-compatible AI client** (Goose Desktop or Claude Desktop)

---

## 🚀 **Installation**

### **Step 1: Clone and Build**

```bash
# Clone the repository
git clone https://github.com/krrish-sehgal/zapcampaign-mcp.git
cd zapcampaign-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### **Step 2: Get Your API Keys**

#### **A. Google Gemini API Key**

This powers the AI scoring, analysis, and filtering tools.

1. Go to: https://ai.google.dev
2. Click "Get API Key" → "Create API Key"
3. Copy the key (starts with `AIza...`)
4. **Free tier:** 15 requests/minute, 1,500 requests/day

#### **B. NWC Connection String**

This is how you receive payments from users.

1. Go to: https://getalby.com
2. Create account or login
3. Navigate to **Wallet** → **Nostr Wallet Connect**
4. Click **"Create Connection"**
5. Name it: `ZapCampaign MCP Server`
6. Permissions needed: **✅ Receive payments**
7. Copy the connection string (starts with `nostr+walletconnect://...`)

**💡 This wallet receives the 1-10 sat payments when users call your paid AI tools**

### **Step 3: Configure Environment**

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Required: Google Gemini API for AI tools
GOOGLE_GENERATIVE_AI_API_KEY=AIza...your_key_here

# Required: Your NWC wallet (receives payments)
NWC_CONNECTION_STRING=nostr+walletconnect://...your_connection

# Optional: Default Nostr relays
NOSTR_RELAYS=wss://relay.damus.io,wss://relay.nostr.band,wss://nos.lol,wss://relay.primal.net

# Optional: HTTP mode (default is STDIO for MCP)
# MODE=HTTP
# PORT=3000
```

---

## 🖥️ **Setup with AI Clients**

### **Option 1: Goose Desktop (Recommended)**

#### **Install Goose**

Download from: https://block.github.io/goose/

#### **Add ZapCampaign MCP**

1. Open Goose Desktop
2. Go to **Settings** → **Extensions** → **Add Extension**
3. Select **Command Line Extension**
4. Configure:

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

5. Click **Save**
6. Restart Goose Desktop

#### **Verify Installation**

Ask Goose:
```
List all available MCP tools
```

You should see 11 ZapCampaign tools listed.

---

### **Option 2: Claude Desktop**

#### **Configure Claude**

Edit your Claude Desktop config file:

**macOS/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "zapcampaign": {
      "command": "node",
      "args": ["/absolute/path/to/zapcampaign-mcp/build/index.js"],
      "env": {
        "GOOGLE_GENERATIVE_AI_API_KEY": "AIza...your_key",
        "NWC_CONNECTION_STRING": "nostr+walletconnect://...your_nwc"
      }
    }
  }
}
```

**⚠️ Replace** `/absolute/path/to/zapcampaign-mcp` with your actual path!

#### **Restart Claude**

Completely quit (Cmd+Q) and reopen Claude Desktop.

#### **Verify Installation**

Ask Claude:
```
What MCP tools do you have access to?
```

---

## 💰 **Payment Setup for Users**

Your users need **their own** payment setup to:
1. Pay you (1-10 sats per AI tool)
2. Pay Nostr creators (campaign zaps)

### **User Requirements:**

#### **For Goose Desktop Users:**

They need to install **Alby MCP** in Goose:

1. Settings → Extensions → Add Extension → Command Line
2. **Name:** `Alby MCP`
3. **Command:** `npx -y @getalby/mcp`
4. **Environment Variables:**
   ```
   NWC_CONNECTION_STRING=nostr+walletconnect://...their_wallet
   ```

#### **For Claude Desktop Users:**

They need to add Alby MCP to their `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zapcampaign": { ... },
    "alby": {
      "command": "npx",
      "args": ["-y", "@getalby/mcp"],
      "env": {
        "NWC_CONNECTION_STRING": "nostr+walletconnect://...their_wallet"
      }
    }
  }
}
```

---

## 🧪 **Testing Your Setup**

### **Test 1: Free Tools**

Ask your AI client:

```
Fetch 5 recent posts about #Bitcoin from Nostr
```

**Expected:** Should return 5 posts without requiring payment.

### **Test 2: Paid AI Tools**

Ask your AI client:

```
Score those 5 posts using AI quality analysis
```

**Expected flow:**
1. AI client calls `scorePosts` (paid tool)
2. ZapCampaign server requests 1 sat payment
3. AI client uses Alby MCP to pay you
4. Your NWC wallet receives 1 sat ✅
5. AI scoring executes with Gemini
6. Results returned

**Check your Alby wallet** - you should see a 1 sat incoming payment!

### **Test 3: Campaign Execution**

Ask your AI client:

```
Create a campaign to zap those 5 posts with 100 sats each
```

**Expected flow:**
1. Campaign created (free)
2. When executed, charges 1 sat fee to you
3. Prepares 5 Lightning invoices (500 sats total)
4. User pays each creator via Alby MCP

---

##  **Revenue Model**

### **Current Pricing (Testing Phase)**

- `scorePosts`: 1 sat per request (normally 10 sats)
- `analyzeContent`: 1 sat per request (normally 5 sats)
- `smartFilter`: 1 sat per request (normally 5 sats)
- `executeCampaign`: 1 sat per request (normally 10 sats)

### **Potential Earnings**

If 100 users each run:
- 10 scoring requests = 1,000 sats
- 5 content analyses = 500 sats
- 2 campaign executions = 200 sats

**Total:** 1,700 sats ≈ $0.68 USD (at $40k BTC)

Scale this to 1,000 active users = $6.80/day or ~$200/month

---

## 📊 **Monitoring**

### **Check Server Status**

```bash
# View logs
npm run dev

# Or use systemd/pm2 for production
pm2 start build/index.js --name zapcampaign-mcp
pm2 logs zapcampaign-mcp
```

### **Monitor Payments**

Check your Alby wallet dashboard:
- https://getalby.com/wallet

You'll see incoming payments each time a user calls a paid tool.

---

## 🔧 **Advanced Configuration**

### **Custom Nostr Relays**

Edit `.env`:

```bash
NOSTR_RELAYS=wss://your-relay.com,wss://another-relay.com
```

### **HTTP Mode (Non-MCP)**

If you want to run as a standalone HTTP server:

```bash
# In .env
MODE=HTTP
PORT=3000

# Start server
npm run dev
```

Access at: http://localhost:3000

---

## 🆘 **Support**

- **Issues:** https://github.com/krrish-sehgal/zapcampaign-mcp/issues
- **Creator:** [linktr.ee/krrishsehgal](https://linktr.ee/krrishsehgal)
