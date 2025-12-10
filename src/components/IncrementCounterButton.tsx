import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useTestDelegation } from "../hooks/useTestDelegation";
import {
  Rpc,
  RpcSubscriptions,
  SolanaRpcApiMainnet,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import { useChain } from "../hooks/useChain";
import {
  extractTransactionSignature,
  buildSolanaExplorerUrl,
} from "../utils/transactionErrors";
import { getErrorMessage } from "../errors";

type IncrementCounterButtonProps = Readonly<{
  payer: UiWalletAccount;
  rpc: Rpc<SolanaRpcApiMainnet>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  disabled?: boolean;
  ephemeral?: boolean;
  fetchCounter?: () => Promise<void>;
}>;

export function IncrementCounterButton({
  payer,
  rpc,
  rpcSubscriptions,
  disabled,
  ephemeral,
  fetchCounter,
}: IncrementCounterButtonProps) {
  const [isIncrementingCounter, setIsIncrementingCounter] = useState(false);
  const { incrementCounter } = useTestDelegation({
    payer,
    rpc,
    rpcSubscriptions,
    ephemeral,
    fetchCounter,
  });
  const { solanaExplorerClusterName } = useChain();

  const handleIncrementCounter = useCallback(async () => {
    setIsIncrementingCounter(true);
    try {
      const signature = await incrementCounter();
      console.log(signature);
    } catch (error) {
      console.error(error);
      const signature = extractTransactionSignature(error);
      const errorMessage = getErrorMessage(error, "Transaction failed");

      if (signature) {
        const explorerUrl = buildSolanaExplorerUrl(
          signature,
          solanaExplorerClusterName
        );
        toast.error("Transaction failed", {
          description: (
            <div>
              <div style={{ marginBottom: "8px" }}>{errorMessage}</div>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#3b82f6",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                View on Solana Explorer
              </a>
            </div>
          ),
          duration: 10000,
        });
      } else {
        toast.error("Transaction failed", {
          description: errorMessage,
          duration: 5000,
        });
      }
    } finally {
      setIsIncrementingCounter(false);
    }
  }, [incrementCounter, solanaExplorerClusterName]);

  return (
    <Button
      onClick={handleIncrementCounter}
      loading={isIncrementingCounter}
      disabled={disabled}
    >
      Increment Counter
    </Button>
  );
}
