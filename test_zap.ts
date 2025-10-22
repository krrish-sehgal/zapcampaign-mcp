import { nip19 } from "nostr-tools";
import { prepareZapPayment } from "./build/tools/payment/send_zap.js";

// Test configuration
const TEST_NPUB = "npub1ld54kyg0yf627j8q23kgl80ld0h2mn3rqqpv6w3r0txed476e5vs3m0vwf";
const TEST_AMOUNT = 1; // sats
const TEST_COMMENT = "Test zap from zapcampaign-mcp! ⚡";

async function testPrepareZap() {
  try {
    console.log("🚀 Starting zap preparation test...\n");
    const { type, data } = nip19.decode(TEST_NPUB);
    if (type !== "npub") {
      throw new Error("Invalid npub format");
    }
    const recipientPubkey = data as string;
    console.log("📝 Recipient pubkey: " + recipientPubkey);
    console.log("\n⚡ Calling prepareZapPayment from send_zap.ts...");
    const result = await prepareZapPayment(recipientPubkey, TEST_AMOUNT, TEST_COMMENT);
    console.log("✅ Zap preparation completed successfully!\n");
    console.log("💡 In production, pass this invoice to Alby payment MCP to complete the zap.\n");
    return result;
  } catch (error: any) {
    console.error("\n❌ Error: " + error.message);
    throw error;
  }
}

console.log("=".repeat(60));
console.log("⚡ ZAPCAMPAIGN MCP - ZAP PREPARATION TEST");
console.log("=".repeat(60));
console.log("\nTarget: " + TEST_NPUB);
console.log("Amount: " + TEST_AMOUNT + " sats");
console.log("Comment: " + TEST_COMMENT + "\n");
console.log("=".repeat(60) + "\n");

testPrepareZap()
  .then((result) => {
    console.log("=".repeat(60));
    console.log("📋 ZAP DETAILS:");
    console.log("=".repeat(60));
    console.log("Lightning Address: " + result.lightningAddress);
    console.log("Amount: " + result.amount + " sats");
    console.log("Note: " + result.note);
    console.log("\nInvoice:\n" + result.invoice);
    console.log("\n" + "=".repeat(60));
    process.exit(0);
  })
  .catch((error: any) => {
    console.error("\n" + "=".repeat(60));
    console.error("Test failed!");
    process.exit(1);
  });
