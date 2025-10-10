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
          rpcEphemeral: createSolanaRpc("http://localhost:7799"),
          rpcSubscriptions: createSolanaRpcSubscriptions(
            solanaRpcSubscriptionsUrl
          ),
          rpcSubscriptionsEphemeral: createSolanaRpcSubscriptions(
            "ws://localhost:7800"
          ),
        }),
        [solanaRpcSubscriptionsUrl, solanaRpcUrl]
      )}
    >
      {children}
    </RpcContext.Provider>
  );
}
