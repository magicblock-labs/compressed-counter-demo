import { Box, Heading, Card, Flex } from "@radix-ui/themes";
import { IncrementCounterButton } from "./IncrementCounterButton";
import { ScheduleUndelegateButton } from "./ScheduleUndelegateButton";
import { Counter, TEST_DELEGATION_PROGRAM_ADDRESS } from "test-delegation";
import {
  Address,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApiMainnet,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { UiWalletAccount } from "@wallet-standard/react";
import { COMPRESSED_DELEGATION_PROGRAM_ADDRESS } from "compressed-delegation-program";
import { DELEGATION_PROGRAM_ADDRESS } from "../constants";

type EphemeralCardProps = Readonly<{
  selectedWalletAccount: UiWalletAccount;
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  counterEphemeral?: Counter;
  mainnetOwner?: Address;
  ephemeralOwner?: Address;
}>;
export function EphemeralCard({
  selectedWalletAccount,
  rpc,
  rpcSubscriptions,
  counterEphemeral,
  mainnetOwner,
  ephemeralOwner,
}: EphemeralCardProps) {
  return (
    <Box
      maxWidth="240px"
      m="auto"
      style={{
        animation: "fadeInUp 0.6s ease-out 0.2s both",
      }}
    >
      <Card size="2">
        <Flex direction="column" justify="center" gap="2">
          <Heading align="center">Delegated</Heading>
          <Heading size="8" align="center" m="4">
            {counterEphemeral?.counter ?? 0}
          </Heading>
          <IncrementCounterButton
            payer={selectedWalletAccount}
            rpc={rpc}
            rpcSubscriptions={rpcSubscriptions}
            disabled={
              mainnetOwner === TEST_DELEGATION_PROGRAM_ADDRESS ||
              ephemeralOwner === DELEGATION_PROGRAM_ADDRESS ||
              !mainnetOwner
            }
            ephemeral={true}
          />
          <ScheduleUndelegateButton
            payer={selectedWalletAccount}
            disabled={
              mainnetOwner === TEST_DELEGATION_PROGRAM_ADDRESS ||
              ephemeralOwner === DELEGATION_PROGRAM_ADDRESS ||
              !mainnetOwner
            }
          />
        </Flex>
      </Card>
    </Box>
  );
}
