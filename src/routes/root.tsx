import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Card,
  Text,
} from "@radix-ui/themes";

import { useSelectedWallet } from "../hooks/useSelectedWallet";
import { useCounter } from "../hooks/useCounter";
import { CreateCounterButton } from "../components/CreateCounterButton";
import { IncrementCounterButton } from "../components/IncrementCounterButton";
import { useRpc } from "../hooks/useRpc";
import { DelegateButton } from "../components/DelegateButton";
import { UndelegateButton } from "../components/UndelegateButton";

function Root() {
  const [selectedWalletAccount] = useSelectedWallet();
  const { rpc, rpcSubscriptions, rpcEphemeral, rpcSubscriptionsEphemeral } =
    useRpc();
  const { counterMainnet, counterEphemeral, isDelegated } = useCounter();

  console.log("counterMainnet", counterMainnet);
  console.log("counterEphemeral", counterEphemeral);
  return (
    <Container mx={{ initial: "3", xs: "6" }}>
      {selectedWalletAccount ? (
        <Flex gap="6" direction="column">
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
                <Flex direction="column" justify="center" gap="2">
                  <Heading align="center">Onchain</Heading>
                  <Heading size="8" align="center" m="4">
                    {counterMainnet?.counter ?? 0}
                  </Heading>
                  <IncrementCounterButton
                    payer={selectedWalletAccount}
                    rpc={rpc}
                    rpcSubscriptions={rpcSubscriptions}
                    // disabled={isDelegated}
                  />
                  <DelegateButton
                    payer={selectedWalletAccount}
                    disabled={isDelegated}
                  />
                </Flex>
              </Card>
            </Box>
            <Box maxWidth="240px" m="auto">
              <Card size="2">
                <Flex direction="column" justify="center" gap="2">
                  <Heading align="center">Delegated</Heading>
                  <Heading size="8" align="center" m="4">
                    {counterEphemeral?.counter ?? 0}
                  </Heading>
                  <IncrementCounterButton
                    payer={selectedWalletAccount}
                    rpc={rpcEphemeral}
                    rpcSubscriptions={rpcSubscriptionsEphemeral}
                    // disabled={!isDelegated}
                  />
                  <UndelegateButton
                    payer={selectedWalletAccount}
                    disabled={!isDelegated}
                  />
                </Flex>
              </Card>
            </Box>
          </Grid>
          {!counterMainnet && !isDelegated && (
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
