import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { ReactNode, useContext, useMemo } from "react";

import { ChainContext } from "./ChainContext";
import { RpcContext } from "./RpcContext";
import { EPHEMERAL_PORT } from "../constants";

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
          rpcEphemeral: createSolanaRpc(`http://localhost:${EPHEMERAL_PORT}`),
          rpcSubscriptions: createSolanaRpcSubscriptions(
            solanaRpcSubscriptionsUrl
          ),
          rpcSubscriptionsEphemeral: createSolanaRpcSubscriptions(
            `ws://localhost:${EPHEMERAL_PORT + 1}`
          ),
        }),
        [solanaRpcSubscriptionsUrl, solanaRpcUrl]
      )}
    >
      {children}
    </RpcContext.Provider>
  );
}
