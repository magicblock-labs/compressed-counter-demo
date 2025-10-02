import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { ReactNode, useContext, useMemo } from "react";

import { ChainContext } from "./ChainContext";
import { RpcContext } from "./RpcContext";

type Props = Readonly<{
  children: ReactNode;
}>;

export function RpcContextProvider({ children }: Props) {
  const { solanaRpcSubscriptionsUrl, solanaRpcUrl } = useContext(ChainContext);
  return (
    <RpcContext.Provider
      value={useMemo(
        () => ({
          rpc: createSolanaRpc(solanaRpcUrl),
          rpcEphemeral: createSolanaRpc("https://mainnet-tee.magicblock.app"),
          rpcSubscriptions: createSolanaRpcSubscriptions(
            solanaRpcSubscriptionsUrl
          ),
          rpcSubscriptionsEphemeral: createSolanaRpcSubscriptions(
            "wss://mainnet-tee.magicblock.app"
          ),
        }),
        [solanaRpcSubscriptionsUrl, solanaRpcUrl]
      )}
    >
      {children}
    </RpcContext.Provider>
  );
}
