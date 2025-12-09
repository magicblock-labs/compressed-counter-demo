import type { ClusterUrl } from "@solana/kit";
import { createContext } from "react";
import { DEVNET_PORT } from "../constants";

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
  solanaRpcSubscriptionsUrl: `ws://localhost:${DEVNET_PORT + 1}`,
  solanaRpcUrl: `http://localhost:${DEVNET_PORT}`,
});

export const ChainContext = createContext<ChainContext>(DEFAULT_CHAIN_CONFIG);
