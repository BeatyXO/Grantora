import { createClient } from "genlayer-js";
import { localnet, studionet, testnetAsimov, testnetBradbury } from "genlayer-js/chains";

const chainMap = {
  localnet,
  studionet,
  testnetAsimov,
  testnetBradbury,
} as const;

export type GrantoraNetwork = keyof typeof chainMap;

export function getGrantoraRuntimeConfig() {
  const network = (process.env.NEXT_PUBLIC_GENLAYER_NETWORK as GrantoraNetwork | undefined) ?? "studionet";
  const endpoint =
    process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? chainMap[network].rpcUrls.default.http[0] ?? "https://studio.genlayer.com/api";
  const contractAddress = process.env.NEXT_PUBLIC_GRANTORA_CONTRACT_ADDRESS;

  return {
    network,
    endpoint,
    contractAddress,
    chain: chainMap[network],
  };
}

export function createGrantoraReadClient() {
  const config = getGrantoraRuntimeConfig();
  return createClient({
    chain: config.chain,
    endpoint: config.endpoint,
  });
}

export function createGrantoraWriteClient(address: `0x${string}`, provider: unknown) {
  const config = getGrantoraRuntimeConfig();
  return createClient({
    chain: config.chain,
    endpoint: config.endpoint,
    account: address,
    provider: provider as never,
  });
}
