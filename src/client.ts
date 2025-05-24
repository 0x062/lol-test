// src/client.ts
import { createUnionClient, http } from "@unionlabs/client";
import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
dotenv.config();

export interface Clients {
  xion: ReturnType<typeof createUnionClient>;
  holesky: ReturnType<typeof createUnionClient>;
}

export async function getClients(): Promise<Clients> {
  const PK = process.env.PRIVATE_KEY;
  if (!PK) throw new Error("Env PRIVATE_KEY belum di-set");

  // Xion = union-testnet-9 (alias Xion Testnet-2)
  const xion = createUnionClient({
    chainId: "union-testnet-9",                // gunakan ID ini, bukan xion-testnet-2
    transport: http("https://rpc.xion-testnet-2.burnt.com:443"),
    account: await DirectSecp256k1Wallet.fromKey(
      Uint8Array.from(Buffer.from(PK, "hex")),
      "xion"
    ),
  });

  // Holesky Testnet
  const holesky = createUnionClient({
    chainId: "17000",
    transport: http("https://rpc.holesky.ethpandaops.io"),
    account: privateKeyToAccount(`0x${PK}`),
  });

  return { xion, holesky };
}
