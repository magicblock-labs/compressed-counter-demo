import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { ReactNode, useContext, useMemo } from "react";

import { ChainContext } from "./ChainContext";
import { RpcContext } from "./RpcContext";

type Props = Readonly<{
  children: ReactNode;
}>;

export function RpcContextProvider({ children }: Props) {
  const {
    solanaRpcSubscriptionsUrl,
    solanaRpcUrl,
    ephemeralRpcSubscriptionsUrl,
    ephemeralRpcUrl,
  } = useContext(ChainContext);
  return (
    <RpcContext.Provider
      value={useMemo(
        () => ({
          rpc: createSolanaRpc(solanaRpcUrl),
          rpcEphemeral: createSolanaRpc(ephemeralRpcUrl),
          rpcSubscriptions: createSolanaRpcSubscriptions(
            solanaRpcSubscriptionsUrl
          ),
          rpcSubscriptionsEphemeral: createSolanaRpcSubscriptions(
            ephemeralRpcSubscriptionsUrl
          ),
        }),
        [
          solanaRpcSubscriptionsUrl,
          solanaRpcUrl,
          ephemeralRpcSubscriptionsUrl,
          ephemeralRpcUrl,
        ]
      )}
    >
      {children}
    </RpcContext.Provider>
  );
}
