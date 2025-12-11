import "./polyfills";
import "./index.css";
import "@radix-ui/themes/styles.css";

import { Flex, Section, Theme } from "@radix-ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { Nav } from "./components/Nav.tsx";
import { ChainContextProvider } from "./context/ChainContextProvider.tsx";
import { RpcContextProvider } from "./context/RpcContextProvider.tsx";
import { SelectedWalletAccountContextProvider } from "./context/SelectedWalletAccountContextProvider.tsx";
import Root from "./routes/root.tsx";
import { featureFlags, VERSION } from "@lightprotocol/stateless.js";
import { CommitmentContextProvider } from "./context/CommitmentContextProvider.tsx";

featureFlags.version = VERSION.V2;
const rootNode = document.getElementById("root")!;
const root = createRoot(rootNode);
root.render(
  <StrictMode>
    <Theme appearance="dark">
      <ChainContextProvider>
        <SelectedWalletAccountContextProvider>
          <RpcContextProvider>
            <CommitmentContextProvider>
              <Flex direction="column" style={{ minHeight: "100vh" }}>
                <Nav />
                <Section
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <Root />
                </Section>
              </Flex>
              <Toaster position="top-right" />
            </CommitmentContextProvider>
          </RpcContextProvider>
        </SelectedWalletAccountContextProvider>
      </ChainContextProvider>
    </Theme>
  </StrictMode>
);
