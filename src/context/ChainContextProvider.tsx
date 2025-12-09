import { mainnet, devnet } from "@solana/kit";
import { useMemo, useState } from "react";

import { ChainContext, DEFAULT_CHAIN_CONFIG } from "./ChainContext";
import { DEVNET_PORT } from "../constants";

const STORAGE_KEY = "solana-example-react-app:selected-chain";

export function ChainContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chain, setChain] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? "solana:devnet"
  );
  const contextValue = useMemo<ChainContext>(() => {
    switch (chain) {
      // @ts-expect-error Intentional fall through
      case "solana:mainnet":
        if (import.meta.env.VITE_REACT_EXAMPLE_APP_ENABLE_MAINNET === "true") {
          return {
            chain: "solana:mainnet",
            displayName: "Mainnet Beta",
            solanaExplorerClusterName: "mainnet-beta",
            solanaRpcSubscriptionsUrl: mainnet(
              "wss://api.mainnet-beta.solana.com"
            ),
            solanaRpcUrl: mainnet("https://api.mainnet-beta.solana.com"),
          };
        }
      case "solana:devnet":
        return {
          chain: "solana:devnet",
          displayName: "Devnet",
          solanaExplorerClusterName: "devnet",
          solanaRpcSubscriptionsUrl: devnet(
            import.meta.env.VITE_RPC_URL?.replace("http", "ws") ??
              `wss://api.devnet.solana.com`
          ),
          solanaRpcUrl: devnet(
            import.meta.env.VITE_RPC_URL ?? `https://api.devnet.solana.com`
          ),
        };
      case "solana:localhost":
        return {
          chain: "solana:localhost",
          displayName: "Localhost",
          solanaExplorerClusterName: "localhost",
          solanaRpcSubscriptionsUrl: devnet(
            `ws://localhost:${DEVNET_PORT + 1}`
          ),
          solanaRpcUrl: devnet(`http://localhost:${DEVNET_PORT}`),
        };
      default:
        if (chain !== "solana:devnet") {
          localStorage.removeItem(STORAGE_KEY);
          console.error(`Unrecognized chain \`${chain}\``);
        }
        return DEFAULT_CHAIN_CONFIG;
    }
  }, [chain]);
  return (
    <ChainContext.Provider
      value={useMemo(
        () => ({
          ...contextValue,
          setChain(chain) {
            localStorage.setItem(STORAGE_KEY, chain);
            setChain(chain);
          },
        }),
        [contextValue]
      )}
    >
      {children}
    </ChainContext.Provider>
  );
}
