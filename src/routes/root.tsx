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
import { COMPRESSED_DELEGATION_PROGRAM_ADDRESS } from "compressed-delegation-program";
import { ScheduleUndelegateButton } from "../components/ScheduleUndelegateButton";
import { DELEGATION_PROGRAM_ADDRESS } from "../constants";
import { TEST_DELEGATION_PROGRAM_ADDRESS } from "test-delegation";

function Root() {
  const [selectedWalletAccount] = useSelectedWallet();
  const { rpc, rpcSubscriptions, rpcEphemeral, rpcSubscriptionsEphemeral } =
    useRpc();
  const { counterMainnet, counterEphemeral, mainnetOwner, ephemeralOwner } =
    useCounter();
  console.log("mainnet", counterMainnet);
  console.log("ephemeral", counterEphemeral);
  console.log("mainnetOwner", mainnetOwner);
  console.log("ephemeralOwner", ephemeralOwner);

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
                    disabled={mainnetOwner !== TEST_DELEGATION_PROGRAM_ADDRESS}
                  />
                  {mainnetOwner === TEST_DELEGATION_PROGRAM_ADDRESS ? (
                    <DelegateButton payer={selectedWalletAccount} />
                  ) : (
                    <UndelegateButton
                      payer={selectedWalletAccount}
                      disabled={
                        !(
                          ephemeralOwner ===
                            DELEGATION_PROGRAM_ADDRESS.toString() &&
                          mainnetOwner === COMPRESSED_DELEGATION_PROGRAM_ADDRESS
                        )
                      }
                    />
                  )}
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
                    disabled={mainnetOwner === TEST_DELEGATION_PROGRAM_ADDRESS}
                  />
                  <ScheduleUndelegateButton
                    payer={selectedWalletAccount}
                    disabled={
                      ephemeralOwner !== TEST_DELEGATION_PROGRAM_ADDRESS
                    }
                  />
                </Flex>
              </Card>
            </Box>
          </Grid>
          {!counterMainnet &&
            mainnetOwner !== COMPRESSED_DELEGATION_PROGRAM_ADDRESS && (
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
