import { Flex, Grid, Text, Heading, Box, Card } from "@radix-ui/themes";

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
  const {
    counterMainnet,
    counterEphemeral,
    mainnetOwner,
    ephemeralOwner,
    fetchCounter,
  } = useCounter();

  console.log("mainnetOwner", mainnetOwner);
  console.log("ephemeralOwner", ephemeralOwner);
  console.log("counterMainnet", counterMainnet);
  console.log("counterEphemeral", counterEphemeral);

  return (
    <Box
      mx={{ initial: "3", xs: "6" }}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {selectedWalletAccount ? (
        <Flex
          direction="column"
          justify="center"
          align="center"
          gap="6"
          style={{
            padding: "2rem",
          }}
        >
          <Grid
            columns="2"
            width="auto"
            maxWidth="50%"
            justify="between"
            m="auto"
            gap="8"
          >
            <MainnetCard
              selectedWalletAccount={selectedWalletAccount}
              rpc={rpc}
              rpcSubscriptions={rpcSubscriptions}
              counterMainnet={counterMainnet}
              mainnetOwner={mainnetOwner}
              ephemeralOwner={ephemeralOwner}
              fetchCounter={fetchCounter}
            />
            <EphemeralCard
              selectedWalletAccount={selectedWalletAccount}
              rpc={rpcEphemeral}
              rpcSubscriptions={rpcSubscriptionsEphemeral}
              counterEphemeral={counterEphemeral}
              mainnetOwner={mainnetOwner}
              ephemeralOwner={ephemeralOwner}
            />
          </Grid>
        </Flex>
      ) : (
        <Flex
          direction="column"
          align="center"
          gap="6"
          style={{
            marginTop: "4rem",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
            padding: "2rem",
          }}
        >
          <Box
            style={{
              animation: "fadeInUp 0.8s ease-out both",
            }}
          >
            <Heading
              size="8"
              align="center"
              mb="4"
              style={{
                background:
                  "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 30%, #a78bfa 60%, #e2e8f0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontWeight: 800,
                textShadow: "0 0 30px rgba(124, 58, 237, 0.4)",
              }}
            >
              Welcome to Compressed Counter
            </Heading>
          </Box>

          <Card
            size="3"
            style={{
              animation: "fadeInUp 0.8s ease-out 0.2s both",
              width: "100%",
            }}
          >
            <Flex direction="column" gap="4">
              <Heading size="5" align="center" mb="2">
                Get Started
              </Heading>

              <Flex direction="column" gap="3" style={{ padding: "0.5rem 0" }}>
                <Flex gap="3" align="start">
                  <Text
                    size="6"
                    weight="bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      minWidth: "2rem",
                      textAlign: "center",
                    }}
                  >
                    1
                  </Text>
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text size="4" weight="medium">
                      Connect Your Wallet
                    </Text>
                    <Text size="3" color="gray" style={{ lineHeight: 1.6 }}>
                      Click the &ldquo;Connect Wallet&rdquo; button in the top
                      right corner to connect a Solana wallet that supports the
                      Wallet Standard.
                    </Text>
                  </Flex>
                </Flex>

                <Flex gap="3" align="start">
                  <Text
                    size="6"
                    weight="bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      minWidth: "2rem",
                      textAlign: "center",
                    }}
                  >
                    2
                  </Text>
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text size="4" weight="medium">
                      View Your Counter
                    </Text>
                    <Text size="3" color="gray" style={{ lineHeight: 1.6 }}>
                      Once connected, you&rsquo;ll see two counter cards: one
                      for onchain state and one for ephemeral state.
                    </Text>
                  </Flex>
                </Flex>

                <Flex gap="3" align="start">
                  <Text
                    size="6"
                    weight="bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      minWidth: "2rem",
                      textAlign: "center",
                    }}
                  >
                    3
                  </Text>
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text size="4" weight="medium">
                      Blazing speed, ultra light costs
                    </Text>
                    <Text size="3" color="gray" style={{ lineHeight: 1.6 }}>
                      Delegate your counter to start using the compressed
                      version for almost 0 rent and high speed.
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Card>

          <Text
            size="3"
            color="gray"
            align="center"
            style={{
              animation: "fadeInUp 0.8s ease-out 0.4s both",
              opacity: 0.8,
            }}
          >
            Make sure you have a Solana wallet extension installed in your
            browser.
          </Text>
        </Flex>
      )}
    </Box>
  );
}

export default Root;
