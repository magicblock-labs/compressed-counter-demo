import type {
  Rpc,
  RpcSubscriptions,
  SolanaRpcApiMainnet,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  devnet,
} from "@solana/kit";
import { createContext } from "react";

export const RpcContext = createContext<{
  rpc: Rpc<SolanaRpcApiMainnet>; // Limit the API to only those methods found on Mainnet (ie. not `requestAirdrop`)
  rpcEphemeral: Rpc<SolanaRpcApiMainnet>; // Limit the API to only those methods found on Mainnet (ie. not `requestAirdrop`)
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  rpcSubscriptionsEphemeral: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}>({
  rpc: createSolanaRpc("http://localhost:8899"),
  rpcEphemeral: createSolanaRpc(devnet("https://mainnet-tee.magicblock.app")),
  rpcSubscriptions: createSolanaRpcSubscriptions(devnet("ws://localhost:8900")),
  rpcSubscriptionsEphemeral: createSolanaRpcSubscriptions(
    devnet("wss://mainnet-tee.magicblock.app")
  ),
});
