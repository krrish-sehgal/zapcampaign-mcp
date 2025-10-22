# ZapCampaign MCP Server

> **Show how AI agents can autonomously reward Nostr posts using Bitcoin payments through MCP**

An MCP (Model Context Protocol) server that enables AI agents to create Bitcoin Lightning zap campaigns on Nostr. Allows autonomous discovery, filtering, and rewarding of Nostr posts with Bitcoin payments via the Lightning Network.

## 🎯 Features

### Free Tools

- **fetchPosts** - Fetch Nostr posts by hashtag with spam filtering
- **createCampaign** - Create zap campaigns for specific hashtags
- **simulateCampaign** - Preview campaigns before execution
- **executeCampaign** - Get instructions for sending zaps
- **sendZap** - Integration helper for Alby MCP payments

### Paid Tools (via PaidMCP)

- **scorePosts** - AI-powered post ranking by quality and relevance

## 🚀 Quick Start

### Installation

#### Option 1: Install from npm (Coming Soon)

```bash
npm install -g @getalby/zapcampaign-mcp
```

#### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/getalby/zapcampaign-mcp.git
cd zapcampaign-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Required for paid tools only
NWC_CONNECTION_STRING=nostr+walletconnect://...

# Optional: Custom Nostr relays
NOSTR_RELAYS=wss://relay.damus.io,wss://relay.nostr.band

# Optional: HTTP mode (default is STDIO)
# MODE=HTTP
# PORT=3000
```

## 📦 Setup with AI Agents

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zapcampaign": {
      "command": "npx",
      "args": ["-y", "@getalby/zapcampaign-mcp"],
      "env": {
        "NWC_CONNECTION_STRING": "nostr+walletconnect://..."
      }
    }
  }
}
```

### Goose CLI

```bash
goose configure
# Add extension -> Command Line Extension
# Command: npx -y @getalby/zapcampaign-mcp
# Add NWC_CONNECTION_STRING as environment variable
```

### Cline

Paste this into a Cline prompt:

```
Add the following to my MCP servers list:

"zapcampaign": {
  "command": "npx",
  "args": ["-y", "@getalby/zapcampaign-mcp"],
  "env": {
    "NWC_CONNECTION_STRING": "nostr+walletconnect://..."
  },
  "disabled": false,
  "autoApprove": []
}
```

## 💡 Usage Examples

### Basic Campaign

```
Create a zap campaign for #bitcoin posts.
Zap 10 sats to the top 5 posts.
```

The AI agent will:

1. Fetch posts with the #bitcoin hashtag
2. Filter out spam
3. Create a campaign
4. Show you which posts will be zapped
5. Provide instructions to execute the zaps

### AI-Powered Scoring (Paid)

```
Score the top 20 #bitcoinart posts by quality and originality
```

The AI agent will:

1. Fetch 20 posts with #bitcoinart
2. Use AI scoring to rank them (requires payment)
3. Show detailed scores and reasoning

### Complete Workflow

```
1. Fetch posts for #nostr with limit 30
2. Score them using AI
3. Create a campaign to zap the top 10 posts with 100 sats each
4. Simulate the campaign
5. Execute the campaign
```

## 🛠️ Available Tools

### fetchPosts

Fetch Nostr posts by hashtag with spam filtering.

**Parameters:**

- `hashtag` (string, required) - Hashtag to search for
- `limit` (number, optional) - Max posts to return (default: 20)
- `filterSpam` (boolean, optional) - Filter spam (default: true)

### createCampaign

Create a new zap campaign.

**Parameters:**

- `hashtag` (string, required) - Hashtag to target
- `satsPerPost` (number, required) - Sats to zap per post
- `postCount` (number, required) - Number of posts to zap

**Returns:** Campaign ID for use with simulate/execute

### simulateCampaign

Preview a campaign before execution.

**Parameters:**

- `campaignId` (string, required) - Campaign ID from createCampaign

### executeCampaign

Get instructions to execute zaps for a campaign.

**Parameters:**

- `campaignId` (string, required) - Campaign ID to execute

### sendZap

Helper tool for sending Lightning zaps. Integrates with Alby MCP.

**Parameters:**

- `pubkey` (string, required) - Recipient's public key
- `amount` (number, required) - Amount in satoshis
- `note` (string, optional) - Message with the zap

### scorePosts (Paid)

AI-powered post scoring and ranking.

**Parameters:**

- `hashtag` (string, required) - Hashtag to score
- `limit` (number, optional) - Max posts to score (default: 20)

**Cost:** ~0.5 sats per post scored

## 🏗️ Architecture

```
AI Agent (Claude / Goose / Cline)
↓
ZapCampaign MCP Server
├── Nostr Tools
│   ├── fetchPosts (free)
│   └── filterSpam (internal)
│
├── Campaign Tools
│   ├── createCampaign (free)
│   ├── simulateCampaign (free)
│   └── executeCampaign (free)
│
├── Payment Tools
│   └── sendZap (free - requires Alby MCP)
│
└── Scoring Tools (PaidMCP)
    └── scorePosts (paid)
↓
External Services
├── Nostr Relays
└── Alby MCP (for Lightning payments)
```

## 🔗 Integration with Alby MCP

ZapCampaign MCP works best with [Alby MCP](https://github.com/getalby/mcp) for executing Lightning payments. Install both:

```json
{
  "mcpServers": {
    "zapcampaign": {
      "command": "npx",
      "args": ["-y", "@getalby/zapcampaign-mcp"],
      "env": {
        "NWC_CONNECTION_STRING": "nostr+walletconnect://..."
      }
    },
    "alby": {
      "command": "npx",
      "args": ["-y", "@getalby/mcp"],
      "env": {
        "NWC_CONNECTION_STRING": "nostr+walletconnect://..."
      }
    }
  }
}
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Run locally
npm start

# Inspect tools
npm run inspect
```

## 📁 Project Structure

```
zapcampaign-mcp/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── utils/                # Shared utilities
│   │   ├── constants.ts      # Configuration constants
│   │   ├── nostr-pool.ts     # Nostr relay connection
│   │   └── formatting.ts     # Post formatting
│   └── tools/                # MCP tools
│       ├── nostr/            # Nostr interaction tools
│       │   ├── index.ts
│       │   ├── schemas.ts
│       │   └── nostr-functions.ts
│       ├── campaign/         # Campaign management tools
│       │   ├── index.ts
│       │   ├── schemas.ts
│       │   └── campaign-functions.ts
│       ├── payment/          # Lightning payment tools
│       │   ├── index.ts
│       │   └── schemas.ts
│       └── scoring/          # AI scoring (paid)
│           ├── index.ts
│           ├── schemas.ts
│           └── scoring-functions.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

Apache-2.0 - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [PaidMCP](https://github.com/getalby/paidmcp) for Bitcoin payments
- Uses [nostr-tools](https://github.com/nbd-wtf/nostr-tools) for Nostr protocol
- Integrates with [Alby MCP](https://github.com/getalby/mcp) for Lightning payments
- Inspired by the [Nostr MCP Server](https://github.com/AustinKelsay/nostr-mcp-server)

## 🐛 Troubleshooting

### No posts found

- Try a more popular hashtag
- Check your Nostr relay connections
- Verify relays are responding

### Paid tools not working

- Ensure `NWC_CONNECTION_STRING` is set
- Verify your NWC wallet has sufficient balance
- Check that the connection string is valid

### Integration with Alby MCP

- Make sure both MCP servers are configured
- Verify NWC connection strings are correct
- Check that your wallet supports NWC

## 📞 Support

For issues and questions:

- GitHub Issues: [Create an issue](https://github.com/getalby/zapcampaign-mcp/issues)
- Alby Support: [support.getalby.com](https://support.getalby.com)

---

Made with ⚡ by [Alby](https://getalby.com)
