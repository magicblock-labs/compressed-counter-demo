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
  rpc: createSolanaRpc(
    import.meta.env.VITE_RPC_URL ?? `https://api.devnet.solana.com`
  ),
  rpcEphemeral: createSolanaRpc(
    devnet(
      import.meta.env.VITE_EPHEMERAL_RPC_URL ??
        `https://testnet-as.magicblock.app`
    )
  ),
  rpcSubscriptions: createSolanaRpcSubscriptions(
    devnet(
      import.meta.env.VITE_RPC_URL?.replace("http", "ws") ??
        `wss://api.devnet.solana.com`
    )
  ),
  rpcSubscriptionsEphemeral: createSolanaRpcSubscriptions(
    devnet(
      import.meta.env.VITE_EPHEMERAL_URL?.replace("http", "ws") ??
        `wss://testnet-as.magicblock.app`
    )
  ),
});
