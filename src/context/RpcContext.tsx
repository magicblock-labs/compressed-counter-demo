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
import { DEVNET_PORT, EPHEMERAL_PORT } from "../constants";

export const RpcContext = createContext<{
  rpc: Rpc<SolanaRpcApiMainnet>; // Limit the API to only those methods found on Mainnet (ie. not `requestAirdrop`)
  rpcEphemeral: Rpc<SolanaRpcApiMainnet>; // Limit the API to only those methods found on Mainnet (ie. not `requestAirdrop`)
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  rpcSubscriptionsEphemeral: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
}>({
  rpc: createSolanaRpc(`http://localhost:${DEVNET_PORT}`),
  rpcEphemeral: createSolanaRpc(devnet(`http://localhost:${EPHEMERAL_PORT}`)),
  rpcSubscriptions: createSolanaRpcSubscriptions(
    devnet(`ws://localhost:${DEVNET_PORT + 1}`)
  ),
  rpcSubscriptionsEphemeral: createSolanaRpcSubscriptions(
    devnet(`ws://localhost:${EPHEMERAL_PORT + 1}`)
  ),
});
