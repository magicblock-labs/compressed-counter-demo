import { Container, Flex, Grid, Text } from "@radix-ui/themes";

import { useSelectedWallet } from "../hooks/useSelectedWallet";
import { useCounter } from "../hooks/useCounter";
import { useRpc } from "../hooks/useRpc";
import "../components/Card.css";
import "./Counter.css";
import { MainnetCard } from "../components/MainnetCard";
import { EphemeralCard } from "../components/EphemeralCard";

function Root() {
  const [selectedWalletAccount] = useSelectedWallet();
  const { rpc, rpcSubscriptions, rpcEphemeral, rpcSubscriptionsEphemeral } =
    useRpc();
  const { counterMainnet, counterEphemeral, mainnetOwner, ephemeralOwner } =
    useCounter();

  console.log("mainnetOwner", mainnetOwner);
  console.log("ephemeralOwner", ephemeralOwner);
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
            <MainnetCard
              selectedWalletAccount={selectedWalletAccount}
              rpc={rpc}
              rpcSubscriptions={rpcSubscriptions}
              counterMainnet={counterMainnet}
              mainnetOwner={mainnetOwner}
              ephemeralOwner={ephemeralOwner}
            />
            <EphemeralCard
              selectedWalletAccount={selectedWalletAccount}
              rpc={rpcEphemeral}
              rpcSubscriptions={rpcSubscriptionsEphemeral}
              counterEphemeral={counterEphemeral}
              ephemeralOwner={ephemeralOwner}
            />
          </Grid>
        </Flex>
      ) : (
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{ marginTop: "4rem" }}
        >
          <Text
            as="p"
            size="5"
            weight="medium"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "fadeInUp 0.8s ease-out",
            }}
          >
            Click &ldquo;Connect Wallet&rdquo; to get started.
          </Text>
        </Flex>
      )}
    </Container>
  );
}

export default Root;
