import {
  Box,
  Code,
  Container,
  DataList,
  Flex,
  Grid,
  Heading,
  Inset,
  Card,
  Spinner,
  Strong,
  Text,
  Button,
} from "@radix-ui/themes";
import { getUiWalletAccountStorageKey } from "@wallet-standard/react";
import { Suspense, useContext } from "react";

import { ChainContext } from "../context/ChainContext";
import { useSelectedWallet } from "../hooks/useSelectedWallet";
import { useCounter } from "../hooks/useCounter";
import { CreateCounterButton } from "../components/CreateCounterButton";
import { useTestDelegation } from "../hooks/useTestDelegation";
import { IncrementCounterButton } from "../components/IncrementCounterButton";
import { useRpc } from "../hooks/useRpc";

function Root() {
  const { chain } = useContext(ChainContext);
  const [selectedWalletAccount] = useSelectedWallet();
  const { rpc, rpcSubscriptions, rpcEphemeral, rpcSubscriptionsEphemeral } =
    useRpc();
  const errorBoundaryResetKeys = [
    chain,
    selectedWalletAccount &&
      getUiWalletAccountStorageKey(selectedWalletAccount),
  ].filter(Boolean);
  const { counterMainnet, counterEphemeral } = useCounter();

  console.log("counterMainnet", counterMainnet);
  console.log("counterEphemeral", counterEphemeral);
  return (
    <Container mx={{ initial: "3", xs: "6" }}>
      {selectedWalletAccount ? (
        <Flex gap="6" direction="column">
          {/* <Flex gap="2">
            <Flex align="center" gap="3" flexGrow="1">
              <WalletAccountIcon
                account={selectedWalletAccount}
                height="48"
                width="48"
              />
              <Box>
                <Heading as="h4" size="3">
                  {selectedWalletAccount.label ?? "Unlabeled Account"}
                </Heading>
                <Code
                  variant="outline"
                  truncate
                  size={{ initial: "1", xs: "2" }}
                >
                  {selectedWalletAccount.address}
                </Code>
              </Box>
            </Flex>
            <Flex direction="column" align="end">
              <Heading as="h4" size="3">
                Balance
              </Heading>
              <ErrorBoundary
                fallback={<Text>&ndash;</Text>}
                key={`${selectedWalletAccount.address}:${chain}`}
              >
                <Suspense fallback={<Spinner loading my="1" />}>
                  <Balance account={selectedWalletAccount} />
                </Suspense>
              </ErrorBoundary>
            </Flex>
          </Flex>
          <DataList.Root
            orientation={{ initial: "vertical", sm: "horizontal" }}
            size="3"
          >
            <FeaturePanel label="Sign Message">
              <ErrorBoundary
                FallbackComponent={FeatureNotSupportedCallout}
                resetKeys={errorBoundaryResetKeys}
              >
                <SolanaSignMessageFeaturePanel
                  account={selectedWalletAccount}
                />
              </ErrorBoundary>
            </FeaturePanel>
            <FeaturePanel label="Sign And Send Transaction">
              <ErrorBoundary
                FallbackComponent={FeatureNotSupportedCallout}
                resetKeys={errorBoundaryResetKeys}
              >
                <SolanaSignAndSendTransactionFeaturePanel
                  account={selectedWalletAccount}
                />
              </ErrorBoundary>
            </FeaturePanel>
            <FeaturePanel label="Sign Transaction">
              <ErrorBoundary
                FallbackComponent={FeatureNotSupportedCallout}
                resetKeys={errorBoundaryResetKeys}
              >
                <SolanaSignTransactionFeaturePanel
                  account={selectedWalletAccount}
                />
              </ErrorBoundary>
            </FeaturePanel>
          </DataList.Root> */}
          <Grid
            columns="2"
            width="auto"
            maxWidth="50%"
            justify="between"
            m="auto"
            gap="4"
          >
            <Box maxWidth="240px" m="auto">
              <Card size="2">
                <Flex direction="column" justify="center">
                  <Heading align="center">Onchain</Heading>
                  <Heading size="8" align="center" m="4">
                    {counterMainnet?.counter ?? 0}
                  </Heading>
                  <IncrementCounterButton
                    payer={selectedWalletAccount}
                    rpc={rpc}
                    rpcSubscriptions={rpcSubscriptions}
                  />
                </Flex>
              </Card>
            </Box>
            <Box maxWidth="240px" m="auto">
              <Card size="2">
                <Flex direction="column" justify="center">
                  <Heading align="center">Delegated</Heading>
                  <Heading size="8" align="center" m="4">
                    {counterEphemeral?.counter ?? 0}
                  </Heading>
                  <IncrementCounterButton
                    payer={selectedWalletAccount}
                    rpc={rpcEphemeral}
                    rpcSubscriptions={rpcSubscriptionsEphemeral}
                  />
                </Flex>
              </Card>
            </Box>
          </Grid>
          {!counterMainnet && (
            <CreateCounterButton payer={selectedWalletAccount} />
          )}
        </Flex>
      ) : (
        <Text as="p">Click &ldquo;Connect Wallet&rdquo; to get started.</Text>
      )}
    </Container>
  );
}

export default Root;
