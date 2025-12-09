import type { ClusterUrl } from "@solana/kit";
import { createContext } from "react";

export type ChainContext = Readonly<{
  chain: `solana:${string}`;
  displayName: string;
  setChain?(chain: `solana:${string}`): void;
  solanaExplorerClusterName: "devnet" | "mainnet-beta" | "localhost";
  solanaRpcSubscriptionsUrl: ClusterUrl;
  solanaRpcUrl: ClusterUrl;
}>;

export const DEFAULT_CHAIN_CONFIG = Object.freeze({
  chain: "solana:devnet",
  displayName: "Devnet",
  solanaExplorerClusterName: "devnet",
  solanaRpcSubscriptionsUrl:
    import.meta.env.VITE_RPC_URL?.replace("http", "ws") ??
    `wss://api.devnet.solana.com`,
  solanaRpcUrl: import.meta.env.VITE_RPC_URL ?? `https://api.devnet.solana.com`,
});

export const ChainContext = createContext<ChainContext>(DEFAULT_CHAIN_CONFIG);
