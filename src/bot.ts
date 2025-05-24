import { xion } from "./client";
import { holesky } from "./client";
import type { TransferAssetsParameters } from "@unionlabs/client";
import * as dotenv from "dotenv";
dotenv.config();

async function autoTransferUSDC(amount: number) {
  // 1. Ambil semua aset yang didukung Xion Testnet, cari USDC
  const assets = await xion.getSupportedAssets();
  const usdc = assets.find(a => a.symbol === "USDC");
  if (!usdc) throw new Error("USDC tidak ditemukan di Xion Testnet");

  // 2. Siapkan payload transfer 0.01 USDC
  const payload = {
    amount: BigInt(Math.floor(amount * 10**usdc.decimals)),  // 0.01 → 1_000_000 (as decimals biasanya 6)
    denomAddress: usdc.denomAddress,
    destinationChainId: "17000",              // Holesky Testnet
    receiver: process.env.RECEIVER!,
    autoApprove: true,
  } satisfies TransferAssetsParameters<"xion-testnet-2">;

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
