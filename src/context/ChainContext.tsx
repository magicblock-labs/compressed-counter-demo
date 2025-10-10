import type { ClusterUrl } from "@solana/kit";
import { createContext } from "react";

export type ChainContext = Readonly<{
  chain: `solana:${string}`;
  displayName: string;
  setChain?(chain: `solana:${string}`): void;
  solanaExplorerClusterName: "devnet" | "mainnet-beta" | "testnet";
  solanaRpcSubscriptionsUrl: ClusterUrl;
  solanaRpcUrl: ClusterUrl;
}>;

export const DEFAULT_CHAIN_CONFIG = Object.freeze({
  chain: "solana:devnet",
  displayName: "Localhost",
  solanaExplorerClusterName: "devnet",
  solanaRpcSubscriptionsUrl: "ws://localhost:8900",
  solanaRpcUrl: "http://localhost:8899",
});

export const ChainContext = createContext<ChainContext>(DEFAULT_CHAIN_CONFIG);
