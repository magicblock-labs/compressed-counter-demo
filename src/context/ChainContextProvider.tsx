import { mainnet, devnet } from "@solana/kit";
import { useMemo, useState } from "react";

import { ChainContext, DEFAULT_CHAIN_CONFIG } from "./ChainContext";
import { DEVNET_PORT, EPHEMERAL_PORT } from "../constants";

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
            ephemeralRpcSubscriptionsUrl: mainnet(
              "wss://testnet-as.magicblock.app"
            ),
            ephemeralRpcUrl: mainnet("https://testnet-as.magicblock.app"),
            photonUrl: mainnet(
              import.meta.env.VITE_RPC_URL ?? `http://localhost:8784`
            ),
            proverUrl: mainnet(
              import.meta.env.VITE_RPC_URL ?? `http://localhost:3001`
            ),
          };
        }
      case "solana:devnet":
        return {
          chain: "solana:devnet",
          displayName: "Devnet",
          solanaExplorerClusterName: "devnet",
          solanaRpcSubscriptionsUrl: devnet(
            import.meta.env.VITE_RPC_WS_URL ?? `wss://api.devnet.solana.com`
          ),
          solanaRpcUrl: devnet(
            import.meta.env.VITE_RPC_URL ?? `https://api.devnet.solana.com`
          ),
          ephemeralRpcSubscriptionsUrl: devnet(
            import.meta.env.VITE_EPHEMERAL_WS_URL ??
              `wss://testnet-as.magicblock.app`
          ),
          ephemeralRpcUrl: devnet(
            import.meta.env.VITE_EPHEMERAL_URL ??
              `https://testnet-as.magicblock.app`
          ),
          photonUrl: devnet(
            import.meta.env.VITE_RPC_URL ?? `http://localhost:8784`
          ),
          proverUrl: devnet(
            import.meta.env.VITE_RPC_URL ?? `http://localhost:3001`
          ),
        };
      case "solana:localnet":
        return {
          chain: "solana:localnet",
          displayName: "Localnet",
          solanaExplorerClusterName: "localnet",
          solanaRpcSubscriptionsUrl: devnet(
            `ws://localhost:${DEVNET_PORT + 1}`
          ),
          solanaRpcUrl: devnet(`http://localhost:${DEVNET_PORT}`),
          ephemeralRpcSubscriptionsUrl: devnet(
            `ws://localhost:${EPHEMERAL_PORT + 1}`
          ),
          ephemeralRpcUrl: devnet(`http://localhost:${EPHEMERAL_PORT}`),
          photonUrl: devnet(`http://localhost:8784`),
          proverUrl: devnet(`http://localhost:3001`),
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
