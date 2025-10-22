import { PaidMcpServer } from "@getalby/paidmcp";
import { z } from "zod";
import {
  SimplePool,
  nip57,
  finalizeEvent,
  generateSecretKey,
  nip19,
} from "nostr-tools";

const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
];

/**
 * Fetch user's Lightning address from Nostr profile
 */
async function getLightningAddress(pubkey: string): Promise<string | null> {
  const pool = new SimplePool();

  try {
    const events = await pool.querySync(DEFAULT_RELAYS, {
      kinds: [0], // Profile metadata
      authors: [pubkey],
      limit: 1,
    });

    if (events.length === 0) {
      return null;
    }

    const event = events[0];
    const metadata = JSON.parse(event.content);

    // Check for lud16 (Lightning address) or lud06 (LNURL)
    return metadata.lud16 || metadata.lud06 || null;
  } catch (error: any) {
    process.stderr.write(
      `Error fetching Lightning address: ${error.message}\n`
    );
    return null;
  } finally {
    // Ensure pool is closed
    pool.close(DEFAULT_RELAYS);
  }
}

/**
 * Create a proper NIP-57 zap request event
 */
async function createZapRequest(
  recipientPubkey: string,
  amount: number,
  content: string
): Promise<string> {
  // Generate ephemeral key for the zap request
  const sk = generateSecretKey();

  const zapRequest = finalizeEvent(
    {
      kind: 9734, // NIP-57 zap request
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["p", recipientPubkey], // Recipient pubkey
        ["amount", (amount * 1000).toString()], // Amount in millisats
        ["relays", ...DEFAULT_RELAYS],
      ],
      content: content,
    },
    sk
  );

  return JSON.stringify(zapRequest);
}

/**
 * Fetch invoice from LNURL/Lightning address with timeout
 */
async function getInvoiceFromLNURL(
  lnurl: string,
  amount: number,
  zapRequest: string
): Promise<string> {
  const timeout = 10000; // 10 second timeout

  try {
    // If it's a Lightning address (user@domain.com), convert to LNURL
    let lnurlEndpoint: string;

    if (lnurl.includes("@")) {
      const [username, domain] = lnurl.split("@");
      lnurlEndpoint = `https://${domain}/.well-known/lnurlp/${username}`;
    } else {
      // Decode LNURL if needed
      lnurlEndpoint = lnurl;
    }

    // Fetch LNURL metadata with timeout
    const metadataResponse = await Promise.race([
      fetch(lnurlEndpoint),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("LNURL metadata fetch timeout")),
          timeout
        )
      ),
    ]);
    const metadata: any = await metadataResponse.json();

    if (!metadata.callback) {
      throw new Error("Invalid LNURL response");
    }

    // Check if it supports zaps (NIP-57)
    const allowsNostr = metadata.allowsNostr === true;

    // Request invoice
    const invoiceUrl = new URL(metadata.callback);
    invoiceUrl.searchParams.set("amount", (amount * 1000).toString()); // millisats

    if (allowsNostr && zapRequest) {
      invoiceUrl.searchParams.set("nostr", zapRequest);
    }

    const invoiceResponse = await Promise.race([
      fetch(invoiceUrl.toString()),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Invoice fetch timeout")), timeout)
      ),
    ]);
    const invoiceData: any = await invoiceResponse.json();

    if (!invoiceData.pr) {
      throw new Error("Failed to get invoice from LNURL");
    }

    return invoiceData.pr; // Payment request (invoice)
  } catch (error: any) {
    throw new Error(`LNURL invoice fetch failed: ${error.message}`);
  }
}

/**
 * Prepare zap payment details for Alby payment MCP
 * Returns all the information needed for another MCP to execute the payment
 * Accepts both hex pubkey and npub format
 */
export async function prepareZapPayment(
  pubkeyOrNpub: string,
  amount: number,
  note: string
): Promise<{
  lightningAddress: string;
  amount: number;
  invoice: string;
  zapRequest: string;
  note: string;
}> {
  try {
    // Decode npub to hex if needed
    let pubkey = pubkeyOrNpub;
    if (pubkeyOrNpub.startsWith("npub")) {
      const decoded = nip19.decode(pubkeyOrNpub);
      if (decoded.type !== "npub") {
        throw new Error("Invalid npub format");
      }
      pubkey = decoded.data as string;
    }

    // 1. Fetch recipient's Lightning address from Nostr profile
    const lightningAddress = await getLightningAddress(pubkey);

    if (!lightningAddress) {
      throw new Error(
        `No Lightning address found for pubkey ${pubkey.substring(0, 16)}...`
      );
    }

    // 2. Create NIP-57 zap request
    const zapRequest = await createZapRequest(pubkey, amount, note);

    // 3. Get invoice from LNURL/Lightning address
    const invoice = await getInvoiceFromLNURL(
      lightningAddress,
      amount,
      zapRequest
    );

    return {
      lightningAddress,
      amount,
      invoice,
      zapRequest,
      note,
    };
  } catch (error: any) {
    // Sanitize error message
    const errorMessage = error.message || "Unknown error";
    throw new Error(`Failed to prepare zap: ${errorMessage}`);
  }
}

export function registerPrepareZapTool(server: PaidMcpServer) {
  server.registerTool(
    "prepareZap",
    {
      title: "Prepare Zap Payment",
      description:
        "Prepare a Lightning zap (tip) payment details for a Nostr pubkey. Accepts both hex pubkey and npub format. Fetches Lightning address, creates NIP-57 zap request, and generates invoice. Returns payment details for the Alby payment MCP to execute.",
      inputSchema: {
        pubkey: z
          .string()
          .min(1)
          .describe("The Nostr pubkey (hex or npub format) to send zap to"),
        amount: z.number().int().positive().describe("Amount of sats to send"),
        note: z
          .string()
          .default("")
          .describe("Optional note/message for the zap"),
      },
      outputSchema: {
        status: z.enum(["success", "failed"]),
        lightningAddress: z.string().optional(),
        amount: z.number().optional(),
        invoice: z.string().optional(),
        zapRequest: z.string().optional(),
        note: z.string().optional(),
        error: z.string().optional(),
      },
    },
    async (params) => {
      try {
        const { pubkey, amount, note } = params;

        // Prepare zap payment details
        const result = await prepareZapPayment(pubkey, amount, note || "");

        return {
          content: [
            {
              type: "text",
              text:
                `⚡ Zap payment details prepared!\n\n` +
                `Lightning Address: ${result.lightningAddress}\n` +
                `Amount: ${result.amount} sats\n` +
                `Note: ${result.note || "(none)"}\n\n` +
                `📋 Invoice (ready for payment):\n${result.invoice}\n\n` +
                `💡 Use Alby payment MCP to pay this invoice and complete the zap.`,
            },
          ],
          structuredContent: {
            status: "success" as const,
            lightningAddress: result.lightningAddress,
            amount: result.amount,
            invoice: result.invoice,
            zapRequest: result.zapRequest,
            note: result.note,
          },
        };
      } catch (error: any) {
        const errorMsg =
          typeof error.message === "string"
            ? error.message
            : "Failed to prepare zap payment";

        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to prepare zap: ${errorMsg}`,
            },
          ],
          structuredContent: {
            status: "failed" as const,
            error: errorMsg,
          },
          isError: true,
        };
      }
    }
  );
}
