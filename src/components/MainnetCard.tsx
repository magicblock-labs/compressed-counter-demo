import { Box, Card, Flex, Heading } from "@radix-ui/themes";
import { IncrementCounterButton } from "./IncrementCounterButton";
import { DelegateButton } from "./DelegateButton";
import { UndelegateButton } from "./UndelegateButton";
import {
  Address,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApiMainnet,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { Counter, TEST_DELEGATION_PROGRAM_ADDRESS } from "test-delegation";
import { UiWalletAccount } from "@wallet-standard/react";
import { DELEGATION_PROGRAM_ADDRESS } from "../constants";
import { COMPRESSED_DELEGATION_PROGRAM_ADDRESS } from "compressed-delegation-program";

type MainnetCardProps = Readonly<{
  selectedWalletAccount: UiWalletAccount;
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  counterMainnet?: Counter;
  mainnetOwner?: Address;
  ephemeralOwner?: Address;
  fetchCounter?: () => Promise<void>;
}>;

export function MainnetCard({
  selectedWalletAccount,
  rpc,
  rpcSubscriptions,
  counterMainnet,
  mainnetOwner,
  ephemeralOwner,
  fetchCounter,
}: MainnetCardProps) {
  return (
    <Box
      maxWidth="240px"
      m="auto"
      style={{
        animation: "fadeInUp 0.6s ease-out 0.1s both",
      }}
    >
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
            disabled={mainnetOwner === COMPRESSED_DELEGATION_PROGRAM_ADDRESS}
            ephemeral={false}
            fetchCounter={fetchCounter}
          />
          {mainnetOwner === TEST_DELEGATION_PROGRAM_ADDRESS || !mainnetOwner ? (
            <DelegateButton
              payer={selectedWalletAccount}
              fetchCounter={fetchCounter}
            />
          ) : (
            <UndelegateButton
              payer={selectedWalletAccount}
              disabled={
                !(
                  ephemeralOwner === DELEGATION_PROGRAM_ADDRESS.toString() &&
                  mainnetOwner === COMPRESSED_DELEGATION_PROGRAM_ADDRESS
                )
              }
            />
          )}
        </Flex>
      </Card>
    </Box>
  );
}
