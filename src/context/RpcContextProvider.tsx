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
          rpcEphemeral: createSolanaRpc(`https://testnet-as.magicblock.app`),
          rpcSubscriptions: createSolanaRpcSubscriptions(
            solanaRpcSubscriptionsUrl
          ),
          rpcSubscriptionsEphemeral: createSolanaRpcSubscriptions(
            `wss://testnet-as.magicblock.app`
          ),
        }),
        [solanaRpcSubscriptionsUrl, solanaRpcUrl]
      )}
    >
      {children}
    </RpcContext.Provider>
  );
}
