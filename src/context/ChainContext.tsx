import type { ClusterUrl } from "@solana/kit";
import { createContext } from "react";

export type ChainContext = Readonly<{
  chain: `solana:${string}`;
  displayName: string;
  setChain?(chain: `solana:${string}`): void;
  solanaExplorerClusterName: "devnet" | "mainnet-beta" | "localnet";
  solanaRpcSubscriptionsUrl: ClusterUrl;
  solanaRpcUrl: ClusterUrl;
  ephemeralRpcSubscriptionsUrl: ClusterUrl;
  ephemeralRpcUrl: ClusterUrl;
  photonUrl: string;
  proverUrl: string;
}>;

export const DEFAULT_CHAIN_CONFIG = Object.freeze({
  chain: "solana:devnet",
  displayName: "Devnet",
  solanaExplorerClusterName: "devnet",
  solanaRpcSubscriptionsUrl:
    import.meta.env.VITE_RPC_WS_URL ?? `wss://api.devnet.solana.com`,
  solanaRpcUrl: import.meta.env.VITE_RPC_URL ?? `https://api.devnet.solana.com`,
  ephemeralRpcSubscriptionsUrl:
    import.meta.env.VITE_EPHEMERAL_WS_URL ?? `wss://testnet-as.magicblock.app`,
  ephemeralRpcUrl:
    import.meta.env.VITE_EPHEMERAL_URL ?? `https://testnet-as.magicblock.app`,
  photonUrl: import.meta.env.VITE_RPC_URL ?? `http://localhost:8784`,
  proverUrl: import.meta.env.VITE_RPC_URL ?? `http://localhost:3001`,
});

export const ChainContext = createContext<ChainContext>(DEFAULT_CHAIN_CONFIG);
