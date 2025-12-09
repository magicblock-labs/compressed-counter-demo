import { Button } from "@radix-ui/themes";
import { UiWalletAccount } from "@wallet-standard/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useTestDelegation } from "../hooks/useTestDelegation";
import { useRpc } from "../hooks/useRpc";
import { useChain } from "../hooks/useChain";
import {
  extractTransactionSignature,
  buildSolanaExplorerUrl,
} from "../utils/transactionErrors";
import { getErrorMessage } from "../errors";

type ScheduleUndelegateButtonProps = Readonly<{
  payer: UiWalletAccount;
  disabled: boolean;
}>;

export function ScheduleUndelegateButton({
  payer,
  disabled,
}: ScheduleUndelegateButtonProps) {
  const [isDelegating, setIsDelegating] = useState(false);
  const { rpcEphemeral, rpcSubscriptionsEphemeral } = useRpc();
  const { scheduleUndelegateCounter } = useTestDelegation({
    payer,
    rpc: rpcEphemeral,
    rpcSubscriptions: rpcSubscriptionsEphemeral,
  });
  const { solanaExplorerClusterName } = useChain();

  const handleScheduleUndelegateCounter = useCallback(async () => {
    setIsDelegating(true);
    try {
      const signature = await scheduleUndelegateCounter();
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
      setIsDelegating(false);
    }
  }, [scheduleUndelegateCounter, solanaExplorerClusterName]);

  return (
    <Button
      onClick={handleScheduleUndelegateCounter}
      loading={isDelegating}
      disabled={disabled}
    >
      Schedule Undelegate
    </Button>
  );
}
