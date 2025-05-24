// src/bot.ts
import * as dotenv from "dotenv";
dotenv.config();

import { getClients } from "./client";
import type { TransferAssetsParameters } from "@unionlabs/client";

async function autoTransferUSDC(amount: number) {
  const { xion } = await getClients();

  // 1. Ambil asset USDC dari Xion (union-testnet-9)
  const assets = await xion.getSupportedAssets();
  const usdc = assets.find(a => a.symbol === "USDC");
  if (!usdc) throw new Error("USDC tidak ditemukan di Xion Testnet");

  // 2. Siapkan payload transfer 0.01 USDC
  const decimals = usdc.decimals; // biasanya 6
  const rawAmount = BigInt(Math.floor(amount * 10 ** decimals));

  const payload = {
    amount: rawAmount,
    denomAddress: usdc.denomAddress,
    destinationChainId: "17000",           // Holesky Testnet
    receiver: process.env.RECEIVER!,
    autoApprove: true,
  } satisfies TransferAssetsParameters<"union-testnet-9">;

  // 3. Kirim transaksi
  const res = await xion.transferAsset(payload);
  if (res.isErr()) {
    console.error("[Xion→Holesky] Transfer gagal:", res.error);
  } else {
    console.log("[Xion→Holesky] Tx hash:", res.value);
  }
}

async function main() {
  console.log("Mulai auto-transfer 0.01 USDC setiap 5 menit…");
  await autoTransferUSDC(0.01);

  setInterval(() => {
    autoTransferUSDC(0.01).catch(console.error);
  }, 5 * 60_000);
}

main().catch(console.error);
